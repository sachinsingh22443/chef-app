import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 🔥 HANDLE SUBMIT (CONNECTED TO BACKEND)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters!");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        "https://chef-backend-qh12.onrender.com/auth/change-password",
        {
          current_password: formData.currentPassword,
          new_password: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Password changed successfully 🔥");

      // reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      navigate(-1);

    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* HEADER */}
      <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-b-[40px] p-6 pb-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-white mb-4"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          <span className="font-medium">Back</span>
        </button>
        <h1 className="text-3xl font-bold text-white mb-2">
          Change Password
        </h1>
        <p className="text-white/90">
          Update your security credentials
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">

        {/* INFO */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-bold text-gray-800 mb-2">
                Password Security
              </h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Use at least 8 characters</li>
                <li>• Include numbers & special characters</li>
                <li>• Don't reuse old passwords</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FIELDS */}
        <div className="bg-white rounded-3xl p-5 shadow-lg space-y-4">

          {/* CURRENT */}
          <div>
            <Label>Current Password</Label>
            <div className="relative mt-1">
              <Input
                type={showPasswords.current ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currentPassword: e.target.value,
                  })
                }
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    current: !showPasswords.current,
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPasswords.current ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* NEW */}
          <div>
            <Label>New Password</Label>
            <div className="relative mt-1">
              <Input
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    newPassword: e.target.value,
                  })
                }
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    new: !showPasswords.new,
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPasswords.new ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {/* CONFIRM */}
          <div>
            <Label>Confirm Password</Label>
            <div className="relative mt-1">
              <Input
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    confirm: !showPasswords.confirm,
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPasswords.confirm ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

        </div>

      </form>
      
      {/* SUBMIT BUTTON */}
      <div className=" left-0 right-0 bg-white border-t border-gray-200 p-4 pb-6 z-50">
  <div className="max-w-md mx-auto">
    <Button
      onClick={handleSubmit}
      disabled={loading}
      className="w-full py-6 bg-gray-800 text-white rounded-xl"
    >
      {loading ? "Updating..." : "Change Password"}
    </Button>
  </div>
</div>

    </div>
  );
}