import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewspapersList from "@/components/dashboard/NewspapersList";

const Newspapers = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUserId(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8 mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Newspapers</h1>
            <p className="text-muted-foreground">
              View and manage your uploaded newspapers
            </p>
          </div>
          <Button onClick={() => navigate("/upload")}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Newspaper
          </Button>
        </div>
        <NewspapersList userId={userId} />
      </main>
      <Footer />
    </div>
  );
};

export default Newspapers;
