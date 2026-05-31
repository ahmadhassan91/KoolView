import React, { useMemo, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  FileText,
  FolderOpen,
  Plus,
  Search,
} from 'lucide-react';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import KpiCard from '../components/KpiCard';
import {
  calculateJobPnl,
  calculatePayrollEntryCost,
  currency,
  documentBalance,
  documentStatus,
  estimateTotal,
  formatDate,
  sumPayments,
  toNumber,
} from '../utils/koolViewCalculations';
import { useKoolViewData } from '../state/useKoolViewData';

const stageTabs = [
  { id: 'active', label: 'Active Jobs' },
  { id: 'DP', label: 'Deposit Billed' },
  { id: 'FOC', label: 'Factory Order' },
  { id: 'RD', label: 'Room Delivery' },
  { id: 'completed', label: 'Completed' },
];

const stageLabels = {
  DP: 'Deposit Billed',
  FOC: 'Factory Order Confirmation',
  RD: 'Room Delivery',
  C: 'Completed',
};

const field = (label, value) => (
  <div className="detail-item">
    <span>{label}</span>
    <strong>{value || 'Not set'}</strong>
  </div>
);

export default function Jobs() {
  const {
    jobs,
    estimates,
    invoices,
    bills,
    payrollEntries,
    commissions,
    documents,
    addJob,
  } = useKoolViewData();

  const [activeTab, setActiveTab] = useState('active');
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [newJob, setNewJob] = useState({
    customerName: '',
    phone: '',
    projectType: 'Transition Living Space',
    contractDate: new Date().toISOString().slice(0, 10),
    address: '',
    city: '',
    contractAmount: '',
    salesperson: 'C',
  });

  const activeJobs = jobs.filter((job) => job.status !== 'Completed');
  const productionTotal = activeJobs.reduce((total, job) => total + toNumber(job.contractAmount), 0);
  const changeOrderTotal = jobs.reduce((total, job) => total + toNumber(job.changeOrders), 0);

  const visibleJobs = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return jobs.filter((job) => {
      if (activeTab === 'active' && job.status === 'Completed') return false;
      if (activeTab === 'completed' && job.status !== 'Completed') return false;
      if (!['active', 'completed'].includes(activeTab) && job.productionStage !== activeTab) return false;
      if (!normalized) return true;
      return [job.id, job.customerName, job.phone, job.projectType, job.address, job.city, job.productionStage]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized));
    });
  }, [activeTab, jobs, searchTerm]);

  const showToast = (message) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const resetNewJob = () => {
    setNewJob({
      customerName: '',
      phone: '',
      projectType: 'Transition Living Space',
      contractDate: new Date().toISOString().slice(0, 10),
      address: '',
      city: '',
      contractAmount: '',
      salesperson: 'C',
    });
  };

  const submitNewJob = () => {
    if (!newJob.customerName || !newJob.projectType || !newJob.address) {
      showToast('Customer, project, and address are required.');
      return;
    }

    const created = addJob({
      customerId: 'CUST-POC',
      customerName: newJob.customerName,
      phone: newJob.phone,
      projectType: newJob.projectType,
      contractDate: newJob.contractDate,
      address: newJob.address,
      city: newJob.city,
      contractAmount: toNumber(newJob.contractAmount),
      salesperson: newJob.salesperson,
      busyBusyProject: newJob.customerName,
      documentFolder: `Active/${newJob.projectType}/${newJob.customerName}`,
    });

    setIsNewOpen(false);
    resetNewJob();
    showToast(`${created.id} created and ready for estimate.`);
  };

  const openJob = (job, tab = 'overview') => {
    setSelectedJob(job);
    setDetailTab(tab);
  };

  const renderJobDetail = () => {
    if (!selectedJob) return null;
    const jobEstimates = estimates.filter((estimate) => estimate.jobId === selectedJob.id);
    const jobInvoices = invoices.filter((invoice) => invoice.jobId === selectedJob.id);
    const jobBills = bills.filter((bill) => bill.jobId === selectedJob.id);
    const jobPayroll = payrollEntries.filter((entry) => entry.jobId === selectedJob.id);
    const jobDocuments = documents.filter((document) => document.jobId === selectedJob.id);
    const jobCommission = commissions.find((commission) => commission.jobId === selectedJob.id);
    const pnl = calculateJobPnl({ job: selectedJob, invoices, bills, payrollEntries });

    const checklist = [
      { label: 'Accounting estimate created', complete: jobEstimates.length > 0 },
      { label: 'Production list updated', complete: true },
      { label: 'Commission tracking created', complete: Boolean(jobCommission) },
      { label: 'Document folder created', complete: jobDocuments.length > 0 },
      { label: 'BusyBusy project mapped', complete: Boolean(selectedJob.busyBusyProject) },
    ];

    return (
      <>
        <div className="tabs" style={{ paddingLeft: 0, paddingRight: 0 }}>
          {['overview', 'checklist', 'accounting', 'documents', 'costs', 'pnl'].map((tab) => (
            <button key={tab} className={`tab-button ${detailTab === tab ? 'active' : ''}`} onClick={() => setDetailTab(tab)}>
              {tab === 'pnl' ? 'P&L' : tab === 'costs' ? 'Payroll & Costs' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ paddingTop: '1rem' }}>
          {detailTab === 'overview' && (
            <div className="detail-list">
              {field('Customer', selectedJob.customerName)}
              {field('Phone', selectedJob.phone)}
              {field('Project Type', selectedJob.projectType)}
              {field('Contract Date', formatDate(selectedJob.contractDate))}
              {field('Address', selectedJob.address)}
              {field('City', selectedJob.city)}
              {field('Production Stage', stageLabels[selectedJob.productionStage] || selectedJob.productionStage)}
              {field('Salesperson', selectedJob.salesperson)}
              {field('Contract Amount', currency(selectedJob.contractAmount))}
              {field('BusyBusy Project', selectedJob.busyBusyProject)}
              {field('FileCenter Folder', selectedJob.documentFolder)}
            </div>
          )}

          {detailTab === 'checklist' && (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {checklist.map((item) => (
                <div key={item.label} className="detail-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {item.complete ? <CheckCircle2 color="var(--success)" /> : <Clock color="var(--warning)" />}
                  <div>
                    <strong>{item.label}</strong>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.complete ? 'Complete' : 'Needs attention'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {detailTab === 'accounting' && (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr><th>Estimate</th><th>Total</th><th>Status</th><th>Milestones</th></tr>
                  </thead>
                  <tbody>
                    {jobEstimates.map((estimate) => (
                      <tr key={estimate.id}>
                        <td>{estimate.id}</td>
                        <td>{currency(estimateTotal(estimate))}</td>
                        <td><StatusBadge status={estimate.status} /></td>
                        <td>{estimate.items?.length || 0} billing lines</td>
                      </tr>
                    ))}
                    {jobEstimates.length === 0 && <tr><td colSpan="4">No estimate connected yet.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr><th>Invoice</th><th>Milestone</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {jobInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>{invoice.invoiceNumber || invoice.id}</td>
                        <td>{invoice.milestone}</td>
                        <td>{currency(invoice.amount)}</td>
                        <td>{currency(sumPayments(invoice.payments))}</td>
                        <td>{currency(documentBalance(invoice.amount, invoice.payments))}</td>
                        <td><StatusBadge status={documentStatus({ amount: invoice.amount, payments: invoice.payments, dueDate: invoice.dueDate })} /></td>
                      </tr>
                    ))}
                    {jobInvoices.length === 0 && <tr><td colSpan="6">No invoice connected yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {detailTab === 'documents' && (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Category</th><th>Folder Path</th><th>Added By</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {jobDocuments.map((document) => (
                    <tr key={document.id}>
                      <td>{document.name}</td>
                      <td>{document.category}</td>
                      <td title={document.folderPath}>{document.folderPath}</td>
                      <td>{document.addedBy}</td>
                      <td>{formatDate(document.addedDate)}</td>
                    </tr>
                  ))}
                  {jobDocuments.length === 0 && <tr><td colSpan="5">No documents connected yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {detailTab === 'costs' && (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr><th>Employee</th><th>Date</th><th>Hours</th><th>Project</th><th>Labor Cost</th></tr>
                  </thead>
                  <tbody>
                    {jobPayroll.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.employeeName}</td>
                        <td>{formatDate(entry.date)}</td>
                        <td>{entry.hours}</td>
                        <td>{entry.project}</td>
                        <td>{currency(calculatePayrollEntryCost(entry))}</td>
                      </tr>
                    ))}
                    {jobPayroll.length === 0 && <tr><td colSpan="5">No BusyBusy hours connected yet.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr><th>Vendor</th><th>Category</th><th>Description</th><th>Amount</th><th>Paid</th></tr>
                  </thead>
                  <tbody>
                    {jobBills.map((bill) => (
                      <tr key={bill.id}>
                        <td>{bill.vendor}</td>
                        <td>{bill.category}</td>
                        <td>{bill.description}</td>
                        <td>{currency(bill.amount)}</td>
                        <td>{currency(sumPayments(bill.payments))}</td>
                      </tr>
                    ))}
                    {jobBills.length === 0 && <tr><td colSpan="5">No bills connected yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {detailTab === 'pnl' && (
            <div className="responsive-grid">
              <div className="span-4"><KpiCard title="Invoiced Revenue" value={currency(pnl.invoicedRevenue)} subtext="From job invoices" icon={CircleDollarSign} /></div>
              <div className="span-4"><KpiCard title="Collected Revenue" value={currency(pnl.collectedRevenue)} subtext="Posted customer payments" icon={CheckCircle2} type="success" /></div>
              <div className="span-4"><KpiCard title="Bill Costs" value={currency(pnl.billCosts)} subtext="Vendor and material bills" icon={FileText} type="warning" /></div>
              <div className="span-4"><KpiCard title="Labor Cost" value={currency(pnl.laborCost)} subtext="BusyBusy hours x rate" icon={Clock} type="warning" /></div>
              <div className="span-4"><KpiCard title="Gross Profit" value={currency(pnl.grossProfit)} subtext="Revenue minus job costs" icon={Briefcase} type={pnl.grossProfit >= 0 ? 'success' : 'danger'} /></div>
              <div className="span-4"><KpiCard title="Margin" value={`${pnl.margin}%`} subtext="Estimated job margin" icon={CircleDollarSign} type="primary" /></div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="animate-fade-in">
      {actionMessage && <div className="toast">{actionMessage}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Jobs & Contracts</h1>
          <p className="page-subtitle">One job record feeds production, accounting, documents, commission, payroll, and P&L.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsNewOpen(true)}>
          <Plus size={18} /> New Job
        </button>
      </div>

      <div className="responsive-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="span-3"><KpiCard title="Active Jobs" value={activeJobs.length} subtext="Not completed" icon={Briefcase} /></div>
        <div className="span-3"><KpiCard title="Production Value" value={currency(productionTotal)} subtext="Open contracts" icon={CircleDollarSign} type="success" /></div>
        <div className="span-3"><KpiCard title="Change Orders" value={currency(changeOrderTotal)} subtext="Approved changes" icon={FileText} type="warning" /></div>
        <div className="span-3"><KpiCard title="Document Folders" value={documents.length} subtext="Current and past files" icon={FolderOpen} type="primary" /></div>
      </div>

      <div className="card">
        <div className="section-toolbar">
          <div>
            <h3>Production List</h3>
            <p>Modeled after Dorothy's active customer production spreadsheet.</p>
          </div>
          <div className="section-actions">
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="form-input" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search jobs..." style={{ paddingLeft: '2rem', width: '220px' }} />
            </div>
          </div>
        </div>

        <div className="tabs">
          {stageTabs.map((tab) => (
            <button key={tab.id} className={`tab-button ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Track #</th>
                <th>Customer</th>
                <th>Project</th>
                <th>Contract Date</th>
                <th>Address</th>
                <th>Billed</th>
                <th>Price</th>
                <th>Change Orders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleJobs.map((job) => (
                <tr key={job.id} className="hover-lift" style={{ cursor: 'pointer' }} onClick={() => openJob(job)}>
                  <td style={{ fontWeight: 700 }}>{job.id}</td>
                  <td>
                    <strong>{job.customerName}</strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{job.phone}</div>
                  </td>
                  <td>{job.projectType}</td>
                  <td>{formatDate(job.contractDate)}</td>
                  <td>{job.address}, {job.city}</td>
                  <td><StatusBadge status={job.productionStage} /></td>
                  <td style={{ fontWeight: 700 }}>{currency(job.contractAmount)}</td>
                  <td>
                    {currency(job.changeOrders)}
                    {job.changeOrderDate && <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatDate(job.changeOrderDate)}</div>}
                  </td>
                  <td onClick={(event) => event.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.45rem 0.65rem' }} onClick={() => openJob(job, 'accounting')}>
                        <CircleDollarSign size={14} /> Accounting
                      </button>
                      <button className="btn btn-secondary" style={{ padding: '0.45rem 0.65rem' }} onClick={() => openJob(job, 'documents')}>
                        <FileText size={14} /> Docs
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleJobs.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No jobs match this view.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob ? `${selectedJob.id} - ${selectedJob.customerName}` : 'Job Details'}
        footer={<button className="btn btn-primary" onClick={() => setSelectedJob(null)}>Close</button>}
      >
        {renderJobDetail()}
      </Modal>

      <Modal
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        title="Create New Job / Contract"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsNewOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitNewJob}>Create Job</button>
          </>
        }
      >
        <div className="field-grid">
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input className="form-input" value={newJob.customerName} onChange={(event) => setNewJob({ ...newJob, customerName: event.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-input" value={newJob.phone} onChange={(event) => setNewJob({ ...newJob, phone: event.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Project Type</label>
            <select className="form-input" value={newJob.projectType} onChange={(event) => setNewJob({ ...newJob, projectType: event.target.value })}>
              <option>Transition Living Space</option>
              <option>Aere vinyl Glazed w/vertical windows</option>
              <option>Click - Click Windows</option>
              <option>Awning</option>
              <option>Deck</option>
              <option>Patio Cover</option>
              <option>Service</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Contract Date</label>
            <input className="form-input" type="date" value={newJob.contractDate} onChange={(event) => setNewJob({ ...newJob, contractDate: event.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <input className="form-input" value={newJob.address} onChange={(event) => setNewJob({ ...newJob, address: event.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">City</label>
            <input className="form-input" value={newJob.city} onChange={(event) => setNewJob({ ...newJob, city: event.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Contract Amount</label>
            <input className="form-input" value={newJob.contractAmount} onChange={(event) => setNewJob({ ...newJob, contractAmount: event.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Salesperson</label>
            <input className="form-input" value={newJob.salesperson} onChange={(event) => setNewJob({ ...newJob, salesperson: event.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  );
}
