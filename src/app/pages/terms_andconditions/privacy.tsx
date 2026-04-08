import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-b-[40px]">
        <button onClick={() => navigate(-1)} className="text-white mb-4 flex items-center">
          <ArrowLeft className="mr-2" /> Back
        </button>
        <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
      </div>

      <div className="p-6 space-y-4 text-sm text-gray-700 leading-6">
        <p>We value your privacy and protect your data.</p>
        <p>Your personal information is not shared with third parties.</p>
        <p>We only use your data to improve user experience.</p>
      </div>

    </div>
  );
}