import { useNavigate } from "react-router";
import { Home } from "lucide-react";
import { Button } from "../components/ui/button";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-300 to-purple-500 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-9xl mb-6">🤔</div>
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl text-white/90 mb-2">Page Not Found</p>
        <p className="text-white/80 mb-8">
          The page you're looking for doesn't exist
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-white text-orange-500 hover:bg-white/90 px-8 py-6 rounded-xl text-lg font-medium"
        >
          <Home className="w-5 h-5 mr-2" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
