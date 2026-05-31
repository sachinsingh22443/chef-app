import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Eye, EyeOff, Upload } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    profilePhoto: null as File | null,
    address: "",
    fssaiNumber: "",
    fssaiDocument: null as File | null,
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",

    bio: "",
    location: "",
    specialties: "",
  });

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      // OTP page (optional)
      setStep(2);
    } 
    else if (step === 2) {
      setStep(3);
    } 
    else {
      try {
       setLoading(true);

          const form = new FormData();

        form.append("name", formData.name);
        form.append("phone", formData.phone);
        form.append("email", formData.email);
        form.append("password", formData.password);

        form.append("address", formData.address);
        form.append("fssai_number", formData.fssaiNumber);

        form.append("bio", formData.bio);
        form.append("location", formData.location);
        form.append("specialties", formData.specialties);

        form.append("account_holder_name", formData.accountHolderName);
        form.append("account_number", formData.accountNumber);
        form.append("ifsc_code", formData.ifscCode);



        // ✅ IMPORTANT FIX
        if (formData.profilePhoto) {
          form.append("profile_image", formData.profilePhoto);
        }

        if (formData.fssaiDocument) {
          form.append("fssai_document", formData.fssaiDocument);
        }

        const res = await axios.post(
          "https://chef-backend-qh12.onrender.com/auth/signup",
          form,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log(res.data);

        navigate("/auth/status");

      } catch (error: any) {
  console.error(error.response?.data || error.message);
  alert("Signup failed");
}
finally {
  setLoading(false);
}
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/auth/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
            👨‍🍳
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Join as Chef</h1>
          <p className="text-gray-500 mt-2">
            Step {step} of 3 - {step === 1 ? "Personal Info" : step === 2 ? "Business Details" : "Bank Details"}
          </p>
        </div>

        <form onSubmit={handleNext} className="space-y-5">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div>
  <Label className="text-gray-700">Profile Photo</Label>

  <label className="mt-1 flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 p-4">
    
    {preview ? (
      <img
        src={preview}
        alt="Profile Preview"
        className="w-24 h-24 rounded-full object-cover border mb-3"
      />
    ) : (
      <Upload className="w-8 h-8 text-gray-400 mb-2" />
    )}

    {formData.profilePhoto ? (
      <>
        <span className="text-green-600 font-medium text-center">
          {formData.profilePhoto.name}
        </span>

        <span className="text-xs text-gray-500 mt-1">
          Image uploaded successfully
        </span>
      </>
    ) : (
      <span className="text-sm text-gray-500">
        Click to Upload Photo
      </span>
    )}

    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];

        if (file) {
          setFormData({
            ...formData,
            profilePhoto: file,
          });

          setPreview(URL.createObjectURL(file));
        }
      }}
    />
  </label>
</div>

              <div>
                <Label>Full Name</Label>
                <Input onChange={(e)=>setFormData({...formData,name:e.target.value})} required />
              </div>

              <div>
                <Label>Phone</Label>
                <Input onChange={(e)=>setFormData({...formData,phone:e.target.value})} required />
              </div>

              <div>
                <Label>Email</Label>
                <Input type="email" onChange={(e)=>setFormData({...formData,email:e.target.value})} required />
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    onChange={(e)=>setFormData({...formData,password:e.target.value})}
                    required
                  />
                  <button type="button" onClick={()=>setShowPassword(!showPassword)}
                    className="absolute right-3 top-2"
                  >
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <Label>Address</Label>
              <Textarea onChange={(e)=>setFormData({...formData,address:e.target.value})} required />

              <Label>FSSAI Number</Label>
              <Input onChange={(e)=>setFormData({...formData,fssaiNumber:e.target.value})} required />

              <Label>FSSAI Document</Label>
              <input type="file"
                onChange={(e)=>setFormData({...formData,fssaiDocument:e.target.files?.[0] || null})}
              />

              <Label>Location</Label>
              <Input
               placeholder="e.g. Jaipur"
               onChange={(e)=>setFormData({...formData, location: e.target.value})}
               />

               <Label>Bio</Label>
               <Textarea
               placeholder="Tell about your cooking"
               onChange={(e)=>setFormData({...formData, bio: e.target.value})}
              />

              <Label>Specialties</Label>
               <Input
                 placeholder="e.g. Indian,Chinese"
                   onChange={(e)=>setFormData({...formData, specialties: e.target.value})}
                    />
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <Label>Account Holder</Label>
              <Input onChange={(e)=>setFormData({...formData,accountHolderName:e.target.value})} required />

              <Label>Account Number</Label>
              <Input onChange={(e)=>setFormData({...formData,accountNumber:e.target.value})} required />

              <Label>IFSC</Label>
              <Input onChange={(e)=>setFormData({...formData,ifscCode:e.target.value})} required />
            </>
          )}

          <div className="flex gap-3">
            <Button type="button" onClick={handleBack} variant="outline" className="flex-1">
              Back
            </Button>
            <Button
  type="submit"
  disabled={loading}
  className="flex-1 bg-orange-500 text-white"
>
  {loading
    ? "Creating Account..."
    : step === 3
    ? "Submit"
    : "Next"}
</Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button onClick={()=>navigate("/auth/login")} className="text-orange-500">
            Already have account? Login
          </button>
        </div>
      </div>
    </div>
  );
}