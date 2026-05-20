import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../../components/ui/button";

export default function ApplicationStatus() {
  const navigate = useNavigate();

  // ✅ STATE
  const [status, setStatus] = useState("under_review");
  const [reason, setReason] = useState("");

  // ✅ FETCH STATUS FROM BACKEND
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          "https://chef-backend-qh12.onrender.com/auth/status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStatus(res.data.status);
        setReason(res.data.reason || "");

      } catch (error) {
        console.error(error);
      }
    };

    fetchStatus();
  }, []);

  // ✅ STATUS CONFIG
  const statusConfig = {
    under_review: {
      icon: Clock,
      title: "Application Under Review",
      description:
        "Your application is being reviewed by our team. This usually takes 24-48 hours.",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
    },
    approved: {
      icon: CheckCircle,
      title: "Application Approved!",
      description:
        "Congratulations! Your chef account has been approved. You can now start accepting orders.",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    rejected: {
      icon: XCircle,
      title: "Application Rejected",
      description:
        reason || "Your application was rejected. Please contact support.",
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] ||
    statusConfig["under_review"];

  const Icon = config.icon;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        
        {/* ICON + TITLE */}
        <div className="text-center mb-8">
          <div
            className={`w-24 h-24 ${config.bgColor} rounded-full mx-auto mb-4 flex items-center justify-center`}
          >
            <Icon className={`w-12 h-12 ${config.textColor}`} />
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            {config.title}
          </h1>

          <p className="text-gray-500 mt-4 leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* UNDER REVIEW EXTRA INFO */}
        {status === "under_review" && (
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-800 mb-3">
                What happens next?
              </h3>

              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Our team will verify your documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>You'll receive a notification on approval</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>You can then start your culinary journey!</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* MAIN BUTTON */}
        <Button
          onClick={() =>
            navigate(
              status === "approved" ? "/dashboard" : "/auth/login"
            )
          }
          className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-6 rounded-xl text-lg"
        >
          {status === "approved" ? "Go to Dashboard" : "Back to Login"}
        </Button>

        {/* REJECT BUTTON */}
        {status === "rejected" && (
          <Button
            onClick={() => navigate("/auth/signup")}
            variant="outline"
            className="w-full mt-3 py-6 rounded-xl"
          >
            Reapply
          </Button>
        )}
      </div>
    </div>
  );
}