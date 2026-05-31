import React, { useMemo, useState } from 'react';
import { Briefcase, CircleDollarSign, Eye, Filter, Mail, MapPin, Phone, Plus, Search, TrendingUp } from 'lucide-react';
import Modal from '../components/Modal';
import KpiCard from '../components/KpiCard';
import StatusBadge from '../components/StatusBadge';
import { useKoolViewData } from '../state/useKoolViewData';
import { currency, documentBalance, formatDate, toNumber } from '../utils/koolViewCalculations';

export default function Customers() {
  const { customers, jobs, invoices } = useKoolViewData();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const showToast = (message) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const enrichedCustomers = useMemo(() => customers.map((customer) => {
    const customerJobs = jobs.filter((job) => job.customerId === customer.id);
    const activeJobs = customerJobs.filter((job) => job.status !== 'Completed');
    const pastJobs = customerJobs.filter((job) => job.status === 'Completed');
    const jobIds = customerJobs.map((job) => job.id);
    const customerInvoices = invoices.filter((invoice) => jobIds.includes(invoice.jobId));
    const openBalance = customerInvoices.reduce((total, invoice) => total + documentBalance(invoice.amount, invoice.payments), 0);
    const lifetimeSales = customerJobs.reduce((total, job) => total + toNumber(job.contractAmount), 0);
    return {
      ...customer,
      jobs: customerJobs,
      activeJobs,
      pastJobs,
      openBalance,
      lifetimeSales,
      invoices: customerInvoices,
    };
  }), [customers, invoices, jobs]);

  const filteredCustomers = enrichedCustomers.filter((customer) => {
    if (activeTab === 'active' && customer.activeJobs.length === 0) return false;
    if (activeTab === 'past' && customer.pastJobs.length === 0) return false;
    const normalized = searchTerm.trim().toLowerCase();
    if (!normalized) return true;
    return [customer.name, customer.phone, customer.email, customer.address, customer.city]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(normalized));
  });

  const totalLtv = enrichedCustomers.reduce((total, customer) => total + customer.lifetimeSales, 0);
  const activeProjects = jobs.filter((job) => job.status !== 'Completed').length;
  const openBalanceTotal = enrichedCustomers.reduce((total, customer) => total + customer.openBalance, 0);

  return (
    <div className="animate-fade-in">
      {actionMessage && <div className="toast">{actionMessage}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Customers CRM</h1>
          <p className="page-subtitle">Customer records now show active jobs, past jobs, open balances, and lifetime sales.</p>
        </div>
        <button className="btn btn-primary" onClick={() => showToast('New customer form will create a shared customer record in the production build.')}>
          <Plus size={18} /> New Customer
        </button>
      </div>

      <div className="responsive-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="span-4"><KpiCard title="Total Customer LTV" value={currency(totalLtv)} subtext="Contract value from linked jobs" icon={TrendingUp} type="success" /></div>
        <div className="span-4"><KpiCard title="Active Projects" value={activeProjects} subtext="Customers with work in progress" icon={Briefcase} type="primary" /></div>
        <div className="span-4"><KpiCard title="Open Customer Balance" value={currency(openBalanceTotal)} subtext="Unpaid invoice balances" icon={CircleDollarSign} type="danger" /></div>
      </div>

      <div className="card">
        <div className="section-toolbar">
          <div className="section-actions">
            {[
              ['all', 'All Customers'],
              ['active', 'Active Projects'],
              ['past', 'Past Clients'],
            ].map(([id, label]) => (
              <button key={id} className={`tab-button ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)} style={{ paddingBottom: '0.35rem' }}>
                {label}
              </button>
            ))}
          </div>
          <div className="section-actions">
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" placeholder="Search customers..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} style={{ paddingLeft: '2rem', width: '230px' }} />
            </div>
            <button className="btn btn-secondary" onClick={() => showToast('Use tabs and search to filter this POC customer list.')}>
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Address</th>
                <th>Active Jobs</th>
                <th>Past Jobs</th>
                <th>Open Balance</th>
                <th>Lifetime Sales</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover-lift" style={{ cursor: 'pointer' }} onClick={() => setSelectedCustomer(customer)}>
                  <td><strong>{customer.name}</strong><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{customer.id}</div></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Phone size={13} /> {customer.phone}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}><Mail size={13} /> {customer.email}</div>
                  </td>
                  <td><MapPin size={13} /> {customer.address}, {customer.city}</td>
                  <td>{customer.activeJobs.length}</td>
                  <td>{customer.pastJobs.length}</td>
                  <td style={{ fontWeight: 700, color: customer.openBalance > 0 ? 'var(--danger)' : 'var(--success)' }}>{currency(customer.openBalance)}</td>
                  <td style={{ fontWeight: 700 }}>{currency(customer.lifetimeSales)}</td>
                  <td onClick={(event) => event.stopPropagation()}>
                    <button className="btn btn-secondary" style={{ padding: '0.45rem 0.65rem' }} onClick={() => setSelectedCustomer(customer)}>
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && <tr><td colSpan="8" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customers match this view.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer ? `${selectedCustomer.name} - Customer Profile` : 'Customer Profile'}
        footer={<button className="btn btn-primary" onClick={() => setSelectedCustomer(null)}>Close</button>}
      >
        {selectedCustomer && (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div className="detail-list">
              <div className="detail-item"><span>Phone</span><strong>{selectedCustomer.phone}</strong></div>
              <div className="detail-item"><span>Email</span><strong>{selectedCustomer.email}</strong></div>
              <div className="detail-item"><span>Open Balance</span><strong>{currency(selectedCustomer.openBalance)}</strong></div>
              <div className="detail-item"><span>Lifetime Sales</span><strong>{currency(selectedCustomer.lifetimeSales)}</strong></div>
            </div>

            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Job</th><th>Project</th><th>Contract Date</th><th>Stage</th><th>Contract Amount</th></tr></thead>
                <tbody>
                  {selectedCustomer.jobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.id}</td>
                      <td>{job.projectType}</td>
                      <td>{formatDate(job.contractDate)}</td>
                      <td><StatusBadge status={job.productionStage} /></td>
                      <td>{currency(job.contractAmount)}</td>
                    </tr>
                  ))}
                  {selectedCustomer.jobs.length === 0 && <tr><td colSpan="5">No linked jobs yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
