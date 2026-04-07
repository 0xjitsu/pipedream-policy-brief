const VARIANTS = {
  solution: { color: "#10B981", label: "Problem → Solution" },
  execution: { color: "#3B82F6", label: "Solution → Execution" },
} as const;

interface SectionDividerProps {
  variant: "solution" | "execution";
  prose?: string;
}

export function SectionDivider({ variant, prose }: SectionDividerProps) {
  const { color, label } = VARIANTS[variant];

  return (
    <div className="py-10 md:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-white-50 mb-3">
          {label}
        </p>
        <div
          className="h-px mx-auto max-w-md"
          style={{
            background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          }}
        />
        {prose && (
          <p className="mt-4 text-sm text-white-50 italic font-serif max-w-[32ch] mx-auto leading-relaxed">
            {prose}
          </p>
        )}
      </div>
    </div>
  );
}
