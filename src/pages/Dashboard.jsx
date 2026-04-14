import React from 'react';
import { Plus, CheckCircle2, Clock, IndianRupee, Users, TrendingUp, AlertCircle, FileText, ArrowRight } from 'lucide-react';

const DashboardCard = ({ title, value, subtext, icon: Icon, trend, type = 'default' }) => {
  const getTrendColor = () => {
    if (trend > 0) return 'text-success';
    if (trend < 0) return 'text-danger';
    return 'text-muted';
  };

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{value}</h3>
        </div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: 'var(--radius-md)', 
          backgroundColor: `var(--${type === 'default' ? 'primary' : type}-light)`,
          color: `var(--${type === 'default' ? 'primary' : type})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
        {trend && (
          <span style={{ 
            color: trend > 0 ? 'var(--success)' : 'var(--danger)', 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <TrendingUp size={14} style={{ transform: trend < 0 ? 'rotate(180deg)' : 'none' }} />
            {Math.abs(trend)}%
          </span>
        )}
        <span style={{ color: 'var(--text-light)' }}>{subtext}</span>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const activities = [
    { id: 1, type: 'lead', text: 'New lead assigned from HomeAdvisor: Michael Scott', time: '10 mins ago', icon: Users, color: 'primary' },
    { id: 2, type: 'job', text: 'Permit approved for Job #4492 (123 Elm St)', time: '1 hour ago', icon: CheckCircle2, color: 'success' },
    { id: 3, type: 'invoice', text: 'Invoice #INV-204 paid by Jim Halpert', time: '3 hours ago', icon: IndianRupee, color: 'success' },
    { id: 4, type: 'doc', text: 'Contract uploaded for Job #4495', time: 'Yesterday', icon: FileText, color: 'primary' },
  ];

  const upcomingAppointments = [
    { id: 1, name: 'Dwight Schrute', address: '101 Farm Rd', type: 'Site Visit', time: 'Today, 2:00 PM', status: 'Confirmed' },
    { id: 2, name: 'Pam Beesly', address: '492 Artist Way', type: 'Consultation', time: 'Tomorrow, 10:00 AM', status: 'Pending' },
    { id: 3, name: 'Stanley Hudson', address: '88 Pretzel St', type: 'Installation Prep', time: 'Thu, 9:00 AM', status: 'Confirmed' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, Dorothy. Here's what's happening today.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> New Lead
        </button>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div style={{ gridColumn: 'span 3' }}>
          <DashboardCard title="Active Jobs" value="32" subtext="from last month" trend={+4} icon={Briefcase} type="primary" />
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <DashboardCard title="New Leads" value="14" subtext="this week" trend={+12} icon={Users} type="success" />
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <DashboardCard title="Overdue Invoices" value="3" subtext="Requires attention" icon={AlertCircle} type="danger" />
        </div>
        <div style={{ gridColumn: 'span 3' }}>
          <DashboardCard title="Pending Permits" value="8" subtext="Awaiting approval" icon={Clock} type="warning" />
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="card" style={{ gridColumn: 'span 7', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Recent Activity</h3>
            <button style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500 }}>View All</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {activities.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                {index !== activities.length - 1 && (
                  <div style={{ position: 'absolute', left: '15px', top: '35px', bottom: '-15px', width: '2px', backgroundColor: 'var(--border)' }}></div>
                )}
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: `var(--${item.color}-light)`, 
                  color: `var(--${item.color})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 1
                }}>
                  <item.icon size={16} />
                </div>
                <div>
                  <p style={{ fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{item.text}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card" style={{ gridColumn: 'span 5', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Upcoming Appointments</h3>
            <button style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 500 }}>Open Calendar</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} style={{ 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-md)', 
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'var(--transition)',
                cursor: 'pointer'
              }} className="hover-lift">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontWeight: 600, margin: 0 }}>{apt.name}</h4>
                    <span className={`badge badge-${apt.status === 'Confirmed' ? 'success' : 'warning'}`}>{apt.status}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{apt.type} • {apt.address}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    <Clock size={12} /> {apt.time}
                  </div>
                </div>
                <div style={{ color: 'var(--text-light)' }}>
                  <ArrowRight size={16} />
                </div>
              </div>
            ))}
          </div>
          
          <button style={{ 
            width: '100%', 
            padding: '0.75rem', 
            marginTop: '1rem', 
            borderRadius: 'var(--radius-md)', 
            backgroundColor: 'var(--bg-subtle)',
            color: 'var(--text-main)',
            fontWeight: 500,
            fontSize: '0.875rem',
            border: '1px dashed var(--border)'
          }}>
            Schedule New Appointment
          </button>
        </div>
      </div>
    </div>
  );
}
