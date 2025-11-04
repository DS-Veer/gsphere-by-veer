import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Validate authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { newspaperId } = await req.json();
    console.log("Splitting newspaper:", newspaperId);

    // Create client with user's auth token to verify ownership
    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify newspaper ownership
    const { data: newspaper, error: newspaperError } = await userSupabase
      .from("newspapers")
      .select("file_path, user_id")
      .eq("id", newspaperId)
      .single();

    if (newspaperError || !newspaper?.file_path) {
      return new Response(
        JSON.stringify({ success: false, error: 'Newspaper not found' }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (newspaper.user_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for storage operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Downloading PDF from storage...");
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("newspapers")
      .download(newspaper.file_path);

    if (downloadError) throw downloadError;

    console.log("PDF downloaded, splitting into pages...");
    const pdfDoc = await PDFDocument.load(await fileData.arrayBuffer());
    const totalPages = pdfDoc.getPageCount();
    console.log(`PDF has ${totalPages} pages, splitting...`);

    // Split and upload each page
    for (let i = 0; i < totalPages; i++) {
      const pagePdf = await PDFDocument.create();
      const [copiedPage] = await pagePdf.copyPages(pdfDoc, [i]);
      pagePdf.addPage(copiedPage);
      const pageBytes = await pagePdf.save();

      const pageFileName = `${newspaper.user_id}/pages/${newspaperId}_page_${i + 1}.pdf`;
      const { error: pageUploadError } = await supabase.storage
        .from("newspapers")
        .upload(pageFileName, pageBytes, {
          contentType: "application/pdf",
          upsert: true,
        });

      if (pageUploadError) {
        console.error(`Error uploading page ${i + 1}:`, pageUploadError);
        throw pageUploadError;
      }

      console.log(`Page ${i + 1}/${totalPages} uploaded`);
    }

    console.log("All pages split and uploaded successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Split ${totalPages} pages successfully`,
        totalPages,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error splitting newspaper:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
