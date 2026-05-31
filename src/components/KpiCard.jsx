import React from 'react';

export default function KpiCard({ title, value, subtext, icon: Icon, type = 'primary' }) {
  return (
    <div className="card kpi-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
        <div>
          <p className="kpi-label">{title}</p>
          <h3 className="kpi-value">{value}</h3>
        </div>
        {Icon && (
          <div className={`kpi-icon kpi-icon-${type}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      {subtext && <p className="kpi-subtext">{subtext}</p>}
    </div>
  );
}
