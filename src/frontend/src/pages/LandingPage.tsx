import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  ChevronRight,
  ClipboardList,
  Clock,
  QrCode,
  ShieldCheck,
  Smartphone,
  UserPlus,
} from "lucide-react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: UserPlus,
    title: "Register Your Account",
    description:
      "Sign up securely using Internet Identity. Your data is protected with decentralized authentication — no passwords required.",
    color: "text-medical-blue",
    bg: "bg-medical-blue-light",
  },
  {
    step: "02",
    icon: ClipboardList,
    title: "Fill Medical Information",
    description:
      "Enter your blood group, allergies, current medications, medical conditions, and emergency contact details.",
    color: "text-medical-green",
    bg: "bg-medical-green-light",
  },
  {
    step: "03",
    icon: QrCode,
    title: "Generate Your QR Code",
    description:
      "Get a unique QR code linking to your critical medical info. Download it, print it, or keep it on your phone.",
    color: "text-medical-amber",
    bg: "bg-medical-amber-light",
  },
];

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    description:
      "Data stored on the Internet Computer blockchain. You control who sees what.",
  },
  {
    icon: Smartphone,
    title: "Instant Access",
    description:
      "Any smartphone camera can scan the QR code — no app download needed.",
  },
  {
    icon: Clock,
    title: "Always Available",
    description:
      "Emergency responders can access critical info in seconds, day or night.",
  },
  {
    icon: Activity,
    title: "Doctor Portal",
    description:
      "Verified doctors can view full histories and add notes to patient records.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section
          className="relative overflow-hidden bg-gradient-to-br from-white via-secondary/50 to-accent/30"
          aria-labelledby="hero-heading"
        >
          {/* Background image */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url(/assets/generated/medical-hero-bg.dim_1200x600.jpg)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-hidden="true"
          />

          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "radial-gradient(circle, oklch(0.45 0.16 240) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
            aria-hidden="true"
          />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 md:py-36">
            <div className="max-w-3xl">
              <Badge
                variant="secondary"
                className="mb-6 bg-medical-blue-light text-medical-blue border-0 text-xs font-semibold tracking-wide uppercase px-3 py-1"
              >
                Emergency Medical Access
              </Badge>

              <h1
                id="hero-heading"
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6"
              >
                Instant access to{" "}
                <span className="text-medical-blue">life-saving</span>
                <br className="hidden sm:block" /> medical information
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl">
                Register your critical health data once. Generate a QR code. In
                an emergency, first responders scan it to get everything they
                need — immediately.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-medical-blue hover:bg-medical-blue/90 text-white h-12 px-8 text-base font-semibold shadow-medical-lg"
                >
                  <Link to="/auth">
                    <UserPlus className="w-5 h-5 mr-2" aria-hidden="true" />
                    Register as Patient
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base font-semibold border-2 border-medical-blue text-medical-blue hover:bg-medical-blue-light"
                >
                  <Link to="/auth">
                    <QrCode className="w-5 h-5 mr-2" aria-hidden="true" />
                    Scan QR Code
                  </Link>
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground flex items-center gap-2">
                <ShieldCheck
                  className="w-4 h-4 text-medical-green flex-shrink-0"
                  aria-hidden="true"
                />
                Decentralized & secure — your data is never owned by a third
                party
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          className="py-20 sm:py-28 bg-white"
          aria-labelledby="how-it-works-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <Badge
                variant="secondary"
                className="mb-4 bg-secondary text-secondary-foreground border-0 text-xs font-semibold tracking-wide uppercase px-3 py-1"
              >
                Simple Process
              </Badge>
              <h2
                id="how-it-works-heading"
                className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
              >
                How it works
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Three steps to ensure your medical information is always
                accessible when it matters most.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line */}
              <div
                className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-gradient-to-r from-medical-blue-light via-medical-blue/30 to-medical-blue-light"
                aria-hidden="true"
              />

              {HOW_IT_WORKS.map(
                ({ step, icon: Icon, title, description, color, bg }) => (
                  <div
                    key={step}
                    className="relative flex flex-col items-center text-center group"
                  >
                    <div
                      className={`relative w-20 h-20 ${bg} rounded-2xl flex items-center justify-center mb-5 shadow-medical group-hover:shadow-medical-lg transition-shadow`}
                    >
                      <Icon className={`w-8 h-8 ${color}`} aria-hidden="true" />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center text-xs font-bold text-muted-foreground shadow-xs">
                        {step.replace("0", "")}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                ),
              )}
            </div>

            <div className="text-center mt-12">
              <Button
                asChild
                size="lg"
                className="bg-medical-blue hover:bg-medical-blue/90 text-white h-12 px-8 text-base font-semibold"
              >
                <Link to="/auth">
                  Get Started
                  <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section
          className="py-20 sm:py-28 bg-background"
          aria-labelledby="features-heading"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-14">
              <h2
                id="features-heading"
                className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
              >
                Built for emergencies
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Every feature designed with one goal: getting the right
                information to the right person instantly.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white rounded-xl p-6 shadow-medical hover:shadow-medical-lg transition-shadow border border-border"
                >
                  <div className="w-10 h-10 bg-medical-blue-light rounded-lg flex items-center justify-center mb-4">
                    <Icon
                      className="w-5 h-5 text-medical-blue"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section
          className="py-16 bg-medical-blue"
          aria-labelledby="cta-heading"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2
              id="cta-heading"
              className="text-3xl sm:text-4xl font-bold text-white mb-5"
            >
              Your health data, always within reach
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of patients who trust EmergencyMed to keep their
              critical information safe and accessible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-medical-blue hover:bg-white/90 h-12 px-8 text-base font-semibold"
              >
                <Link to="/auth">Register as Patient</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base font-semibold border-2 border-white text-white hover:bg-white/10 bg-transparent"
              >
                <Link to="/doctor/login">Doctor Login</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
