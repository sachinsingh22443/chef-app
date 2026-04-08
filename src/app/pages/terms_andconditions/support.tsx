import { useNavigate } from "react-router";
import { ArrowLeft, Mail, Phone } from "lucide-react";

export default function Support() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-6 rounded-b-[40px]">
        <button onClick={() => navigate(-1)} className="text-white mb-4 flex items-center">
          <ArrowLeft className="mr-2" /> Back
        </button>
        <h1 className="text-2xl font-bold text-white">Help & Support</h1>
      </div>

      <div className="p-6 space-y-5">

        <div className="bg-white p-5 rounded-3xl shadow">
          <h3 className="font-bold mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600">
            Contact us anytime. We are here to help you.
          </p>
        </div>

        {/* Email */}
        <div className="bg-white p-5 rounded-3xl shadow flex items-center gap-4">
          <Mail className="text-blue-500" />
          <div>
            <p className="font-medium">Email Support</p>
            <p className="text-sm text-gray-500">support@chefapp.com</p>
          </div>
        </div>

        {/* Phone */}
        <div className="bg-white p-5 rounded-3xl shadow flex items-center gap-4">
          <Phone className="text-green-500" />
          <div>
            <p className="font-medium">Call Us</p>
            <p className="text-sm text-gray-500">+91 9876543210</p>
          </div>
        </div>

      </div>

    </div>
  );
}