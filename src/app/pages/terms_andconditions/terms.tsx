import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-b-[40px]">
        <button onClick={() => navigate(-1)} className="text-white mb-4 flex items-center">
          <ArrowLeft className="mr-2" /> Back
        </button>
        <h1 className="text-2xl font-bold text-white">Terms & Conditions</h1>
      </div>

      <div className="p-6 space-y-4 text-sm text-gray-700 leading-6">
        <p>By using this app, you agree to the following terms...</p>
        <p>You are responsible for maintaining your account security.</p>
        <p>We reserve the right to update these terms anytime.</p>
      </div>

    </div>
  );
}