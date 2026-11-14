// Drawn marks. State is a shape plus a word, never colour alone.

/** The brand: three label tabs, one per page the workflow reads. */
export function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="2" y="4" width="28" height="6" fill="#6fa3e0" />
      <rect x="2" y="13" width="28" height="6" fill="#d9a23a" />
      <rect x="2" y="22" width="28" height="6" fill="#a56bb5" />
    </svg>
  );
}

/** Waiting: a dashed ring. */
export function WaitMark() {
  return (
    <svg className="mk" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="2.5" y="2.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" />
    </svg>
  );
}

/** Failed: a struck square. */
export function FailMark() {
  return (
    <svg className="mk" viewBox="0 0 14 14" aria-hidden="true">
      <rect x="2" y="2" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M2 12L12 2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
