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
    <div className="sticky top-6 z-30 mx-auto mt-6 flex w-full max-w-[1280px] items-center justify-between rounded-pill bg-white px-6 py-3 shadow-nav md:px-10">
      <Link href={variant === "recruiter" ? "/recruiter" : "/jobs"} className="flex items-center gap-2">
        <Logomark />
        <span className="text-[20px] font-bold tracking-[-0.02em] text-ink">HireIQ</span>
      </Link>

      <nav className="hidden items-center gap-12 md:flex">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/recruiter" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[16px] font-medium tracking-[-0.02em] text-ink transition-colors",
                active ? "text-ink" : "hover:opacity-70",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2">{rightSlot}</div>
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
