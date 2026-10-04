type SpinnerProps = {
  className?: string;
  /** Label untuk pembaca layar; kosong bila murni dekoratif. */
  label?: string;
};

/** Indikator pemuatan kecil berbasis CSS. */
export function Spinner({ className = "h-4 w-4", label }: SpinnerProps) {
  return (
    <span
      aria-hidden={label ? undefined : true}
      role={label ? "status" : undefined}
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    >
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
