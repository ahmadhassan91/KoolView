const statusType = (status) => {
  const value = String(status || '').toLowerCase();
  if (value.includes('paid') || value.includes('approved') || value.includes('complete') || value.includes('current')) return 'success';
  if (value.includes('overdue') || value.includes('past due') || value.includes('void') || value.includes('cancel')) return 'danger';
  if (value.includes('partial') || value.includes('converted') || value.includes('factory') || value.includes('foc') || value === 'rd') return 'primary';
  if (value.includes('pending') || value.includes('open') || value.includes('due') || value.includes('draft') || value.includes('permit') || value === 'dp') return 'warning';
  return 'secondary';
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${statusType(status)}`}>{status}</span>;
}
