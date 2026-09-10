// Editorial "PUSH / DAY." display heading — a heavy, condensed-feel, italic,
// uppercase, tight-tracked hero title. Optional two-line form renders the
// second line in lime with a trailing period (the mockup's signature look),
// plus an optional small uppercase letter-spaced subtitle underneath.
//
// Built on Inter (no extra webfont) via weight/tracking/italic/transform so the
// body font and bundle stay unchanged; see the .hero-title rules in styles.css.
export function HeroTitle({
  primary,
  accent,
  subtitle,
  className,
}: {
  primary: string;
  accent?: string;
  subtitle?: string;
  className?: string;
}) {
  const twoLine = !!accent;
  return (
    <div className={`hero-title${twoLine ? '' : ' hero-single'}${className ? ` ${className}` : ''}`}>
      <span className="hero-l1">{primary}</span>
      {twoLine && <span className="hero-l2">{accent}.</span>}
      {subtitle && <span className="hero-sub">{subtitle}</span>}
    </div>
  );
}
