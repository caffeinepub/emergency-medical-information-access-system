import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Activity, Menu, Shield, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavbarProps {
  showAuth?: boolean;
}

export default function Navbar({ showAuth = true }: NavbarProps) {
  const { identity, clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    clear();
    queryClient.clear();
    void navigate({ to: "/" });
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-medical-blue font-semibold text-lg hover:opacity-80 transition-opacity"
            aria-label="Emergency Medical System Home"
          >
            <div className="w-8 h-8 bg-medical-blue rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-white" aria-hidden="true" />
            </div>
            <span className="hidden sm:block">
              <span className="font-bold">EmergencyMed</span>
              <span className="text-muted-foreground font-normal text-sm ml-1.5 hidden md:inline">
                Access System
              </span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
          >
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  My Dashboard
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-sm"
                >
                  Sign Out
                </Button>
              </>
            ) : showAuth ? (
              <>
                <Link
                  to="/doctor/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Doctor Login
                </Link>
                <Button
                  asChild
                  size="sm"
                  className="bg-medical-blue hover:bg-medical-blue/90 text-white"
                >
                  <Link to="/auth">
                    <Shield className="w-3.5 h-3.5 mr-1.5" aria-hidden="true" />
                    Sign In
                  </Link>
                </Button>
              </>
            ) : null}
          </nav>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <nav
            className="md:hidden py-4 border-t border-border space-y-2"
            aria-label="Mobile navigation"
          >
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block px-2 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
            >
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  My Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-2 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : showAuth ? (
              <>
                <Link
                  to="/doctor/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  Doctor Login
                </Link>
                <Link
                  to="/auth"
                  onClick={() => setMobileOpen(false)}
                  className="block px-2 py-2 text-sm font-medium text-medical-blue hover:bg-medical-blue-light rounded-md transition-colors"
                >
                  Sign In
                </Link>
              </>
            ) : null}
          </nav>
        )}
      </div>
    </header>
  );
}
