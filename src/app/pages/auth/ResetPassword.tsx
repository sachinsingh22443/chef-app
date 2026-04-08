import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setLoading(true);

      await axios.post("https://chef-backend-1.onrender.com/auth/reset-password", {
        token,
        new_password: password,
      });

      alert("Password updated successfully!");
      navigate("/auth/login");

    } catch (err) {
      console.log(err);
      alert("Invalid or expired link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">

      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl">

        <h1 className="text-2xl font-bold mb-4 text-center">
          Reset Password
        </h1>

        <Input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          onClick={handleReset}
          disabled={loading}
          className="w-full mt-4"
        >
          {loading ? "Updating..." : "Reset Password"}
        </Button>

      </div>

    </div>
  );
}