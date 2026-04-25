interface PageHeaderProps {
  overline: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ overline, title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="px-8 py-5 bg-canvas border-b border-bdr flex items-center justify-between sticky top-0 z-40">
      <div>
        <div className="text-[0.6rem] uppercase tracking-[0.15em] text-ink-subtle font-semibold mb-1">
          {overline}
        </div>
        <h1
          className="text-[1.7rem] font-semibold tracking-tight text-ink leading-none"
          style={{ fontFamily: "var(--font-work-sans), system-ui, sans-serif" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-ink-muted text-[0.82rem] mt-1.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
