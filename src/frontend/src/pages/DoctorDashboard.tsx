import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@dfinity/principal";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  Clock,
  Droplet,
  FilePenLine,
  History,
  Info,
  Loader2,
  LogOut,
  PenLine,
  Phone,
  Pill,
  Save,
  Search,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { MedicalProfile } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddMedicalNote,
  useGetCallerUserProfile,
  useGetFullMedicalProfile,
  useGetMedicalHistory,
  useIsCallerAdmin,
  useSearchProfilesByName,
  useUpdateMedicalProfileForDoctor,
} from "../hooks/useQueries";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// ─── Patient Edit Form ─────────────────────────────────────────────────────────

interface PatientEditFormProps {
  patientId: Principal;
  profile: MedicalProfile;
  onClose: () => void;
}

function PatientEditForm({
  patientId,
  profile,
  onClose,
}: PatientEditFormProps) {
  const [form, setForm] = useState({
    name: profile.name ?? "",
    age: profile.age?.toString() ?? "",
    bloodGroup: profile.bloodGroup ?? "",
    allergies: profile.allergies?.join(", ") ?? "",
    medicalConditions: profile.medicalConditions?.join(", ") ?? "",
    currentMedications: profile.currentMedications?.join(", ") ?? "",
    emergencyContact: profile.emergencyContact ?? "",
    changes: "",
  });

  const updateProfile = useUpdateMedicalProfileForDoctor();

  const setField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const splitByComma = (s: string): string[] =>
    s
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSave = async () => {
    if (!form.changes.trim()) {
      toast.error(
        "Please describe the changes made (required for audit trail)",
      );
      return;
    }
    if (!form.name.trim() || !form.age || !form.bloodGroup) {
      toast.error("Name, age, and blood group are required");
      return;
    }

    try {
      await updateProfile.mutateAsync({
        patientId,
        newProfile: {
          name: form.name.trim(),
          age: BigInt(Math.floor(Number(form.age))),
          bloodGroup: form.bloodGroup,
          allergies: splitByComma(form.allergies),
          medicalConditions: splitByComma(form.medicalConditions),
          currentMedications: splitByComma(form.currentMedications),
          emergencyContact: form.emergencyContact.trim(),
        },
        changes: form.changes.trim(),
      });
      toast.success("Patient profile updated successfully");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="doc-name"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Name
          </Label>
          <Input
            id="doc-name"
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="doc-age"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Age
          </Label>
          <Input
            id="doc-age"
            type="number"
            value={form.age}
            onChange={(e) => setField("age", e.target.value)}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="doc-blood"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Blood Group
          </Label>
          <Select
            value={form.bloodGroup}
            onValueChange={(v) => setField("bloodGroup", v)}
          >
            <SelectTrigger id="doc-blood" className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BLOOD_GROUPS.map((bg) => (
                <SelectItem key={bg} value={bg}>
                  {bg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="doc-contact"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Emergency Contact
          </Label>
          <Input
            id="doc-contact"
            value={form.emergencyContact}
            onChange={(e) => setField("emergencyContact", e.target.value)}
            className="h-10"
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label
            htmlFor="doc-allergies"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"
          >
            <AlertTriangle
              className="w-3 h-3 text-medical-red"
              aria-hidden="true"
            />
            Allergies
          </Label>
          <Input
            id="doc-allergies"
            value={form.allergies}
            onChange={(e) => setField("allergies", e.target.value)}
            placeholder="Comma-separated"
            className="h-10"
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label
            htmlFor="doc-conditions"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Medical Conditions
          </Label>
          <Textarea
            id="doc-conditions"
            value={form.medicalConditions}
            onChange={(e) => setField("medicalConditions", e.target.value)}
            placeholder="Comma-separated"
            className="resize-none min-h-[70px]"
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label
            htmlFor="doc-meds"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Current Medications
          </Label>
          <Input
            id="doc-meds"
            value={form.currentMedications}
            onChange={(e) => setField("currentMedications", e.target.value)}
            placeholder="Comma-separated"
            className="h-10"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-1.5">
        <Label
          htmlFor="doc-changes"
          className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5"
        >
          <History className="w-3 h-3" aria-hidden="true" />
          Changes Summary{" "}
          <span className="text-medical-red" aria-label="required">
            *
          </span>
        </Label>
        <Textarea
          id="doc-changes"
          value={form.changes}
          onChange={(e) => setField("changes", e.target.value)}
          placeholder="Describe what was changed and why (required for audit trail)..."
          className="resize-none min-h-[70px]"
          aria-required="true"
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => void handleSave()}
          disabled={updateProfile.isPending}
          className="flex-1 h-10 bg-medical-blue hover:bg-medical-blue/90 text-white"
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
              Save Changes
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onClose} className="h-10">
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ─── Patient Panel ─────────────────────────────────────────────────────────────

interface PatientPanelProps {
  patientId: Principal;
  patientName: string;
  onClose: () => void;
}

function PatientPanel({ patientId, patientName, onClose }: PatientPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState("");

  const { data: profile, isLoading: profileLoading } =
    useGetFullMedicalProfile(patientId);
  const { data: history, isLoading: historyLoading } =
    useGetMedicalHistory(patientId);
  const addNote = useAddMedicalNote();

  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast.error("Note cannot be empty");
      return;
    }
    try {
      await addNote.mutateAsync({ patientId, note: noteText.trim() });
      toast.success("Note added successfully");
      setNoteText("");
    } catch {
      toast.error("Failed to add note");
    }
  };

  const formatTimestamp = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    return new Date(ms).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{patientName}</h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {patientId.toText().slice(0, 20)}...
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close patient panel"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>

      {/* Medical Profile */}
      <Card className="shadow-medical border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity
                className="w-4 h-4 text-medical-blue"
                aria-hidden="true"
              />
              Full Medical Profile
            </CardTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-1.5 text-medical-blue border-medical-blue hover:bg-medical-blue-light"
              >
                <FilePenLine className="w-3.5 h-3.5" aria-hidden="true" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : !profile ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No medical profile on file
            </p>
          ) : isEditing ? (
            <PatientEditForm
              patientId={patientId}
              profile={profile}
              onClose={() => setIsEditing(false)}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-x-6">
              {[
                { label: "Name", value: profile.name, icon: UserRound },
                {
                  label: "Age",
                  value: profile.age?.toString(),
                  icon: UserRound,
                },
                {
                  label: "Blood Group",
                  value: profile.bloodGroup,
                  icon: Droplet,
                  critical: true,
                },
                {
                  label: "Emergency Contact",
                  value: profile.emergencyContact,
                  icon: Phone,
                },
                {
                  label: "Allergies",
                  value: profile.allergies?.join(", "),
                  icon: AlertTriangle,
                  critical: true,
                },
                {
                  label: "Medications",
                  value: profile.currentMedications?.join(", "),
                  icon: Pill,
                  warning: true,
                },
                {
                  label: "Medical Conditions",
                  value: profile.medicalConditions?.join(", "),
                  icon: Activity,
                },
              ].map(({ label, value, icon: Icon, critical, warning }) => (
                <div
                  key={label}
                  className="flex items-start gap-2 py-2 border-b border-border last:border-b-0"
                >
                  <Icon
                    className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                      critical
                        ? "text-medical-red"
                        : warning
                          ? "text-medical-amber"
                          : "text-medical-blue"
                    }`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p
                      className={`text-sm font-medium ${
                        critical
                          ? "text-medical-red"
                          : warning
                            ? "text-medical-amber"
                            : "text-foreground"
                      }`}
                    >
                      {value || (
                        <span className="text-muted-foreground italic font-normal">
                          —
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Note */}
      <Card className="shadow-medical border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PenLine className="w-4 h-4 text-medical-blue" aria-hidden="true" />
            Add Clinical Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Enter clinical observations, treatment notes, or follow-up instructions..."
            className="resize-none min-h-[100px]"
            aria-label="Clinical note"
          />
          <Button
            onClick={() => void handleAddNote()}
            disabled={addNote.isPending || !noteText.trim()}
            size="sm"
            className="bg-medical-blue hover:bg-medical-blue/90 text-white gap-2"
          >
            {addNote.isPending ? (
              <>
                <Loader2
                  className="h-3.5 w-3.5 animate-spin"
                  aria-hidden="true"
                />
                Adding...
              </>
            ) : (
              <>
                <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                Add Note
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Change History */}
      <Card className="shadow-medical border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4 text-medical-blue" aria-hidden="true" />
            Change History
          </CardTitle>
          <CardDescription className="text-xs">
            Full audit trail of all updates to this patient's records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : !history || history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No change history available
            </p>
          ) : (
            <ol className="space-y-3" aria-label="Change history">
              {history.map((entry, i) => (
                <li
                  key={`${entry.timestamp}-${i}`}
                  className="p-3 bg-secondary rounded-lg border border-border"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-xs font-semibold text-foreground line-clamp-2">
                      {entry.changes}
                    </p>
                    <Badge
                      variant="secondary"
                      className="flex-shrink-0 text-xs"
                    >
                      #{history.length - i}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <UserRound className="w-3 h-3" aria-hidden="true" />
                      {entry.updatedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" aria-hidden="true" />
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Doctor Dashboard ─────────────────────────────────────────────────────────

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { identity, clear, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<{
    id: Principal;
    name: string;
  } | null>(null);

  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const {
    data: searchResults,
    isLoading: searching,
    isFetched: searchFetched,
  } = useSearchProfilesByName(activeSearch);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/doctor/login" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  useEffect(() => {
    if (!profileLoading && userProfile && userProfile.role !== "doctor") {
      toast.error("Access denied: Doctor account required");
      clear();
      queryClient.clear();
      void navigate({ to: "/auth" });
    }
  }, [userProfile, profileLoading, navigate, clear, queryClient]);

  const handleLogout = () => {
    clear();
    queryClient.clear();
    void navigate({ to: "/" });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveSearch(searchQuery.trim());
      setSelectedPatient(null);
    }
  };

  if (isInitializing || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-64" />
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-muted-foreground font-medium">
                Doctor Portal
              </p>
              {isAdmin && (
                <Badge className="bg-medical-blue text-white border-0 text-xs">
                  Verified Doctor
                </Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Dr. {userProfile?.name ?? ""}
            </h1>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2 self-start sm:self-auto"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign Out
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Search Panel */}
          <div className="space-y-4">
            <Card className="shadow-medical border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search
                    className="w-4 h-4 text-medical-blue"
                    aria-hidden="true"
                  />
                  Patient Search
                </CardTitle>
                <CardDescription className="text-xs">
                  Search by patient name to find their medical records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-3">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                      aria-hidden="true"
                    />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Enter patient name..."
                      className="pl-9 h-10"
                      aria-label="Search patients by name"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={!searchQuery.trim() || searching}
                    className="w-full h-10 bg-medical-blue hover:bg-medical-blue/90 text-white"
                  >
                    {searching ? (
                      <>
                        <Loader2
                          className="mr-2 h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                        Searching...
                      </>
                    ) : (
                      "Search Patients"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Search Results */}
            {activeSearch && (
              <Card className="shadow-medical border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Results for "{activeSearch}"
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {searching ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                        <Skeleton key={i} className="h-12" />
                      ))}
                    </div>
                  ) : !searchResults || searchResults.length === 0 ? (
                    <div className="py-4 text-center">
                      <p className="text-sm text-muted-foreground">
                        {searchFetched ? "No patients found" : "Searching..."}
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-2" aria-label="Search results">
                      {searchResults.map(([principal, profile]) => (
                        <li key={principal.toText()}>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPatient({
                                id: principal,
                                name: profile.name,
                              })
                            }
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              selectedPatient?.id.toText() ===
                              principal.toText()
                                ? "border-medical-blue bg-medical-blue-light"
                                : "border-border hover:border-medical-blue/40 hover:bg-secondary bg-white"
                            }`}
                            aria-pressed={
                              selectedPatient?.id.toText() ===
                              principal.toText()
                            }
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {profile.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Age: {profile.age?.toString()} ·{" "}
                                  {profile.bloodGroup}
                                </p>
                              </div>
                              <ChevronRight
                                className="w-4 h-4 text-muted-foreground flex-shrink-0"
                                aria-hidden="true"
                              />
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Doctor Info Card */}
            <Card className="shadow-medical border-border bg-medical-blue text-white">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      Dr. {userProfile?.name}
                    </p>
                    <p className="text-white/70 text-xs">
                      Medical Professional
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-2 bg-white/10 rounded-lg">
                  <Info
                    className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="text-xs text-white/80">
                    All actions are logged in the patient's change history for
                    audit purposes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Patient Details Panel */}
          <div className="lg:col-span-2">
            {!selectedPatient ? (
              <Card className="shadow-medical border-border h-full min-h-[400px] flex flex-col">
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center max-w-xs">
                    <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Stethoscope
                        className="w-7 h-7 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">
                      Select a Patient
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Search for a patient by name using the panel on the left,
                      then click their name to view and edit their full medical
                      records.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <PatientPanel
                patientId={selectedPatient.id}
                patientName={selectedPatient.name}
                onClose={() => setSelectedPatient(null)}
              />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
