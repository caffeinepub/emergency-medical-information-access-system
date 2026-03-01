import { Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer className="bg-white border-t border-border py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center gap-1 flex-wrap">
          <span>© {year}. Built with</span>
          <Heart
            className="w-3.5 h-3.5 text-medical-red inline"
            aria-hidden="true"
          />
          <span>using</span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-medical-blue hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
