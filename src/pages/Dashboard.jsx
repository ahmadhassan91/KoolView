import React, { useMemo } from 'react';
import { AlertCircle, Briefcase, CheckCircle2, CircleDollarSign, Clock, FileText, Plus, Receipt, Users } from 'lucide-react';
import KpiCard from '../components/KpiCard';
import { useKoolViewData } from '../state/useKoolViewData';
import { calculateJobPnl, calculatePayrollEntryCost, currency, documentBalance, formatDate } from '../utils/koolViewCalculations';

export default function Dashboard() {
  const { jobs, leads, invoices, bills, payrollEntries, documents } = useKoolViewData();

  const metrics = useMemo(() => {
    const activeJobs = jobs.filter((job) => job.status !== 'Completed').length;
    const newLeads = leads.filter((lead) => lead.status === 'New').length;
    const overdueInvoices = invoices.filter((invoice) => documentBalance(invoice.amount, invoice.payments) > 0 && new Date(`${invoice.dueDate}T12:00:00`) < new Date()).length;
    const pendingPermits = jobs.filter((job) => String(job.status).toLowerCase().includes('permit')).length;
    const arOutstanding = invoices.reduce((total, invoice) => total + documentBalance(invoice.amount, invoice.payments), 0);
    const apDue = bills.reduce((total, bill) => total + documentBalance(bill.amount, bill.payments), 0);
    const payrollCost = payrollEntries.reduce((total, entry) => total + calculatePayrollEntryCost(entry), 0);
    const openJobProfit = jobs.reduce((total, job) => total + calculateJobPnl({ job, invoices, bills, payrollEntries }).grossProfit, 0);
    return { activeJobs, newLeads, overdueInvoices, pendingPermits, arOutstanding, apDue, payrollCost, openJobProfit };
  }, [bills, invoices, jobs, leads, payrollEntries]);

  const activities = [
    jobs[0] && { id: 'job', text: `${jobs[0].id} active for ${jobs[0].customerName}`, time: formatDate(jobs[0].contractDate), icon: Briefcase, color: 'primary' },
    invoices.flatMap((invoice) => (invoice.payments || []).map((payment) => ({ invoice, payment })))[0] && {
      id: 'payment',
      text: `${currency(invoices.flatMap((invoice) => (invoice.payments || []).map((payment) => payment))[0]?.amount)} payment posted`,
      time: 'Latest payment',
      icon: CheckCircle2,
      color: 'success',
    },
    bills[0] && { id: 'bill', text: `${bills[0].vendor} bill due ${formatDate(bills[0].dueDate)}`, time: currency(bills[0].amount), icon: Receipt, color: 'warning' },
    documents[0] && { id: 'doc', text: `${documents[0].name} added to ${documents[0].jobId}`, time: formatDate(documents[0].addedDate), icon: FileText, color: 'primary' },
  ].filter(Boolean);

  const upcomingAppointments = leads.filter((lead) => lead.status === 'Appt. Set').map((lead) => ({
    id: lead.id,
    name: lead.name,
    address: `${lead.address || 'Address pending'}, ${lead.city || ''}`,
    type: lead.projectType || 'Site Visit',
    time: lead.time,
    status: 'Pending',
  }));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, Dorothy. Here is the shared job, accounting, and document picture.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> New Lead
        </button>
      </div>

      <div className="responsive-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="span-3"><KpiCard title="Active Jobs" value={metrics.activeJobs} subtext="from production list" icon={Briefcase} /></div>
        <div className="span-3"><KpiCard title="New Leads" value={metrics.newLeads} subtext="needs follow-up" icon={Users} type="success" /></div>
        <div className="span-3"><KpiCard title="Overdue Invoices" value={metrics.overdueInvoices} subtext="requires attention" icon={AlertCircle} type="danger" /></div>
        <div className="span-3"><KpiCard title="Pending Permits" value={metrics.pendingPermits} subtext="awaiting approval" icon={Clock} type="warning" /></div>
      </div>

      <div className="responsive-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="span-3"><KpiCard title="A/R Outstanding" value={currency(metrics.arOutstanding)} subtext="customer balances" icon={Receipt} type="danger" /></div>
        <div className="span-3"><KpiCard title="A/P Due" value={currency(metrics.apDue)} subtext="vendor balances" icon={FileText} type="warning" /></div>
        <div className="span-3"><KpiCard title="Payroll Cost" value={currency(metrics.payrollCost)} subtext="BusyBusy hours imported" icon={Clock} type="primary" /></div>
        <div className="span-3"><KpiCard title="Open Job Profit" value={currency(metrics.openJobProfit)} subtext="simple P&L total" icon={CircleDollarSign} type="success" /></div>
      </div>

      <div className="responsive-grid">
        <div className="span-7">
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Recent Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {activities.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem' }}>
                  <div className={`kpi-icon kpi-icon-${item.color}`} style={{ width: '34px', height: '34px' }}>
                    {React.createElement(item.icon, { size: 16 })}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600 }}>{item.text}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="span-5">
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Upcoming Appointments</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="detail-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <strong>{appointment.name}</strong>
                    <span className="badge badge-warning">{appointment.status}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{appointment.type} - {appointment.address}</p>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>{appointment.time}</p>
                </div>
              ))}
              {upcomingAppointments.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No appointments scheduled in shared lead data.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
