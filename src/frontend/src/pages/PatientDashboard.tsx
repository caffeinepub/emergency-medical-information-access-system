import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ClipboardEdit,
  Download,
  Droplet,
  LogOut,
  Phone,
  Pill,
  QrCode,
  UserRound,
} from "lucide-react";
import { useEffect } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetCallerUserProfile,
  useGetMyMedicalProfile,
} from "../hooks/useQueries";

function generateQRUrl(text: string, size = 200): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=1a3a5c&margin=2`;
}

function QRCodeDisplay({ principalText }: { principalText: string }) {
  const qrUrl = `${window.location.origin}/emergency/${principalText}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = generateQRUrl(qrUrl, 400);
    link.download = "emergency-medical-qr.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-white rounded-xl border border-border shadow-medical">
        <img
          src={generateQRUrl(qrUrl, 200)}
          alt="QR Code for your emergency medical profile"
          width={200}
          height={200}
          className="block"
        />
      </div>
      <p className="text-xs text-muted-foreground text-center max-w-[200px] break-all font-mono">
        {`/emergency/${principalText.slice(0, 16)}...`}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        className="gap-2 border-medical-blue text-medical-blue hover:bg-medical-blue-light"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
        Download QR Code
      </Button>
    </div>
  );
}

function ProfileField({
  label,
  value,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: string | string[] | null | undefined;
  icon?: React.ElementType;
  variant?: "default" | "critical" | "warning";
}) {
  const displayValue = Array.isArray(value) ? value.join(", ") : (value ?? "");
  const isEmpty = !value || (Array.isArray(value) && value.length === 0);

  const iconColor = {
    default: "text-medical-blue",
    critical: "text-medical-red",
    warning: "text-medical-amber",
  }[variant];

  const valueColor = {
    default: "text-foreground",
    critical: isEmpty
      ? "text-muted-foreground"
      : "text-medical-red font-semibold",
    warning: isEmpty
      ? "text-muted-foreground"
      : "text-medical-amber font-medium",
  }[variant];

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-b-0">
      {Icon && (
        <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>
          <Icon className="w-4 h-4" aria-hidden="true" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className={`text-sm ${valueColor}`}>
          {isEmpty ? (
            <span className="text-muted-foreground italic">Not provided</span>
          ) : (
            displayValue
          )}
        </p>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { identity, clear, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const { data: userProfile, isLoading: profileLoading } =
    useGetCallerUserProfile();
  const { data: medicalProfile, isLoading: medicalLoading } =
    useGetMyMedicalProfile();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      void navigate({ to: "/auth" });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  const handleLogout = () => {
    clear();
    queryClient.clear();
    void navigate({ to: "/" });
  };

  const principalText = identity?.getPrincipal().toText() ?? "";

  if (isInitializing || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-40" />
              <Skeleton className="h-64" />
            </div>
            <div>
              <Skeleton className="h-72" />
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
            <p className="text-sm text-muted-foreground font-medium mb-1">
              Patient Dashboard
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Welcome, {userProfile?.name ?? "Patient"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              className="bg-medical-blue hover:bg-medical-blue/90 text-white gap-2"
            >
              <Link to="/profile/edit">
                <ClipboardEdit className="w-4 h-4" aria-hidden="true" />
                Edit Medical Info
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="gap-2"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Profile Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <Card className="shadow-medical border-border">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-medical-blue-light rounded-full flex items-center justify-center">
                      <UserRound
                        className="w-5 h-5 text-medical-blue"
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {userProfile?.name ?? "Unknown"}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Patient Profile
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-medical-green-light text-medical-green border-0 font-medium"
                  >
                    Active
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Medical Info Card */}
            <Card className="shadow-medical border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity
                      className="w-5 h-5 text-medical-blue"
                      aria-hidden="true"
                    />
                    Medical Information
                  </CardTitle>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="text-medical-blue border-medical-blue hover:bg-medical-blue-light gap-1.5"
                  >
                    <Link to="/profile/edit">
                      <ClipboardEdit
                        className="w-3.5 h-3.5"
                        aria-hidden="true"
                      />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {medicalLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : !medicalProfile ? (
                  <div className="py-8 text-center">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                      <ClipboardEdit
                        className="w-6 h-6 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-muted-foreground mb-4">
                      No medical information saved yet.
                    </p>
                    <Button
                      asChild
                      className="bg-medical-blue hover:bg-medical-blue/90 text-white"
                    >
                      <Link to="/profile/edit">Add Medical Information</Link>
                    </Button>
                  </div>
                ) : (
                  <div>
                    <ProfileField
                      label="Full Name"
                      value={medicalProfile.name}
                      icon={UserRound}
                    />
                    <ProfileField
                      label="Age"
                      value={medicalProfile.age?.toString()}
                      icon={UserRound}
                    />
                    <ProfileField
                      label="Blood Group"
                      value={medicalProfile.bloodGroup}
                      icon={Droplet}
                      variant="critical"
                    />
                    <ProfileField
                      label="Allergies"
                      value={medicalProfile.allergies}
                      icon={AlertTriangle}
                      variant="critical"
                    />
                    <ProfileField
                      label="Medical Conditions"
                      value={medicalProfile.medicalConditions}
                      icon={Activity}
                    />
                    <ProfileField
                      label="Current Medications"
                      value={medicalProfile.currentMedications}
                      icon={Pill}
                      variant="warning"
                    />
                    <ProfileField
                      label="Emergency Contact"
                      value={medicalProfile.emergencyContact}
                      icon={Phone}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: QR Code */}
          <div className="space-y-6">
            <Card className="shadow-medical border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode
                    className="w-5 h-5 text-medical-blue"
                    aria-hidden="true"
                  />
                  Your Emergency QR
                </CardTitle>
                <CardDescription className="text-xs">
                  First responders can scan this to view your critical medical
                  information instantly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!principalText ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Authenticate to generate your QR code
                  </div>
                ) : (
                  <QRCodeDisplay principalText={principalText} />
                )}
              </CardContent>
            </Card>

            {/* Emergency Preview Link */}
            {principalText && (
              <Card className="shadow-medical border-border">
                <CardContent className="pt-4">
                  <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wide">
                    Preview Emergency View
                  </p>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full border-destructive text-destructive hover:bg-destructive/10 gap-2"
                  >
                    <a
                      href={`/emergency/${principalText}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Activity className="w-4 h-4" aria-hidden="true" />
                      View Emergency Page
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    This is what responders see
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
