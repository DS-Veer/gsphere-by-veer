import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ArticlePDFPreviewProps {
  pageFilePath: string | null;
  pageNumber: number | null;
}

const ArticlePDFPreview = ({ pageFilePath, pageNumber }: ArticlePDFPreviewProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPdf = async () => {
      if (!pageFilePath) {
        setError("Page file path not available");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get signed URL from Supabase Storage
        const { data: signedUrlData, error: urlError } = await supabase.storage
          .from("newspapers")
          .createSignedUrl(pageFilePath, 3600); // valid for 1 hour

        if (urlError) throw urlError;

        setPdfUrl(signedUrlData.signedUrl);
      } catch (err: any) {
        console.error("Error loading PDF page:", err);
        setError(err.message || "Failed to load PDF page");
      } finally {
        setLoading(false);
      }
    };

    loadPdf();
  }, [pageFilePath]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-muted rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !pdfUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">
          {error || "PDF page not available"}
        </p>
        {pageNumber && (
          <p className="text-xs text-muted-foreground">
            Article appears on page {pageNumber}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border border-border">
      <iframe
        src={pdfUrl}
        title={`Article Page ${pageNumber || ''}`}
        className="w-full h-full"
      />
    </div>
  );
};

export default ArticlePDFPreview;
