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
import ArticlePDFPreview from "@/components/ArticlePDFPreview";

const AIAnalysis = () => {
  const { newspaperId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [newspaper, setNewspaper] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  useEffect(() => {
    loadNewspaperData();
    // Auto-select first article if available
  }, [newspaperId]);

  // Realtime: append new articles as they are processed
  useEffect(() => {
    if (!newspaperId) return;
    const channel = supabase
      .channel('articles-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'articles',
        filter: `newspaper_id=eq.${newspaperId}`,
      }, (payload) => {
        setArticles((prev) => [payload.new as any, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [newspaperId]);

  useEffect(() => {
    if (articles.length > 0 && !selectedArticle) {
      setSelectedArticle(articles[0]);
    }
  }, [articles]);

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
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex h-14 md:h-16 items-center justify-between gap-2">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <Button variant="ghost" size="icon" className="flex-shrink-0" asChild>
                <Link to="/newspapers">
                  <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-accent flex items-center justify-center shadow-glow flex-shrink-0">
                  <Newspaper className="w-4 h-4 md:w-6 md:h-6 text-accent-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm md:text-lg font-semibold truncate">AI Analysis</h1>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">{newspaper?.file_name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
          {articles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No analysis available yet</p>
                <p className="text-muted-foreground mb-4">
                  The AI analysis for this newspaper is being processed
                </p>
                <Button variant="accent" onClick={() => navigate("/newspapers")}>
                  Back to Newspapers
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Articles List */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-base md:text-lg">Articles ({articles.length})</CardTitle>
                    <CardDescription className="text-xs md:text-sm">Click to view details</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y max-h-[400px] lg:max-h-[calc(100vh-300px)] overflow-y-auto">
                      {articles.map((article) => (
                        <div
                          key={article.id}
                          onClick={() => setSelectedArticle(article)}
                          className={`p-3 md:p-4 cursor-pointer hover:bg-accent transition-colors ${
                            selectedArticle?.id === article.id ? 'bg-accent' : ''
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-start gap-1 md:gap-2 flex-wrap">
                              {article.is_important && (
                                <Badge variant="destructive" className="text-[10px] md:text-xs px-1.5 py-0">Important</Badge>
                              )}
                              {article.gs_papers && article.gs_papers.length > 0 
                                ? article.gs_papers.map((paper: string) => (
                                    <Badge key={paper} variant="outline" className="text-[10px] md:text-xs px-1.5 py-0">{paper}</Badge>
                                  ))
                                : <Badge variant="outline" className="text-[10px] md:text-xs px-1.5 py-0">No GS Paper</Badge>
                              }
                            </div>
                            <h3 className="font-semibold text-xs md:text-sm line-clamp-2 md:line-clamp-3">{article.title}</h3>
                            <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2">{article.one_liner || article.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Article Details */}
              <div className="lg:col-span-2">
                {selectedArticle ? (
                  <Card>
                    <CardHeader className="p-4 md:p-6">
                      <div className="space-y-3">
                        <CardTitle className="text-base md:text-xl break-words">{selectedArticle.title}</CardTitle>
                        <div className="flex flex-wrap gap-1 md:gap-2">
                          {selectedArticle.gs_papers && selectedArticle.gs_papers.length > 0 
                            ? selectedArticle.gs_papers.map((paper: string) => (
                                <Badge key={paper} className="text-xs">{paper}</Badge>
                              ))
                            : <Badge variant="outline" className="text-xs">No GS Paper</Badge>
                          }
                          {selectedArticle.is_important && (
                            <Badge variant="destructive" className="text-xs">Important</Badge>
                          )}
                          {selectedArticle.is_revised && (
                            <Badge variant="secondary" className="text-xs">Revised</Badge>
                          )}
                        </div>
                        {selectedArticle.gs_syllabus_topics && selectedArticle.gs_syllabus_topics.length > 0 && (
                          <div>
                            <p className="text-[10px] md:text-xs font-medium text-muted-foreground mb-1">GS Syllabus Topics:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedArticle.gs_syllabus_topics.map((topic: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0.5">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                      <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 h-auto">
                          <TabsTrigger value="overview" className="text-xs md:text-sm py-2">Overview</TabsTrigger>
                          <TabsTrigger value="keypoints" className="text-xs md:text-sm py-2">Key Points</TabsTrigger>
                          <TabsTrigger value="prelims" className="text-xs md:text-sm py-2">Prelims</TabsTrigger>
                          <TabsTrigger value="static" className="text-xs md:text-sm py-2">Static</TabsTrigger>
                          <TabsTrigger value="preview" className="text-xs md:text-sm py-2">PDF</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="overview" className="space-y-3 md:space-y-4 mt-4">
                          <div>
                            <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
                              <span className="text-primary">📰</span> One-Line Summary
                            </h4>
                            <p className="text-xs md:text-sm text-muted-foreground bg-accent/50 p-3 rounded-md border break-words">
                              {selectedArticle.one_liner || "No summary available"}
                            </p>
                          </div>
                          
                          {selectedArticle.keywords && selectedArticle.keywords.length > 0 && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
                                  <span className="text-primary">🏷️</span> Important Keywords
                                </h4>
                                <div className="flex flex-wrap gap-1 md:gap-2">
                                  {selectedArticle.keywords.map((keyword: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="text-[10px] md:text-xs px-1.5 py-0.5">
                                      {keyword}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}

                          {selectedArticle.static_topics && selectedArticle.static_topics.length > 0 && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
                                  <span className="text-primary">📚</span> Related Static Topics
                                </h4>
                                <div className="flex flex-wrap gap-1 md:gap-2">
                                  {selectedArticle.static_topics.map((topic: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0.5">
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="keypoints" className="mt-4">
                          <div className="space-y-3">
                            <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
                              <span className="text-primary">📌</span> Key Points (Easy Recall)
                            </h4>
                            <div className="whitespace-pre-wrap text-xs md:text-sm text-muted-foreground bg-accent/30 p-3 md:p-4 rounded-md border leading-relaxed break-words">
                              {selectedArticle.key_points || 'No key points available'}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="prelims" className="mt-4">
                          <div className="space-y-3">
                            <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
                              <span className="text-primary">🎯</span> Prelims Quick Card
                            </h4>
                            <div className="whitespace-pre-wrap text-xs md:text-sm text-muted-foreground bg-gradient-to-br from-accent/40 to-accent/20 p-3 md:p-4 rounded-md border-2 border-primary/20 leading-relaxed break-words">
                              {selectedArticle.prelims_card || 'No prelims card available'}
                            </div>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="static" className="mt-4">
                          <div className="space-y-3">
                            <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
                              <span className="text-primary">📚</span> Static Syllabus Linkage
                            </h4>
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <div className="whitespace-pre-wrap text-xs md:text-sm text-muted-foreground bg-accent/30 p-3 md:p-4 rounded-md border leading-relaxed break-words">
                                {selectedArticle.static_explanation || 'No static syllabus explanation available'}
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="preview" className="mt-4">
                          <div className="space-y-3">
                            <h4 className="text-sm md:text-base font-semibold mb-2 flex items-center gap-2">
                              <span className="text-primary">📄</span> Article Page Preview
                              {selectedArticle.page_number && (
                                <Badge variant="secondary" className="text-xs">
                                  Page {selectedArticle.page_number}
                                </Badge>
                              )}
                            </h4>
                            <ArticlePDFPreview 
                              pageFilePath={selectedArticle.page_file_path}
                              pageNumber={selectedArticle.page_number}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <p className="text-muted-foreground">Select an article to view details</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AIAnalysis;
