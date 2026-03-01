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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Loader2,
  Shield,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAssignCallerUserRole,
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from "../hooks/useQueries";

type RoleType = "patient" | "doctor";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, clear, identity, isInitializing, isLoggingIn } =
    useInternetIdentity();
  const isAuthenticated = !!identity;

  const [signupName, setSignupName] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleType>("patient");
  const [isRegistering, setIsRegistering] = useState(false);

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const assignRole = useAssignCallerUserRole();

  // After login, check if user already has a profile and redirect
  useEffect(() => {
    if (!isAuthenticated || profileLoading || !isFetched) return;

    if (userProfile) {
      if (userProfile.role === "doctor") {
        void navigate({ to: "/doctor" });
      } else {
        void navigate({ to: "/dashboard" });
      }
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile, navigate]);

  const handleLogin = () => {
    if (isAuthenticated) {
      clear();
    } else {
      login();
    }
  };

  const handleSignup = async () => {
    if (!signupName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!isAuthenticated || !identity) {
      toast.error("Please authenticate first");
      return;
    }

    setIsRegistering(true);
    try {
      const role = selectedRole;
      await saveProfile.mutateAsync({ name: signupName.trim(), role });

      const principal = identity.getPrincipal();
      const userRoleEnum = role === "doctor" ? UserRole.admin : UserRole.user;
      await assignRole.mutateAsync({ user: principal, role: userRoleEnum });

      toast.success(`Welcome, ${signupName.trim()}!`);
      if (role === "doctor") {
        void navigate({ to: "/doctor" });
      } else {
        void navigate({ to: "/dashboard" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar showAuth={false} />

      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-medical-blue-light rounded-2xl mb-4">
              <Activity
                className="w-7 h-7 text-medical-blue"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-2xl font-bold text-foreground">EmergencyMed</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Secure medical information access
            </p>
          </div>

          {/* New user profile setup (after login, no profile yet) */}
          {showProfileSetup ? (
            <Card className="shadow-medical border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Complete Your Profile</CardTitle>
                <CardDescription>
                  You're authenticated. Tell us a bit about yourself to finish
                  setting up.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="font-medium">
                    Your Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Dr. Sarah Johnson"
                    autoComplete="name"
                    className="h-11"
                    onKeyDown={(e) => e.key === "Enter" && void handleSignup()}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Account Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("patient")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        selectedRole === "patient"
                          ? "border-medical-blue bg-medical-blue-light"
                          : "border-border hover:border-medical-blue/40 bg-white"
                      }`}
                      aria-pressed={selectedRole === "patient"}
                    >
                      <UserRound
                        className={`w-6 h-6 ${selectedRole === "patient" ? "text-medical-blue" : "text-muted-foreground"}`}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-sm font-medium ${selectedRole === "patient" ? "text-medical-blue" : "text-foreground"}`}
                      >
                        Patient
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("doctor")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        selectedRole === "doctor"
                          ? "border-medical-blue bg-medical-blue-light"
                          : "border-border hover:border-medical-blue/40 bg-white"
                      }`}
                      aria-pressed={selectedRole === "doctor"}
                    >
                      <Stethoscope
                        className={`w-6 h-6 ${selectedRole === "doctor" ? "text-medical-blue" : "text-muted-foreground"}`}
                        aria-hidden="true"
                      />
                      <span
                        className={`text-sm font-medium ${selectedRole === "doctor" ? "text-medical-blue" : "text-foreground"}`}
                      >
                        Doctor
                      </span>
                    </button>
                  </div>
                </div>

                <Button
                  onClick={() => void handleSignup()}
                  disabled={isRegistering || !signupName.trim()}
                  className="w-full h-11 bg-medical-blue hover:bg-medical-blue/90 text-white font-semibold"
                >
                  {isRegistering ? (
                    <>
                      <Loader2
                        className="mr-2 h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Setting up profile...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 h-11">
                <TabsTrigger value="login" className="font-medium">
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="font-medium">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <Card className="shadow-medical border-border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                      Sign in with your Internet Identity to access your medical
                      dashboard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {isAuthenticated && profileLoading && (
                      <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg text-sm text-muted-foreground">
                        <Loader2
                          className="w-4 h-4 animate-spin flex-shrink-0"
                          aria-hidden="true"
                        />
                        Loading your profile...
                      </div>
                    )}

                    <div className="p-4 bg-secondary rounded-lg space-y-2">
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Shield
                          className="w-4 h-4 text-medical-blue"
                          aria-hidden="true"
                        />
                        Secure Authentication
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        EmergencyMed uses Internet Identity — a decentralized,
                        password-free authentication system. No personal data
                        stored on our servers.
                      </p>
                    </div>

                    <Button
                      onClick={handleLogin}
                      disabled={isLoggingIn || isInitializing}
                      className="w-full h-11 bg-medical-blue hover:bg-medical-blue/90 text-white font-semibold"
                    >
                      {isLoggingIn || isInitializing ? (
                        <>
                          <Loader2
                            className="mr-2 h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                          {isInitializing
                            ? "Initializing..."
                            : "Authenticating..."}
                        </>
                      ) : isAuthenticated ? (
                        "Sign Out"
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                          Sign In with Internet Identity
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup">
                <Card className="shadow-medical border-border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Create an account</CardTitle>
                    <CardDescription>
                      Authenticate first, then complete your profile setup.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <ol className="space-y-3" aria-label="Sign up steps">
                      {[
                        {
                          num: "1",
                          text: "Authenticate with Internet Identity",
                        },
                        {
                          num: "2",
                          text: "Enter your name and select your role",
                        },
                        { num: "3", text: "Access your personal dashboard" },
                      ].map(({ num, text }) => (
                        <li
                          key={num}
                          className="flex items-center gap-3 text-sm text-muted-foreground"
                        >
                          <Badge
                            variant="secondary"
                            className="w-6 h-6 rounded-full p-0 flex items-center justify-center bg-medical-blue-light text-medical-blue font-bold flex-shrink-0"
                          >
                            {num}
                          </Badge>
                          {text}
                        </li>
                      ))}
                    </ol>

                    <Button
                      onClick={handleLogin}
                      disabled={
                        isLoggingIn || isInitializing || isAuthenticated
                      }
                      className="w-full h-11 bg-medical-blue hover:bg-medical-blue/90 text-white font-semibold"
                    >
                      {isLoggingIn || isInitializing ? (
                        <>
                          <Loader2
                            className="mr-2 h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                          {isInitializing
                            ? "Initializing..."
                            : "Authenticating..."}
                        </>
                      ) : isAuthenticated ? (
                        <>
                          <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                          Authenticated ✓
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" aria-hidden="true" />
                          Authenticate with Internet Identity
                        </>
                      )}
                    </Button>

                    {isAuthenticated && !profileLoading && !isFetched && (
                      <p className="text-xs text-center text-muted-foreground">
                        Checking your profile...
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
