// SectionComingSoon.tsx — placeholder for operator sections delivered in later phases.
export function SectionComingSoon({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="gold-rule mb-4" />
      <h1 className="font-display text-2xl text-navy-900">{title}</h1>
      <p className="mt-1 text-slate2">{subtitle}</p>
      <div className="mt-8 rounded-xl2 border border-dashed border-line bg-white p-10 text-center">
        <p className="font-display text-navy-900">ಈ ವಿಭಾಗ ಮುಂದಿನ ಹಂತದಲ್ಲಿ ಲಭ್ಯವಾಗಲಿದೆ</p>
        <p className="mt-1 text-sm text-slate2">This section is delivered in an upcoming milestone.</p>
      </div>
    </div>
  );
}
