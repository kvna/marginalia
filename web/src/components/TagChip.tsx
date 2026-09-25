import Link from "next/link";

export function TagChip({
  label,
  href,
  muted,
}: {
  label: string;
  href?: string;
  muted?: boolean;
}) {
  const classes = `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
    muted ? "bg-paper-sunken text-ink-muted" : "bg-tag-soft text-tag"
  }`;
  if (href) {
    return (
      <Link href={href} className={`${classes} hover:underline`}>
        {label}
      </Link>
    );
  }
  return <span className={classes}>{label}</span>;
}
