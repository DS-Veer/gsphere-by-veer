import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

const PreviewNewspaper = () => {
  const { newspaperId } = useParams<{ newspaperId: string }>();

  console.log("📰 Newspaper ID from URL:", newspaperId);

  if (!newspaperId) {
    return <div>Error: Newspaper ID not found.</div>;
  }
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadPdf = async () => {
      try {
        // Fetch file_path from DB
        const { data, error } = await supabase
          .from("newspapers")
          .select("file_path")
          .eq("id", newspaperId)
          .single();

        if (error) throw error;

        // Get signed URL from Supabase Storage
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from("newspapers")
          .createSignedUrl(data.file_path, 3600); // valid for 1 hour

        if (urlError) throw urlError;

        setPdfUrl(signedUrlData.signedUrl);
      } catch (error: any) {
        console.error("Error loading PDF:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [newspaperId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <p className="text-lg font-medium mb-2">Failed to load PDF</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-4 flex items-center justify-between border-b bg-background">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h2 className="text-lg font-semibold">Newspaper Preview</h2>
      </div>
      <iframe
        src={pdfUrl}
        title="Newspaper PDF"
        className="flex-1 w-full border-0"
      />
    </div>
  );
};

export default PreviewNewspaper;
