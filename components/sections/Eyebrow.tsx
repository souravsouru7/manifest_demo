/** Small uppercase section label with the growing yellow rule beside it. */
export default function Eyebrow({ children, tone = "dark" }: { children: string; tone?: "dark" | "light" }) {
  return (
    <p className={`tm-eyebrow tm-eyebrow-${tone}`} data-fade>
      <span>{children}</span>
      <span aria-hidden className="tm-eyebrow-rule" />
    </p>
  );
}
