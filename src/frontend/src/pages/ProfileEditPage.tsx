import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Droplet,
  Info,
  Loader2,
  Phone,
  Pill,
  Save,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetMyMedicalProfile,
  useUpdatePatientProfile,
} from "../hooks/useQueries";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface FormData {
  name: string;
  age: string;
  bloodGroup: string;
  allergies: string;
  medicalConditions: string;
  currentMedications: string;
  emergencyContact: string;
}

const EMPTY_FORM: FormData = {
  name: "",
  age: "",
  bloodGroup: "",
  allergies: "",
  medicalConditions: "",
  currentMedications: "",
  emergencyContact: "",
};

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: medicalProfile, isLoading } = useGetMyMedicalProfile();
  const updateProfile = useUpdatePatientProfile();

  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/auth" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  useEffect(() => {
    if (medicalProfile) {
      setForm({
        name: medicalProfile.name ?? "",
        age: medicalProfile.age?.toString() ?? "",
        bloodGroup: medicalProfile.bloodGroup ?? "",
        allergies: medicalProfile.allergies?.join(", ") ?? "",
        medicalConditions: medicalProfile.medicalConditions?.join(", ") ?? "",
        currentMedications: medicalProfile.currentMedications?.join(", ") ?? "",
        emergencyContact: medicalProfile.emergencyContact ?? "",
      });
    }
  }, [medicalProfile]);

  const setField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.age.trim()) {
      newErrors.age = "Age is required";
    } else if (
      Number.isNaN(Number(form.age)) ||
      Number(form.age) < 0 ||
      Number(form.age) > 150
    ) {
      newErrors.age = "Enter a valid age (0–150)";
    }
    if (!form.bloodGroup) newErrors.bloodGroup = "Blood group is required";
    if (!form.emergencyContact.trim()) {
      newErrors.emergencyContact = "Emergency contact is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const splitByComma = (s: string): string[] =>
    s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fix the errors before saving");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: form.name.trim(),
        age: BigInt(Math.floor(Number(form.age))),
        bloodGroup: form.bloodGroup,
        allergies: splitByComma(form.allergies),
        medicalConditions: splitByComma(form.medicalConditions),
        currentMedications: splitByComma(form.currentMedications),
        emergencyContact: form.emergencyContact.trim(),
      });
      toast.success("Medical profile saved successfully");
      void navigate({ to: "/dashboard" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Back Link & Header */}
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Medical Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Update your critical medical information. This data is visible to
            emergency responders.
          </p>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-medical-blue-light rounded-lg mb-6 border border-medical-blue/20">
          <Info
            className="w-4 h-4 text-medical-blue flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <p className="text-sm text-medical-blue leading-relaxed">
            Fields marked with{" "}
            <span className="text-medical-red font-semibold">*</span> are
            required. Blood group and allergies are critical for emergency care.
          </p>
        </div>

        <Card className="shadow-medical border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Patient Information</CardTitle>
            <CardDescription>
              All information is securely stored on the Internet Computer
              blockchain.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2
                  className="w-6 h-6 animate-spin text-medical-blue"
                  aria-label="Loading profile"
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Info */}
                <section aria-labelledby="basic-info-heading">
                  <h2
                    id="basic-info-heading"
                    className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2"
                  >
                    <UserRound className="w-4 h-4" aria-hidden="true" />
                    Basic Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="med-name">
                        Full Name{" "}
                        <span
                          className="text-medical-red"
                          aria-label="required"
                        >
                          *
                        </span>
                      </Label>
                      <Input
                        id="med-name"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        placeholder="Jane Elizabeth Smith"
                        autoComplete="name"
                        className={`h-11 ${errors.name ? "border-destructive" : ""}`}
                        aria-describedby={
                          errors.name ? "med-name-error" : undefined
                        }
                        aria-required="true"
                      />
                      {errors.name && (
                        <p
                          id="med-name-error"
                          className="text-xs text-destructive"
                          role="alert"
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="med-age">
                        Age{" "}
                        <span
                          className="text-medical-red"
                          aria-label="required"
                        >
                          *
                        </span>
                      </Label>
                      <Input
                        id="med-age"
                        type="number"
                        min="0"
                        max="150"
                        value={form.age}
                        onChange={(e) => setField("age", e.target.value)}
                        placeholder="34"
                        className={`h-11 ${errors.age ? "border-destructive" : ""}`}
                        aria-describedby={
                          errors.age ? "med-age-error" : undefined
                        }
                        aria-required="true"
                      />
                      {errors.age && (
                        <p
                          id="med-age-error"
                          className="text-xs text-destructive"
                          role="alert"
                        >
                          {errors.age}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="med-blood">
                        Blood Group{" "}
                        <span
                          className="text-medical-red"
                          aria-label="required"
                        >
                          *
                        </span>
                      </Label>
                      <Select
                        value={form.bloodGroup}
                        onValueChange={(v) => setField("bloodGroup", v)}
                      >
                        <SelectTrigger
                          id="med-blood"
                          className={`h-11 ${errors.bloodGroup ? "border-destructive" : ""}`}
                          aria-required="true"
                          aria-describedby={
                            errors.bloodGroup ? "med-blood-error" : undefined
                          }
                        >
                          <Droplet
                            className="w-4 h-4 text-medical-red mr-2"
                            aria-hidden="true"
                          />
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          {BLOOD_GROUPS.map((bg) => (
                            <SelectItem key={bg} value={bg}>
                              {bg}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.bloodGroup && (
                        <p
                          id="med-blood-error"
                          className="text-xs text-destructive"
                          role="alert"
                        >
                          {errors.bloodGroup}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Medical Details */}
                <section aria-labelledby="medical-details-heading">
                  <h2
                    id="medical-details-heading"
                    className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4" aria-hidden="true" />
                    Medical Details
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="med-allergies">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle
                            className="w-3.5 h-3.5 text-medical-red"
                            aria-hidden="true"
                          />
                          Allergies
                        </span>
                      </Label>
                      <Input
                        id="med-allergies"
                        value={form.allergies}
                        onChange={(e) => setField("allergies", e.target.value)}
                        placeholder="Penicillin, Shellfish, Latex (comma-separated)"
                        className="h-11"
                        aria-describedby="allergies-hint"
                      />
                      <p
                        id="allergies-hint"
                        className="text-xs text-muted-foreground"
                      >
                        Separate multiple allergies with commas
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="med-conditions">
                        <span className="flex items-center gap-1.5">
                          <Activity
                            className="w-3.5 h-3.5 text-medical-blue"
                            aria-hidden="true"
                          />
                          Medical Conditions
                        </span>
                      </Label>
                      <Textarea
                        id="med-conditions"
                        value={form.medicalConditions}
                        onChange={(e) =>
                          setField("medicalConditions", e.target.value)
                        }
                        placeholder="Type 2 Diabetes, Hypertension, Asthma (comma-separated)"
                        className="resize-none min-h-[80px]"
                        aria-describedby="conditions-hint"
                      />
                      <p
                        id="conditions-hint"
                        className="text-xs text-muted-foreground"
                      >
                        List all relevant medical conditions, separated by
                        commas
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="med-medications">
                        <span className="flex items-center gap-1.5">
                          <Pill
                            className="w-3.5 h-3.5 text-medical-amber"
                            aria-hidden="true"
                          />
                          Current Medications
                        </span>
                      </Label>
                      <Input
                        id="med-medications"
                        value={form.currentMedications}
                        onChange={(e) =>
                          setField("currentMedications", e.target.value)
                        }
                        placeholder="Metformin 500mg, Lisinopril 10mg (comma-separated)"
                        className="h-11"
                        aria-describedby="medications-hint"
                      />
                      <p
                        id="medications-hint"
                        className="text-xs text-muted-foreground"
                      >
                        Include medication names and dosages where applicable
                      </p>
                    </div>
                  </div>
                </section>

                {/* Emergency Contact */}
                <section aria-labelledby="emergency-contact-heading">
                  <h2
                    id="emergency-contact-heading"
                    className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4 flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" aria-hidden="true" />
                    Emergency Contact
                  </h2>
                  <div className="space-y-2">
                    <Label htmlFor="med-contact">
                      Emergency Contact{" "}
                      <span className="text-medical-red" aria-label="required">
                        *
                      </span>
                    </Label>
                    <Input
                      id="med-contact"
                      value={form.emergencyContact}
                      onChange={(e) =>
                        setField("emergencyContact", e.target.value)
                      }
                      placeholder="John Smith (Spouse) — +1 555-0123"
                      className={`h-11 ${errors.emergencyContact ? "border-destructive" : ""}`}
                      aria-describedby={
                        errors.emergencyContact
                          ? "med-contact-error"
                          : "contact-hint"
                      }
                      aria-required="true"
                    />
                    {errors.emergencyContact ? (
                      <p
                        id="med-contact-error"
                        className="text-xs text-destructive"
                        role="alert"
                      >
                        {errors.emergencyContact}
                      </p>
                    ) : (
                      <p
                        id="contact-hint"
                        className="text-xs text-muted-foreground"
                      >
                        Include name, relationship, and phone number
                      </p>
                    )}
                  </div>
                </section>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => void handleSave()}
                    disabled={updateProfile.isPending}
                    className="flex-1 h-11 bg-medical-blue hover:bg-medical-blue/90 text-white font-semibold"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2
                          className="mr-2 h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                        Save Medical Profile
                      </>
                    )}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="flex-1 sm:flex-none h-11"
                  >
                    <Link to="/dashboard">Cancel</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
