import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FileText, Trash2, Loader2, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface Newspaper {
  id: string;
  upload_date: string;
  file_name: string;
  file_path: string;
  file_size: number;
  status: string;
  created_at: string;
}

interface NewspapersListProps {
  userId: string;
}

const NewspapersList = ({ userId }: NewspapersListProps) => {
  const [newspapers, setNewspapers] = useState<Newspaper[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadNewspapers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("newspapers")
        .select("*")
        .eq("user_id", userId)
        .order("upload_date", { ascending: false });

      if (error) throw error;
      setNewspapers(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load newspapers",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNewspapers();

    // Listen for upload events
    const handleUpload = () => loadNewspapers();
    window.addEventListener("newspaper-uploaded", handleUpload);

    return () => {
      window.removeEventListener("newspaper-uploaded", handleUpload);
    };
  }, [userId]);

  const handleDelete = async (newspaper: Newspaper) => {
    if (!confirm("Are you sure you want to delete this newspaper?")) return;

    setDeletingId(newspaper.id);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("newspapers")
        .remove([newspaper.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("newspapers")
        .delete()
        .eq("id", newspaper.id);

      if (dbError) throw dbError;

      toast({
        title: "Deleted successfully",
        description: "Newspaper has been removed.",
      });

      loadNewspapers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: error.message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleProcess = async (newspaper: Newspaper) => {
    setIsLoading(true);
    try {
      console.log("Newspaper id to process: ", newspaper.id)
      const { error } = await supabase.functions.invoke('process-newspaper', {
        body: { newspaperId: newspaper.id }
      });

      if (error) throw error;

      toast({
        title: "Processing started",
        description: "Your newspaper is being analyzed. This may take a few minutes.",
      });

      // Reload the list to show updated status
      setTimeout(loadNewspapers, 2000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to process newspaper",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAnalysis = (newspaperId: string) => {
    navigate(`/ai-analysis/${newspaperId}`);
  };
  const handlePreviewNewspaper = (newspaperId: string) => {
    navigate(`/preview/${newspaperId}`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      uploaded: "secondary",
      processing: "default",
      completed: "default",
      failed: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (newspapers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No newspapers uploaded yet</p>
          <p className="text-muted-foreground">
            Upload your first newspaper to get started with AI analysis
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Newspapers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newspapers.map((newspaper) => (
            <div
              key={newspaper.id}
              className="w-full p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
            >
              {/* grid: text on left, actions on right (single column on mobile) */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-3 items-start">
                {/* LEFT: icon + text */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow flex-shrink-0">
                    <FileText className="w-5 h-5 text-accent-foreground" />
                  </div>
          
                  <div className="flex-1 min-w-0">
                    {/* filename + small badge (badge will appear top-right in md layout) */}
                    <div className="flex items-start md:items-center gap-2">
                      <p className="font-medium truncate text-sm md:text-base min-w-0">
                        {newspaper.file_name}
                      </p>
                    </div>
          
                    {/* metadata below the filename; allow wrapping */}
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground flex-wrap whitespace-normal break-words">
                      <span className="min-w-0">
                        Date: {format(new Date(newspaper.upload_date), "PPP")}
                      </span>
                      <span>{(newspaper.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>
          
                {/* RIGHT: badge (at top) + actions (stack on mobile, inline on md+) */}
                <div className="flex flex-col items-start md:items-end gap-3">
                  <div className="self-end md:self-auto">
                    {/* keep badge visible and positioned to the right column */}
                    {getStatusBadge(newspaper.status)}
                  </div>
          
                  <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-2">
                    {newspaper.status === "uploaded" && (
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => handleProcess(newspaper)}
                        disabled={isLoading}
                        className="w-full md:w-auto"
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        Process
                      </Button>
                    )}
          
                    {newspaper.status === "processing" && (
                      <Button variant="secondary" size="sm" disabled className="w-full md:w-auto">
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        Processing...
                      </Button>
                    )}
          
                    {newspaper.status === "completed" && (
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() => handleViewAnalysis(newspaper.id)}
                        className="w-full md:w-auto"
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        View Analysis
                      </Button>
                    )}
          
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handlePreviewNewspaper(newspaper.id)}
                      className="w-full md:w-auto"
                    >
                      Preview PDF
                    </Button>
          
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(newspaper)}
                      disabled={deletingId === newspaper.id}
                      className="flex-shrink-0"
                    >
                      {deletingId === newspaper.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewspapersList;
