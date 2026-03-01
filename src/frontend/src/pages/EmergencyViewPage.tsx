import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Principal } from "@dfinity/principal";
import { useParams } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Droplet,
  Phone,
  Printer,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useMemo } from "react";
import { useGetPublicMedicalProfile } from "../hooks/useQueries";

function EmergencyField({
  label,
  value,
  variant = "default",
  icon: Icon,
}: {
  label: string;
  value: string | string[] | null | undefined;
  variant?: "default" | "critical" | "warning";
  icon?: React.ElementType;
}) {
  const displayValue = Array.isArray(value) ? value.join(", ") : value;
  const isEmpty = !value || (Array.isArray(value) && value.length === 0);

  const sectionStyles = {
    default: "bg-white border-border",
    critical: "bg-medical-red-light border-medical-red/30",
    warning: "bg-medical-amber-light border-medical-amber/30",
  };

  const labelStyles = {
    default: "text-muted-foreground",
    critical: "text-medical-red",
    warning: "text-medical-amber",
  };

  const valueStyles = {
    default: "text-foreground",
    critical: "text-medical-red font-bold",
    warning: "text-medical-amber font-semibold",
  };

  return (
    <section
      className={`rounded-lg border p-5 ${sectionStyles[variant]}`}
      aria-labelledby={`field-${label.replace(/\s+/g, "-")}`}
    >
      <p
        id={`field-${label.replace(/\s+/g, "-")}`}
        className={`text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${labelStyles[variant]}`}
      >
        {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
        {label}
      </p>
      {isEmpty ? (
        <p className="text-emergency-lg text-muted-foreground italic">
          Not recorded
        </p>
      ) : (
        <p className={`text-emergency-lg ${valueStyles[variant]}`}>
          {displayValue}
        </p>
      )}
    </section>
  );
}

export default function EmergencyViewPage() {
  const { patientId } = useParams({ strict: false }) as { patientId?: string };

  const principal = useMemo(() => {
    if (!patientId) return null;
    try {
      return Principal.fromText(patientId);
    } catch {
      return null;
    }
  }, [patientId]);

  const {
    data: profile,
    isLoading,
    isError,
  } = useGetPublicMedicalProfile(principal);

  if (!principal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert
              className="w-8 h-8 text-destructive"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Invalid QR Code
          </h1>
          <p className="text-muted-foreground">
            This QR code contains an invalid patient identifier. Please scan a
            valid EmergencyMed QR code.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-white p-6 max-w-2xl mx-auto"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="bg-medical-red rounded-xl p-6 mb-6">
          <Skeleton className="h-8 w-64 bg-white/20 mb-2" />
          <Skeleton className="h-4 w-40 bg-white/20" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert
              className="w-8 h-8 text-destructive"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isError ? "Unable to Load" : "Profile Not Found"}
          </h1>
          <p className="text-muted-foreground">
            {isError
              ? "There was an error loading this patient's medical information. Please try again or contact emergency services directly."
              : "No medical profile found for this QR code. The patient may not have set up their profile yet."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen bg-background print-full"
      aria-label="Emergency medical information"
    >
      <div className="max-w-2xl mx-auto p-4 sm:p-6 py-6 sm:py-10">
        {/* Emergency Header */}
        <div
          className="bg-medical-red rounded-xl p-6 mb-6 text-white"
          role="banner"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5" aria-hidden="true" />
                <Badge className="bg-white/20 text-white border-0 text-xs font-bold uppercase tracking-widest">
                  Emergency Medical Info
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {profile.name}
              </h1>
              <p className="text-white/80 text-sm mt-1">
                Age:{" "}
                <span className="font-semibold text-white">
                  {profile.age?.toString()} years
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="no-print flex-shrink-0 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              aria-label="Print this page"
              title="Print emergency card"
            >
              <Printer className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Critical Info — Blood Group & Allergies */}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <EmergencyField
            label="Blood Group"
            value={profile.bloodGroup}
            variant="critical"
            icon={Droplet}
          />
          <EmergencyField
            label="Allergies"
            value={profile.allergies}
            variant="critical"
            icon={AlertTriangle}
          />
        </div>

        {/* Contact */}
        <div className="mb-4">
          <EmergencyField
            label="Emergency Contact"
            value={profile.emergencyContact}
            icon={Phone}
          />
        </div>

        {/* Identity Fields */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <EmergencyField
            label="Patient Name"
            value={profile.name}
            icon={UserRound}
          />
        </div>

        {/* Footer note */}
        <div className="mt-8 p-4 bg-secondary rounded-lg text-center">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <Activity
              className="w-3.5 h-3.5 text-medical-blue"
              aria-hidden="true"
            />
            Powered by EmergencyMed — decentralized medical data access
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            For full medical history, a verified doctor login is required.
          </p>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4 no-print">
          This information is read-only and provided for emergency medical
          purposes only.
        </p>
      </div>
    </main>
  );
}
