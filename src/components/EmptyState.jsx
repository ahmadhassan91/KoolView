export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="empty-state">
      {Icon && <Icon size={42} style={{ opacity: 0.35, margin: '0 auto 1rem' }} />}
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}
