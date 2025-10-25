import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Newspaper, FileText, Sparkles, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AIAnalysis = () => {
  const { newspaperId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [newspaper, setNewspaper] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    loadNewspaperData();
  }, [newspaperId]);

  const loadNewspaperData = async () => {
    try {
      // Load newspaper details
      const { data: newspaperData, error: newspaperError } = await supabase
        .from("newspapers")
        .select("*")
        .eq("id", newspaperId)
        .single();

      if (newspaperError) throw newspaperError;
      setNewspaper(newspaperData);

      // Load articles
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select("*")
        .eq("newspaper_id", newspaperId)
        .order("created_at", { ascending: false });

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load analysis",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow">
                  <Newspaper className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">AI Analysis</h1>
                  <p className="text-sm text-muted-foreground">{newspaper?.file_name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {articles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No analysis available yet</p>
                <p className="text-muted-foreground mb-4">
                  The AI analysis for this newspaper is being processed
                </p>
                <Button variant="hero" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="shadow-medium">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-xl">{article.title}</CardTitle>
                        {article.syllabus_topic && (
                          <Badge variant="secondary" className="gap-1">
                            <Tag className="h-3 w-3" />
                            {article.syllabus_topic}
                          </Badge>
                        )}
                      </div>
                      {article.is_important && (
                        <Badge variant="destructive">Important</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="summary" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="facts">Facts</TabsTrigger>
                        <TabsTrigger value="issues">Issues</TabsTrigger>
                        <TabsTrigger value="wayforward">Way Forward</TabsTrigger>
                      </TabsList>
                      <TabsContent value="summary" className="space-y-4">
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-muted-foreground">{article.summary || "No summary available"}</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="facts" className="space-y-4">
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-muted-foreground whitespace-pre-wrap">{article.facts || "No facts available"}</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="issues" className="space-y-4">
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-muted-foreground whitespace-pre-wrap">{article.issues || "No issues available"}</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="wayforward" className="space-y-4">
                        <div className="prose dark:prose-invert max-w-none">
                          <p className="text-muted-foreground whitespace-pre-wrap">{article.way_forward || "No way forward available"}</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                    {article.keywords && article.keywords.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div className="flex flex-wrap gap-2">
                          {article.keywords.map((keyword: string, idx: number) => (
                            <Badge key={idx} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIAnalysis;
