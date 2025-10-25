import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Loader2, TrendingUp, Calendar, FileText, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

const ProgressTracking = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [newspapers, setNewspapers] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalNewspapers: 0,
    totalArticles: 0,
    importantArticles: 0,
    revisedArticles: 0,
    uploadedThisMonth: 0,
  });
  const [topicsAllTime, setTopicsAllTime] = useState<{ topic: string; count: number }[]>([]);
  const [topicsThisMonth, setTopicsThisMonth] = useState<{ topic: string; count: number }[]>([]);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load newspapers
      const { data: newspapersData, error: newspapersError } = await supabase
        .from("newspapers")
        .select("*")
        .eq("user_id", user.id)
        .order("upload_date", { ascending: false });

      if (newspapersError) throw newspapersError;

      // Load articles
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (articlesError) throw articlesError;

      setNewspapers(newspapersData || []);
      setArticles(articlesData || []);

      // Calculate stats
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const uploadedThisMonth = newspapersData?.filter((n) => {
        const uploadDate = new Date(n.upload_date);
        return uploadDate >= monthStart && uploadDate <= monthEnd;
      }).length || 0;

      // Calculate topic frequencies
      const topicCountsAll: Record<string, number> = {};
      const topicCountsMonth: Record<string, number> = {};

      articlesData?.forEach((article) => {
        const topics = article.static_topics || [];
        const articleDate = new Date(article.created_at);
        const isThisMonth = articleDate >= monthStart && articleDate <= monthEnd;

        topics.forEach((topic: string) => {
          topicCountsAll[topic] = (topicCountsAll[topic] || 0) + 1;
          if (isThisMonth) {
            topicCountsMonth[topic] = (topicCountsMonth[topic] || 0) + 1;
          }
        });
      });

      // Convert to sorted arrays
      const sortedTopicsAll = Object.entries(topicCountsAll)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const sortedTopicsMonth = Object.entries(topicCountsMonth)
        .map(([topic, count]) => ({ topic, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopicsAllTime(sortedTopicsAll);
      setTopicsThisMonth(sortedTopicsMonth);

      setStats({
        totalNewspapers: newspapersData?.length || 0,
        totalArticles: articlesData?.length || 0,
        importantArticles: articlesData?.filter((a) => a.is_important).length || 0,
        revisedArticles: articlesData?.filter((a) => a.is_revised).length || 0,
        uploadedThisMonth,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load progress data",
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
                  <TrendingUp className="w-6 h-6 text-accent-foreground" />
                </div>
                <h1 className="text-xl font-bold">Daily Progress Tracking</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Newspapers</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalNewspapers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.uploadedThisMonth} uploaded this month
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalArticles}</div>
                <p className="text-xs text-muted-foreground">Analyzed articles</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Important Articles</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.importantArticles}</div>
                <p className="text-xs text-muted-foreground">Flagged as important</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revised Articles</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.revisedArticles}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalArticles > 0
                    ? Math.round((stats.revisedArticles / stats.totalArticles) * 100)
                    : 0}
                  % completion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Most Cited Topics - All Time */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Most Cited Topics (All Time)</CardTitle>
              <CardDescription>Topics appearing most frequently in your articles</CardDescription>
            </CardHeader>
            <CardContent>
              {topicsAllTime.length > 0 ? (
                <div className="space-y-3">
                  {topicsAllTime.map((item, index) => (
                    <div key={item.topic} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{item.topic}</span>
                      </div>
                      <Badge>{item.count} articles</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No topics analyzed yet</p>
              )}
            </CardContent>
          </Card>

          {/* Most Cited Topics - This Month */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>Most Cited Topics (This Month)</CardTitle>
              <CardDescription>Topics trending in your current month's articles</CardDescription>
            </CardHeader>
            <CardContent>
              {topicsThisMonth.length > 0 ? (
                <div className="space-y-3">
                  {topicsThisMonth.map((item, index) => (
                    <div key={item.topic} className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{item.topic}</span>
                      </div>
                      <Badge>{item.count} articles</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No topics analyzed this month</p>
              )}
            </CardContent>
          </Card>

          {/* Monthly Progress */}
          <Card className="shadow-medium">
            <CardHeader>
              <CardTitle>This Month's Progress</CardTitle>
              <CardDescription>Track your daily newspaper uploads and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Monthly Goal: 30 newspapers</span>
                    <span className="font-medium">
                      {stats.uploadedThisMonth}/30
                    </span>
                  </div>
                  <Progress
                    value={(stats.uploadedThisMonth / 30) * 100}
                    className="h-2"
                  />
                </div>

                {newspapers.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="font-semibold text-sm">Recent Uploads</h3>
                    {newspapers.slice(0, 5).map((newspaper) => (
                      <div
                        key={newspaper.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{newspaper.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(newspaper.upload_date), "PPP")}
                            </p>
                          </div>
                        </div>
                        <Badge variant={newspaper.status === "completed" ? "default" : "secondary"}>
                          {newspaper.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProgressTracking;
