import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Newspaper, Map, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PaperMapping = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<string>("GS1");

  const papers = ["GS1", "GS2", "GS3", "GS4"];

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          newspapers (
            file_name,
            upload_date
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load articles",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getArticlesByPaper = (paper: string) => {
    return articles.filter((article) => article.gs_paper === paper);
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
                  <Map className="w-6 h-6 text-accent-foreground" />
                </div>
                <h1 className="text-xl font-bold">GS Paper Mapping</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Articles by GS Papers</CardTitle>
              <CardDescription>
                View all analyzed articles organized by GS Paper classification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedPaper} onValueChange={setSelectedPaper}>
                <TabsList className="grid w-full grid-cols-4">
                  {papers.map((paper) => (
                    <TabsTrigger key={paper} value={paper}>
                      {paper}
                      <Badge variant="secondary" className="ml-2">
                        {getArticlesByPaper(paper).length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
                {papers.map((paper) => (
                  <TabsContent key={paper} value={paper} className="space-y-4 mt-6">
                    {getArticlesByPaper(paper).length === 0 ? (
                      <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          No articles found for {paper}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {getArticlesByPaper(paper).map((article) => (
                          <Card key={article.id} className="shadow-soft hover:shadow-medium transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2 flex-1">
                                  <CardTitle className="text-lg">{article.title}</CardTitle>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {article.syllabus_topic && (
                                      <Badge variant="outline">{article.syllabus_topic}</Badge>
                                    )}
                                    {article.is_important && (
                                      <Badge variant="destructive">Important</Badge>
                                    )}
                                  </div>
                                </div>
                                <Button variant="hero" size="sm" asChild>
                                  <Link to={`/ai-analysis/${article.newspaper_id}`}>
                                    View Analysis
                                  </Link>
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {article.summary}
                              </p>
                              {article.newspapers && (
                                <p className="text-xs text-muted-foreground mt-2">
                                  From: {article.newspapers.file_name}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaperMapping;
