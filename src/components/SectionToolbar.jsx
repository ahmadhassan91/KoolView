export default function SectionToolbar({ title, subtitle, actions }) {
  return (
    <div className="section-toolbar">
      <div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}
