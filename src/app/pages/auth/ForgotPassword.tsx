import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await axios.post("https://chef-backend-qh12.onrender.com/auth/forgot-password", {
        email: email,
      });

      setSent(true);

    } catch (err: any) {
      console.log("FORGOT ERROR:", err);

      if (err.response?.data?.detail) {
        alert(err.response.data.detail);
      } else {
        alert("Something went wrong");
      }

    } finally {
      setLoading(false);
    }
  };

  // ✅ SUCCESS SCREEN (SAME UI)
  if (sent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
              ✅
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Check Your Email</h1>
            <p className="text-gray-500 mt-2">
              We've sent a password reset link to
            </p>
            <p className="text-gray-800 font-medium mt-1">{email}</p>
          </div>

          <Button
            onClick={() => navigate("/auth/login")}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-6 rounded-xl text-lg"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // ✅ FORM UI (UNCHANGED)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
            🔒
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Forgot Password?</h1>
          <p className="text-gray-500 mt-2">
            Enter your email to receive a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email" className="text-gray-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="chef@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-6 rounded-xl text-lg"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/auth/login")}
            className="text-orange-500 font-medium"
          >
            Back to Login
          </button>
        </div>

      </div>
    </div>
  );
}