import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { Button } from "../../components/ui/button";

export default function OTPVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, type } = location.state || { phone: "+91 9876543210", type: "signup" };
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    // Mock verification
    if (type === "signup") {
      navigate("/auth/status");
    } else {
      navigate("/");
    }
  };

  const handleResend = () => {
    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
            📱
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Verify OTP</h1>
          <p className="text-gray-500 mt-2">
            Enter the 6-digit code sent to
          </p>
          <p className="text-gray-800 font-medium">{phone}</p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
            />
          ))}
        </div>

        <div className="text-center mb-6">
          {timer > 0 ? (
            <p className="text-gray-500">
              Resend code in <span className="font-medium text-orange-500">{timer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-orange-500 font-medium hover:text-orange-600"
            >
              Resend OTP
            </button>
          )}
        </div>

        <Button
          onClick={handleVerify}
          disabled={otp.some((digit) => !digit)}
          className="w-full bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-6 rounded-xl text-lg disabled:opacity-50"
        >
          Verify & Continue
        </Button>
      </div>
    </div>
  );
}
