import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Upload,
  UserRound,
  Mail,
  Phone,
  MapPin,
  FileText,
  Sparkles,
  Camera,
  Save,
  CheckCircle2,
  X,
} from "lucide-react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

const BASE_URL = "https://chef-backend-qh12.onrender.com";

export default function EditProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    specialties: "",
  });

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again");
        navigate("/login");
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          bio: res.data.bio || "",
          location: res.data.location || "",
          specialties: res.data.specialties || "",
        });

        if (res.data.profile_image) {
          setPreview(res.data.profile_image);
        }
      } catch (err: any) {
        console.error("FETCH ERROR:", err.response?.data);
        toast.error("Failed to load profile");
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeNewImage = () => {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview(null);
  };

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login again");
      navigate("/login");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("bio", formData.bio);
      data.append("location", formData.location);
      data.append("specialties", formData.specialties);

      if (image) {
        data.append("profile_image", image);
      }

      await axios.put(`${BASE_URL}/auth/users/update-profile`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Profile updated successfully 🚀");
      navigate("/profile");
    } catch (err: any) {
      console.log("ERROR:", err.response?.data);
      toast.error(err.response?.data?.detail || "Update failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const specialties = formData.specialties
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10">
            <UserRound className="h-7 w-7 animate-pulse text-orange-400" />
          </div>
          <p className="text-sm font-semibold text-white">Loading your profile</p>
          <p className="mt-1 text-xs text-zinc-500">Opening Chef Profile Studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-orange-500/10 blur-[120px]" />
        <div className="absolute right-0 top-1/2 h-96 w-96 rounded-full bg-amber-300/5 blur-[130px]" />
      </div>

      <main className="relative mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] transition hover:border-orange-400/30 hover:bg-orange-500/10"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5 text-zinc-300" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.9)]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">
                  Chef Profile Studio
                </span>
              </div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Edit profile
              </h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2 sm:flex">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            <span className="text-[11px] font-semibold text-emerald-300">
              Profile editor
            </span>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
            {/* Left identity panel */}
            <aside className="space-y-5">
              <section className="overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#17130f] via-[#111] to-[#0b0b0b] p-5 shadow-2xl shadow-black/30 sm:p-6">
                <div className="mb-5">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
                    <Camera className="h-4 w-4 text-orange-300" />
                  </div>
                  <h2 className="text-lg font-bold">Your identity</h2>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Make your chef profile recognizable to customers.
                  </p>
                </div>

                <div className="relative mx-auto w-fit">
                  <div className="h-36 w-36 overflow-hidden rounded-[34px] border border-orange-300/20 bg-zinc-900 p-1.5 shadow-xl shadow-orange-950/20 sm:h-44 sm:w-44">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Profile preview"
                        className="h-full w-full rounded-[27px] object-cover"
                        onError={(e: any) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-[27px] bg-gradient-to-br from-orange-500/20 to-zinc-900">
                        <ChefAvatar />
                      </div>
                    )}
                  </div>

                  {preview && image && (
                    <button
                      type="button"
                      onClick={removeNewImage}
                      className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-xl border-4 border-[#111] bg-red-500 text-white"
                      aria-label="Remove selected image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-5 text-center transition hover:border-orange-400/30 hover:bg-orange-500/[0.05]">
                  <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
                    <Upload className="h-4 w-4 text-orange-300" />
                  </span>
                  <span className="text-sm font-semibold text-zinc-200">
                    {image ? "Change selected photo" : "Upload new photo"}
                  </span>
                  <span className="mt-1 text-[11px] text-zinc-600">
                    JPG, PNG or WEBP • max 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </label>
              </section>

              {/* Live mini card */}
              <section className="rounded-[28px] border border-white/10 bg-[#101010] p-5 sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                      Live preview
                    </p>
                    <h3 className="mt-1 text-base font-bold">Customer view</h3>
                  </div>
                  <Sparkles className="h-4 w-4 text-orange-300" />
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-xl bg-zinc-800">
                      {preview ? (
                        <img
                          src={preview}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ChefAvatar small />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {formData.name || "Your chef name"}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-500">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">
                          {formData.location || "Your kitchen location"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-xs leading-5 text-zinc-500">
                    {formData.bio || "Your chef story will appear here."}
                  </p>

                  {specialties.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {specialties.slice(0, 4).map((item, index) => (
                        <span
                          key={`${item}-${index}`}
                          className="rounded-full border border-orange-400/10 bg-orange-500/[0.06] px-2.5 py-1 text-[10px] text-orange-200"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </aside>

            {/* Main editor */}
            <div className="space-y-5">
              <section className="rounded-[30px] border border-white/10 bg-[#101010] p-5 sm:p-6">
                <SectionHeading
                  icon={<UserRound className="h-4 w-4" />}
                  eyebrow="Identity"
                  title="Personal details"
                  description="Keep your basic chef information accurate."
                />

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <Field icon={<UserRound />} label="Full name" required>
                    <Input
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="Your full name"
                      className="border-white/10 bg-white/[0.035] text-white placeholder:text-zinc-700 focus-visible:ring-orange-500/30"
                    />
                  </Field>

                  <Field icon={<Mail />} label="Email address" hint="Account email">
                    <Input
                      value={formData.email}
                      disabled
                      className="border-white/5 bg-white/[0.02] text-zinc-500 placeholder:text-zinc-700"
                    />
                  </Field>

                  <Field icon={<Phone />} label="Phone number">
                    <Input
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="Your contact number"
                      className="border-white/10 bg-white/[0.035] text-white placeholder:text-zinc-700 focus-visible:ring-orange-500/30"
                    />
                  </Field>

                  <Field icon={<MapPin />} label="Kitchen location">
                    <Input
                      value={formData.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      placeholder="City / kitchen location"
                      className="border-white/10 bg-white/[0.035] text-white placeholder:text-zinc-700 focus-visible:ring-orange-500/30"
                    />
                  </Field>
                </div>
              </section>

              <section className="rounded-[30px] border border-white/10 bg-[#101010] p-5 sm:p-6">
                <SectionHeading
                  icon={<FileText className="h-4 w-4" />}
                  eyebrow="Story"
                  title="Chef introduction"
                  description="Tell customers what makes your kitchen special."
                />

                <div className="mt-6">
                  <Label className="mb-2 block text-xs font-semibold text-zinc-300">
                    Bio
                  </Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="Share your cooking style, experience and what customers can expect..."
                    className="min-h-[150px] resize-none border-white/10 bg-white/[0.035] text-sm leading-6 text-white placeholder:text-zinc-700 focus-visible:ring-orange-500/30"
                  />
                  <div className="mt-2 flex justify-between text-[10px] text-zinc-600">
                    <span>Keep it authentic and customer-friendly.</span>
                    <span>{formData.bio.length} characters</span>
                  </div>
                </div>
              </section>

              <section className="rounded-[30px] border border-white/10 bg-[#101010] p-5 sm:p-6">
                <SectionHeading
                  icon={<Sparkles className="h-4 w-4" />}
                  eyebrow="Expertise"
                  title="Specialties"
                  description="Add comma-separated cuisines or signature skills."
                />

                <div className="mt-6">
                  <Label className="mb-2 block text-xs font-semibold text-zinc-300">
                    Your specialties
                  </Label>
                  <Input
                    value={formData.specialties}
                    onChange={(e) =>
                      updateField("specialties", e.target.value)
                    }
                    placeholder="North Indian, Healthy Meals, Desserts, Biryani"
                    className="h-12 border-white/10 bg-white/[0.035] text-white placeholder:text-zinc-700 focus-visible:ring-orange-500/30"
                  />

                  <div className="mt-3 flex min-h-8 flex-wrap gap-2">
                    {specialties.length > 0 ? (
                      specialties.map((item, index) => (
                        <span
                          key={`${item}-${index}`}
                          className="rounded-full border border-orange-400/15 bg-orange-500/[0.07] px-3 py-1.5 text-xs font-medium text-orange-200"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-zinc-600">
                        Your specialty tags will appear here.
                      </span>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Sticky save bar */}
          <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#090909]/90 px-4 py-3 backdrop-blur-xl sm:px-6">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-300">
                    Ready to update
                  </p>
                  <p className="text-[10px] text-zinc-600">
                    Your changes will be saved to your chef profile.
                  </p>
                </div>
              </div>

              <div className="ml-auto flex w-full gap-2 sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1 border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.07] hover:text-white sm:flex-none"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-orange-500 font-bold text-white shadow-lg shadow-orange-950/30 hover:bg-orange-400 sm:min-w-[170px] sm:flex-none"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Updating..." : "Save changes"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function SectionHeading({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300/60">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-bold text-white">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  required,
  hint,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
          <span className="text-zinc-600 [&_svg]:h-3.5 [&_svg]:w-3.5">
            {icon}
          </span>
          {label}
          {required && <span className="text-orange-400">*</span>}
        </Label>
        {hint && <span className="text-[10px] text-zinc-700">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ChefAvatar({ small = false }: { small?: boolean }) {
  return (
    <div className="text-center">
      <div
        className={`mx-auto flex items-center justify-center rounded-full border border-orange-400/15 bg-orange-500/10 ${
          small ? "h-7 w-7" : "h-16 w-16"
        }`}
      >
        <span className={small ? "text-sm" : "text-3xl"}>👨‍🍳</span>
      </div>
    </div>
  );
}
