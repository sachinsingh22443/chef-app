import { useState ,useEffect} from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) return;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return;
    }
  } catch {
    localStorage.removeItem("token");
    return;
  }

  fetch("https://chef-backend-qh12.onrender.com/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (res.ok) {
        navigate("/app");
      } else {
        localStorage.removeItem("token");
      }
    })
    .catch(() => {
      localStorage.removeItem("token");
    });
}, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await axios.post(
        "https://chef-backend-qh12.onrender.com/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      // ✅ token save
      if (res.data.application_status === "pending") {
  alert("Your application is under review. Please wait for admin approval.");

  navigate("/auth/status");
}
else if (res.data.application_status === "rejected") {
  alert(" Your application has been rejected. Please contact support.");

  navigate("/auth/status");
}
else {
  // Approved user only
  localStorage.setItem("token", res.data.access_token);
  navigate("/app");
}

    } catch (error: any) {
  const message = error.response?.data?.detail;

  if (message?.toLowerCase().includes("under review")) {
    alert("⏳ Your account is under review. Please wait for admin approval.");
    navigate("/auth/status");
    return;
  }

  if (message?.toLowerCase().includes("rejected")) {
    alert("❌ Your account has been rejected.");
    navigate("/auth/status");
    return;
  }

  alert("Invalid email or password ❌");
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
            👨‍🍳
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
          <p className="text-gray-500 mt-2">Log in to your chef account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="chef@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/auth/forgot-password")}
            className="text-sm text-orange-500 hover:text-orange-600"
          >
            Forgot Password?
          </button>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-6 rounded-xl text-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/auth/signup")}
              className="text-orange-500 font-medium hover:text-orange-600"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}