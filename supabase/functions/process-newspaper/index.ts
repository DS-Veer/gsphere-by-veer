import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ======= UPSC Topics ===========
const GS_TOPICS = {
  GS1: [
    "Indian Heritage and Culture",
    "Ancient Indian History",
    "Medieval Indian History",
    "Modern Indian History",
    "Freedom Struggle",
    "Post-Independence Consolidation",
    "World History",
    "Indian Society",
    "Social Issues",
    "Women's Issues",
    "Population and Associated Issues",
    "Urbanization",
    "Poverty and Development",
    "Indian Geography",
    "World Geography",
    "Physical Geography",
    "Economic Geography",
    "Geopolitics",
  ],
  GS2: [
    "Indian Constitution",
    "Constitutional Framework",
    "Federal Structure",
    "Separation of Powers",
    "Dispute Resolution",
    "Parliament and State Legislatures",
    "Executive and Judiciary",
    "Appointment to Various Posts",
    "Powers, Functions and Responsibilities",
    "Structure, Organization and Functioning of the Judiciary",
    "Government Policies and Interventions",
    "Development Processes",
    "Social Sector Initiatives",
    "Welfare Schemes",
    "Mechanisms, Laws, Institutions and Bodies",
    "Governance Issues",
    "Transparency and Accountability",
    "E-Governance",
    "Civil Services",
    "Role of Civil Society",
    "Bilateral Relations",
    "International Relations",
    "International Organizations",
    "Foreign Policy",
    "India and Its Neighbors",
  ],
  GS3: [
    "Economic Development",
    "Indian Economy",
    "Planning",
    "Mobilization of Resources",
    "Growth, Development and Employment",
    "Inclusive Growth",
    "Budgeting",
    "Land Reforms",
    "Infrastructure",
    "Investment Models",
    "Science and Technology",
    "Technology Missions",
    "Intellectual Property Rights",
    "Space Technology",
    "Biotechnology",
    "Agriculture",
    "Food Security",
    "Public Distribution System",
    "Issues Related to Farmers",
    "Environment and Biodiversity",
    "Conservation",
    "Environmental Pollution and Degradation",
    "Climate Change",
    "Disaster Management",
    "Internal Security",
    "Security Challenges",
    "Border Management",
    "Terrorism",
    "Cyber Security",
    "Money Laundering",
    "Defense and Security",
  ],
  GS4: [
    "Ethics and Human Interface",
    "Essence, Determinants and Consequences of Ethics",
    "Dimensions of Ethics",
    "Ethics in Public and Private Relationships",
    "Human Values",
    "Role of Family, Society and Educational Institutions",
    "Attitude",
    "Aptitude",
    "Emotional Intelligence",
    "Moral Thinkers and Philosophers",
    "Public Service Values",
    "Probity in Governance",
    "Ethical Concerns and Dilemmas",
    "Ethical Guidance",
    "Accountability and Ethical Governance",
    "Strengthening Ethical and Moral Values",
    "Case Studies",
  ],
};

const ALL_TOPICS = [
  ...GS_TOPICS.GS1.map((t) => ({ topic: t, paper: "GS1" })),
  ...GS_TOPICS.GS2.map((t) => ({ topic: t, paper: "GS2" })),
  ...GS_TOPICS.GS3.map((t) => ({ topic: t, paper: "GS3" })),
  ...GS_TOPICS.GS4.map((t) => ({ topic: t, paper: "GS4" })),
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { newspaperId } = await req.json();
    console.log("Processing newspaper:", newspaperId);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: newspaper, error: newspaperError } = await supabase
      .from("newspapers")
      .select("file_path")
      .eq("id", newspaperId)
      .single();

    if (newspaperError || !newspaper?.file_path) throw new Error("Newspaper not found");

    await supabase.from("newspapers").update({ status: "processing" }).eq("id", newspaperId);

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("newspapers")
      .download(newspaper.file_path);

    if (downloadError) throw downloadError;

    const pdfDoc = await PDFDocument.load(await fileData.arrayBuffer());
    const totalPages = pdfDoc.getPageCount();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const allArticles: any[] = [];

    for (let i = 0; i < totalPages; i++) {
      console.log(`Processing page ${i + 1}/${totalPages}...`);

      const pagePdf = await PDFDocument.create();
      const [copiedPage] = await pagePdf.copyPages(pdfDoc, [i]);
      pagePdf.addPage(copiedPage);
      const pageBytes = await pagePdf.save();
      const pageBase64 = btoa(String.fromCharCode(...new Uint8Array(pageBytes)));

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: `You are an expert at analyzing newspaper PDFs for UPSC CSE preparation.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze page ${i + 1} of a newspaper. Extract all UPSC-relevant articles with analysis. Use these GS topics:\n${JSON.stringify(
                    ALL_TOPICS,
                    null,
                    2
                  )}`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:application/pdf;base64,${pageBase64}`,
                  },
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_articles",
                parameters: {
                  type: "object",
                  properties: {
                    articles: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string" },
                          content: { type: "string" },
                          gs_papers: {
                            type: "array",
                            items: { type: "string", enum: ["GS1", "GS2", "GS3", "GS4"] },
                          },
                          gs_syllabus_topics: { type: "array", items: { type: "string" } },
                          keywords: { type: "array", items: { type: "string" } },
                          one_liner: { type: "string" },
                          key_points: { type: "string" },
                          prelims_card: { type: "string" },
                          static_topics: { type: "array", items: { type: "string" } },
                          static_explanation: { type: "string" },
                          is_important: { type: "boolean" },
                        },
                        required: ["title", "content"],
                      },
                    },
                  },
                  required: ["articles"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "extract_articles" } },
        }),
      });

      if (!aiResponse.ok) throw new Error(`AI error on page ${i + 1}: ${aiResponse.status}`);

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) continue;

      let extractedData;
      try {
        extractedData = JSON.parse(toolCall.function.arguments);
      } catch {
        console.warn(`Failed to parse AI response for page ${i + 1}`);
        continue;
      }

      const pageArticles = (extractedData.articles || []).map((a: any) => ({
        ...a,
        page_number: i + 1,
        newspaper_id: newspaperId,
      }));

      allArticles.push(...pageArticles);
      console.log(`→ Page ${i + 1}: extracted ${pageArticles.length} articles`);
    }

    if (allArticles.length > 0) {
      const { error: insertError } = await supabase.from("articles").insert(allArticles);
      if (insertError) throw insertError;
    }

    await supabase.from("newspapers").update({ status: "completed" }).eq("id", newspaperId);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${totalPages} pages, extracted ${allArticles.length} articles`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing newspaper:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
