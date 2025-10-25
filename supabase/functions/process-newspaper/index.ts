import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive UPSC GS Topics
const GS_TOPICS = {
  "GS1": [
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
    "Geopolitics"
  ],
  "GS2": [
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
    "India and Its Neighbors"
  ],
  "GS3": [
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
    "Defense and Security"
  ],
  "GS4": [
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
    "Case Studies"
  ]
};

const ALL_TOPICS = [
  ...GS_TOPICS.GS1.map(t => ({ topic: t, paper: "GS1" })),
  ...GS_TOPICS.GS2.map(t => ({ topic: t, paper: "GS2" })),
  ...GS_TOPICS.GS3.map(t => ({ topic: t, paper: "GS3" })),
  ...GS_TOPICS.GS4.map(t => ({ topic: t, paper: "GS4" }))
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { newspaperId } = await req.json();
    console.log('Processing newspaper:', newspaperId);

    // Get newspaper details
    const { data: newspaper, error: newspaperError } = await supabaseClient
      .from('newspapers')
      .select('*')
      .eq('id', newspaperId)
      .single();

    if (newspaperError) {
      console.error('Error fetching newspaper:', newspaperError);
      throw newspaperError;
    }

    // Update status to processing
    await supabaseClient
      .from('newspapers')
      .update({ status: 'processing' })
      .eq('id', newspaperId);

    // Download PDF from storage
    const { data: fileData, error: downloadError } = await supabaseClient
      .storage
      .from('newspapers')
      .download(newspaper.file_path);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw downloadError;
    }

    // Convert PDF to base64 for AI processing
    const arrayBuffer = await fileData.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log('Calling AI to extract articles...');

    // Call AI to extract articles
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert at analyzing newspaper PDFs for UPSC CSE preparation. Extract individual articles and map them to UPSC GS topics.

Available GS Topics:
${JSON.stringify(ALL_TOPICS, null, 2)}

For each article, provide:
1. Title (concise headline)
2. Content (full text)
3. Summary (2-3 sentences for quick revision)
4. Facts (bullet points of key facts, dates, numbers)
5. Issues (problems/challenges mentioned)
6. Way Forward (solutions/recommendations)
7. GS Paper (GS1, GS2, GS3, or GS4)
8. Static Topics (array of relevant topic names from the list above)
9. Keywords (important terms for revision)
10. Is Important (boolean - mark true if article is crucial for UPSC prep)

Return a JSON array of articles.`
          },
          {
            role: 'user',
            content: `Analyze this newspaper PDF and extract all articles with UPSC GS topic mapping. The PDF is base64 encoded: ${base64.substring(0, 100)}... (truncated for context)`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_articles",
              description: "Extract articles from newspaper and map to GS topics",
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
                        summary: { type: "string" },
                        facts: { type: "string" },
                        issues: { type: "string" },
                        way_forward: { type: "string" },
                        gs_paper: { type: "string", enum: ["GS1", "GS2", "GS3", "GS4"] },
                        static_topics: { type: "array", items: { type: "string" } },
                        keywords: { type: "array", items: { type: "string" } },
                        is_important: { type: "boolean" }
                      },
                      required: ["title", "content", "summary", "gs_paper", "static_topics"]
                    }
                  }
                },
                required: ["articles"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_articles" } }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    // Extract articles from tool call
    const toolCall = aiData.choices[0].message.tool_calls?.[0];
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    const articles = extractedData.articles;

    console.log(`Extracted ${articles.length} articles`);

    // Insert articles into database
    const articlesWithNewspaperId = articles.map((article: any) => ({
      newspaper_id: newspaperId,
      title: article.title,
      content: article.content,
      summary: article.summary,
      facts: article.facts || null,
      issues: article.issues || null,
      way_forward: article.way_forward || null,
      gs_paper: article.gs_paper,
      static_topics: article.static_topics,
      keywords: article.keywords || [],
      is_important: article.is_important || false,
      is_revised: false
    }));

    const { error: insertError } = await supabaseClient
      .from('articles')
      .insert(articlesWithNewspaperId);

    if (insertError) {
      console.error('Error inserting articles:', insertError);
      throw insertError;
    }

    // Update newspaper status to completed
    await supabaseClient
      .from('newspapers')
      .update({ status: 'completed' })
      .eq('id', newspaperId);

    console.log('Processing completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        articlesCount: articles.length,
        message: `Successfully extracted ${articles.length} articles` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing newspaper:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
