// Emblem.tsx — the official KSCCA logo (circular badge, transparent corners, served from /public).
export function Emblem({ size = 44 }: { size?: number }) {
  return (
    <img
      src="/kscca-logo.png"
      width={size}
      height={size}
      alt="KSCCA emblem"
      className="shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
      loading="eager"
      decoding="async"
    />
  );
}
