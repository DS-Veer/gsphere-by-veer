import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UploadNewspaperProps {
  userId: string;
}

const UploadNewspaper = ({ userId }: UploadNewspaperProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please upload a PDF file.",
        });
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Maximum file size is 50MB.",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a PDF file to upload.",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create file path with user ID and date
      const filePath = `${userId}/${format(date, "yyyy-MM-dd")}-${file.name}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from("newspapers")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Create database record
      const { data: newspaper, error: dbError } = await supabase
        .from("newspapers")
        .insert({
          user_id: userId,
          upload_date: format(date, "yyyy-MM-dd"),
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          status: "uploaded",
        })
        .select()
        .single();

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from("newspapers").remove([filePath]);
        throw dbError;
      }

      // Split PDF into pages immediately after upload
      toast({
        title: "Upload successful!",
        description: "Splitting PDF into pages...",
      });

      const { error: splitError } = await supabase.functions.invoke("split-newspaper", {
        body: { newspaperId: newspaper.id },
      });

      if (splitError) {
        console.error("Error splitting PDF:", splitError);
        toast({
          variant: "destructive",
          title: "PDF uploaded but failed to split",
          description: "You can still process the newspaper later.",
        });
      } else {
        toast({
          title: "Success!",
          description: "Your newspaper has been uploaded and split into pages.",
        });
      }

      // Reset form
      setFile(null);
      const fileInput = document.getElementById("newspaper-file") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      // Trigger a refresh of the newspapers list
      window.dispatchEvent(new Event("newspaper-uploaded"));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload newspaper. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Newspaper
        </CardTitle>
        <CardDescription>
          Upload today's newspaper PDF for AI-powered analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="newspaper-file">PDF File</Label>
            <Input
              id="newspaper-file"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>
        </div>

        {file && (
          <div className="p-3 rounded-lg bg-muted">
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
          variant="accent"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Newspaper
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UploadNewspaper;
