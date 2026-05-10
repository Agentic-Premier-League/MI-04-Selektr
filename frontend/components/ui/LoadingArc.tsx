export interface LoadingArcProps {
  size?: number;
}

export function LoadingArc({ size = 64 }: LoadingArcProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="animate-spin-slow"
      aria-hidden
    >
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke="rgba(20,20,19,0.08)"
        strokeWidth="1.5"
      />
      <path
        d="M 32 4 A 28 28 0 0 1 60 32"
        fill="none"
        stroke="#F37338"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
