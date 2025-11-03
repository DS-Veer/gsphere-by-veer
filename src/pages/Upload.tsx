import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UploadNewspaper from "@/components/dashboard/UploadNewspaper";

const Upload = () => {
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

    // Listen for successful upload
    const handleUpload = () => {
      setTimeout(() => navigate("/newspapers"), 500);
    };
    window.addEventListener("newspaper-uploaded", handleUpload);
    return () => window.removeEventListener("newspaper-uploaded", handleUpload);
  }, [navigate]);

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container px-4 py-8 mx-auto max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/newspapers")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Newspapers
        </Button>
        <UploadNewspaper userId={userId} />
      </main>
      <Footer />
    </div>
  );
};

export default Upload;
