"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export interface FloatingNavPillProps {
  variant: "applicant" | "recruiter";
  rightSlot?: React.ReactNode;
}

const RECRUITER_LINKS = [
  { href: "/recruiter", label: "Dashboard" },
  { href: "/recruiter#jobs", label: "Jobs" },
  { href: "/recruiter#analytics", label: "Analytics" },
];

const APPLICANT_LINKS = [{ href: "/jobs", label: "Browse Jobs" }];

export function FloatingNavPill({ variant, rightSlot }: FloatingNavPillProps) {
  const pathname = usePathname();
  const links = variant === "recruiter" ? RECRUITER_LINKS : APPLICANT_LINKS;

  return (
    <div className="sticky top-4 md:top-6 z-50 mx-auto flex w-[calc(100%-2rem)] max-w-5xl items-center justify-between rounded-full bg-white/95 backdrop-blur-sm px-6 py-3 shadow-card border border-ink/5 md:px-8">
      <Link href={variant === "recruiter" ? "/recruiter" : "/jobs"} className="flex items-center gap-2">
        <Logomark />
        <span className="text-lg font-bold tracking-tight text-ink">Selektr</span>
      </Link>

      <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/recruiter" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium tracking-tight transition-colors",
                active ? "text-ink" : "text-slate hover:text-ink",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">{rightSlot}</div>
    </div>
  );
}

function Logomark() {
  return (
    <span className="relative inline-block h-6 w-10" aria-hidden>
      <span className="absolute left-0 top-0 h-6 w-6 rounded-full bg-ink" />
      <span className="absolute left-4 top-0 h-6 w-6 rounded-full bg-arc mix-blend-multiply" />
    </span>
  );
}
