import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Shield,
  Stethoscope,
} from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function DoctorLoginPage() {
  const navigate = useNavigate();
  const { login, clear, identity, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  useEffect(() => {
    if (!isAuthenticated || profileLoading || !isFetched) return;

    if (!userProfile) {
      toast.info("No profile found. Please register first.");
      clear();
      queryClient.clear();
      void navigate({ to: "/auth" });
      return;
    }

    if (userProfile.role === "doctor") {
      toast.success(`Welcome, Dr. ${userProfile.name}`);
      void navigate({ to: "/doctor" });
    } else {
      toast.error(
        "Access denied: This account is not registered as a doctor. Please use the patient login.",
      );
      clear();
      queryClient.clear();
    }
  }, [
    isAuthenticated,
    profileLoading,
    isFetched,
    userProfile,
    navigate,
    clear,
    queryClient,
  ]);

  const handleLogin = () => {
    if (isAuthenticated) {
      clear();
      queryClient.clear();
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar showAuth={false} />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-secondary rounded-2xl mb-4 border border-border">
              <Stethoscope
                className="w-7 h-7 text-medical-blue"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Doctor Portal
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Secure access for verified medical professionals
            </p>
          </div>

          <Card className="shadow-medical border-border">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Physician Login</CardTitle>
              <CardDescription>
                Authenticate with your Internet Identity to access patient
                records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Loading state */}
              {isAuthenticated && profileLoading && (
                <output
                  className="flex items-center gap-2 p-3 bg-secondary rounded-lg text-sm text-muted-foreground"
                  aria-live="polite"
                >
                  <Loader2
                    className="w-4 h-4 animate-spin flex-shrink-0"
                    aria-hidden="true"
                  />
                  Verifying doctor credentials...
                </output>
              )}

              {/* Access Info */}
              <div className="p-4 bg-secondary rounded-lg space-y-3">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Shield
                    className="w-4 h-4 text-medical-blue"
                    aria-hidden="true"
                  />
                  Doctor Access Privileges
                </p>
                <ul className="space-y-1.5">
                  {[
                    "Search and view full patient medical histories",
                    "Update patient medical profiles",
                    "Add clinical notes to patient records",
                    "View complete change audit trail",
                  ].map((privilege) => (
                    <li
                      key={privilege}
                      className="text-xs text-muted-foreground flex items-start gap-2"
                    >
                      <span
                        className="w-1.5 h-1.5 bg-medical-blue rounded-full flex-shrink-0 mt-1.5"
                        aria-hidden="true"
                      />
                      {privilege}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                <AlertCircle
                  className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This portal is restricted to verified medical professionals.
                  Unauthorized access attempts are logged.
                </p>
              </div>

              <Button
                onClick={handleLogin}
                disabled={
                  isLoggingIn ||
                  isInitializing ||
                  (isAuthenticated && profileLoading)
                }
                className="w-full h-11 bg-medical-blue hover:bg-medical-blue/90 text-white font-semibold"
              >
                {isLoggingIn || isInitializing ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    {isInitializing ? "Initializing..." : "Authenticating..."}
                  </>
                ) : isAuthenticated && profileLoading ? (
                  <>
                    <Loader2
                      className="mr-2 h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Verifying credentials...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                    Sign In with Internet Identity
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Not a registered doctor?{" "}
                <Link
                  to="/auth"
                  className="text-medical-blue hover:underline font-medium"
                >
                  Patient login
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
