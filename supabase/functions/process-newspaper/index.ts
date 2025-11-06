import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

  let newspaperId: string | undefined;
  
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader)
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const body = await req.json();
    newspaperId = body.newspaperId;
    console.log("Processing newspaper:", newspaperId);

    // Auth client (user-level)
    const userSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user)
      return new Response(JSON.stringify({ success: false, error: "Invalid authentication" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    // Get newspaper info
    const { data: newspaper, error: newspaperError } = await userSupabase
      .from("newspapers")
      .select("file_path, user_id, total_pages")
      .eq("id", newspaperId)
      .single();

    if (newspaperError || !newspaper)
      return new Response(JSON.stringify({ success: false, error: "Newspaper not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    if (newspaper.user_id !== user.id)
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    // Service-role client for storage + DB
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("newspapers").update({ status: "processing" }).eq("id", newspaperId);

    const totalPages = newspaper.total_pages;
    if (!totalPages || totalPages <= 0)
      throw new Error("Total pages missing — please re-split this newspaper.");

    console.log(`Processing ${totalPages} pages for user ${user.id}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const allArticles: any[] = [];

    for (let i = 0; i < totalPages; i++) {
      const pageFileName = `${newspaper.user_id}/pages/${newspaperId}_page_${i + 1}.pdf`;
      console.log(`→ Processing page ${i + 1}/${totalPages}: ${pageFileName}`);

      // Get signed URL for the page (valid for 1 hour)
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from("newspapers")
        .createSignedUrl(pageFileName, 3600);

      if (urlError || !signedUrlData?.signedUrl) {
        console.warn(`⚠️ Skipping page ${i + 1}: couldn't generate signed URL`);
        continue;
      }

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            {
              role: "system",
              content: `You are an expert at analyzing newspaper PDFs for UPSC Civil Services Exam preparation. Extract ALL articles from the page that are relevant to UPSC syllabus. Be thorough and detailed.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze page ${i + 1} of a newspaper and extract ALL UPSC-relevant articles.

For each article, identify:
- Which GS papers it's relevant to (GS1, GS2, GS3, or GS4)
- Specific syllabus topics from the UPSC syllabus
- Key facts, data points, and analysis
- Connection to current affairs and UPSC preparation

GS PAPER COVERAGE:
- GS1: History, Culture, Geography, Society, World History
- GS2: Polity, Governance, Constitution, International Relations, Social Justice
- GS3: Economy, Agriculture, Science & Tech, Environment, Security, Disaster Management
- GS4: Ethics, Integrity, Aptitude, Case Studies

Extract comprehensive information for each article including title, full content/summary, GS papers, specific topics, keywords, one-liner, key points for answer writing, prelims facts, static topics for revision, and importance rating.`,
                },
                {
                  type: "image_url",
                  image_url: { url: signedUrlData.signedUrl },
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_articles",
                description: "Extract all UPSC-relevant articles from the newspaper page",
                parameters: {
                  type: "object",
                  properties: {
                    articles: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          title: { type: "string", description: "Article headline" },
                          content: { type: "string", description: "Full article content or detailed summary" },
                          gs_papers: { 
                            type: "array", 
                            items: { type: "string", enum: ["GS1", "GS2", "GS3", "GS4"] },
                            description: "Which GS papers this article is relevant for"
                          },
                          gs_syllabus_topics: { 
                            type: "array", 
                            items: { type: "string" },
                            description: "Specific UPSC syllabus topics covered"
                          },
                          keywords: { 
                            type: "array", 
                            items: { type: "string" },
                            description: "Important keywords and terms"
                          },
                          one_liner: { type: "string", description: "One sentence summary" },
                          key_points: { type: "string", description: "Bullet points for answer writing" },
                          prelims_card: { type: "string", description: "Important facts for prelims MCQs" },
                          static_topics: { 
                            type: "array", 
                            items: { type: "string" },
                            description: "Static topics to revise related to this article"
                          },
                          static_explanation: { type: "string", description: "Brief explanation of static concepts" },
                          is_important: { type: "boolean", description: "Is this article highly important for UPSC?" },
                        },
                        required: ["title", "content", "gs_papers", "one_liner"],
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

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error(`❌ AI failed on page ${i + 1}: ${aiResponse.status} - ${errorText}`);
        continue;
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      
      if (!toolCall) {
        console.warn(`⚠️ No tool call returned for page ${i + 1}`);
        continue;
      }

      let extracted;
      try {
        extracted = JSON.parse(toolCall.function.arguments);
      } catch (parseError) {
        console.error(`❌ Failed to parse AI JSON for page ${i + 1}:`, parseError);
        continue;
      }

      const pageArticles = (extracted.articles || []).map((a: any) => ({
        title: a.title,
        content: a.content,
        summary: a.one_liner || a.content?.substring(0, 200),
        gs_papers: a.gs_papers || [],
        gs_syllabus_topics: a.gs_syllabus_topics || [],
        keywords: a.keywords || [],
        one_liner: a.one_liner,
        key_points: a.key_points,
        prelims_card: a.prelims_card,
        static_topics: a.static_topics || [],
        static_explanation: a.static_explanation,
        is_important: a.is_important || false,
        page_number: i + 1,
        newspaper_id: newspaperId,
        page_file_path: pageFileName,
      }));

      if (pageArticles.length > 0) {
        // Insert articles immediately for realtime updates
        const { error: insertError } = await supabase.from("articles").insert(pageArticles);
        if (insertError) {
          console.error(`❌ Failed to insert articles for page ${i + 1}:`, insertError);
        } else {
          allArticles.push(...pageArticles);
          console.log(`✅ Page ${i + 1}/${totalPages}: Extracted and saved ${pageArticles.length} articles`);
        }
      } else {
        console.log(`ℹ️ Page ${i + 1}/${totalPages}: No UPSC-relevant articles found`);
      }
    }

    await supabase.from("newspapers").update({ status: "completed" }).eq("id", newspaperId);

    console.log(`🎉 Processing complete: ${allArticles.length} total articles extracted from ${totalPages} pages`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${totalPages} pages, extracted ${allArticles.length} articles.`,
        totalPages,
        totalArticles: allArticles.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing newspaper:", error);

    if (newspaperId) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        await supabase
          .from("newspapers")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : String(error),
          })
          .eq("id", newspaperId);
      } catch (e) {
        console.error("Failed to update error status:", e);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
