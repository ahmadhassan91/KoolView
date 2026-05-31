import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Download,
  FileText,
  Plus,
  Receipt,
  Upload,
  Users,
} from 'lucide-react';
import Modal from '../components/Modal';
import KpiCard from '../components/KpiCard';
import StatusBadge from '../components/StatusBadge';
import SectionToolbar from '../components/SectionToolbar';
import { useKoolViewData } from '../state/useKoolViewData';
import {
  calculateCommission,
  calculateJobPnl,
  calculatePayrollEntryCost,
  calculateSalesUseTax,
  currency,
  documentBalance,
  documentStatus,
  estimateTotal,
  formatDate,
  roundMoney,
  sumPayments,
  toNumber,
} from '../utils/koolViewCalculations';

const todayInput = () => new Date().toISOString().slice(0, 10);

const nextId = (prefix, records) => {
  const max = records.reduce((highest, record) => {
    const numeric = Number(String(record.id || '').replace(/\D/g, ''));
    return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
  }, 0);
  return `${prefix}-${max + 1}`;
};

const tabs = [
  { id: 'estimates', label: 'Estimates', icon: FileText },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'bills', label: 'Bills', icon: BookOpen },
  { id: 'payroll', label: 'Payroll', icon: Clock },
  { id: 'commissions', label: 'Commissions', icon: Users },
  { id: 'tax', label: 'Sales & Use Tax', icon: FileText },
  { id: 'pnl', label: 'Job P&L', icon: CircleDollarSign },
  { id: 'reports', label: 'Reports', icon: Download },
];

const paymentMethods = ['Check', 'Credit Card', 'ACH', 'Cash', 'Other'];

const groupBy = (records, keyGetter) =>
  records.reduce((groups, record) => {
    const key = keyGetter(record);
    groups[key] = groups[key] || [];
    groups[key].push(record);
    return groups;
  }, {});

export default function Billing() {
  const {
    jobs,
    estimates,
    invoices,
    bills,
    payrollEntries,
    commissions,
    salesTaxReport,
    setEstimates,
    setBills,
    approveEstimate,
    convertEstimateToInvoice,
    recordInvoicePayment,
    recordBillPayment,
    addPayrollEntries,
  } = useKoolViewData();

  const [activeTab, setActiveTab] = useState('estimates');
  const [actionMessage, setActionMessage] = useState('');
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [paymentTarget, setPaymentTarget] = useState(null);
  const [isEstimateOpen, setIsEstimateOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [paymentForm, setPaymentForm] = useState({
    date: todayInput(),
    amount: '',
    method: 'ACH',
    reference: '',
    notes: '',
  });
  const [estimateForm, setEstimateForm] = useState({
    jobId: jobs[0]?.id || '',
    amount: '',
    status: 'Draft',
  });
  const [billForm, setBillForm] = useState({
    jobId: jobs[0]?.id || '',
    vendor: '',
    category: 'Materials',
    description: '',
    amount: '',
    billDate: todayInput(),
    dueDate: todayInput(),
  });

  const tax = calculateSalesUseTax(salesTaxReport);

  const derived = useMemo(() => {
    const arOutstanding = invoices.reduce((total, invoice) => total + documentBalance(invoice.amount, invoice.payments), 0);
    const apDue = bills.reduce((total, bill) => total + documentBalance(bill.amount, bill.payments), 0);
    const collectedThisMonth = invoices.reduce((total, invoice) => total + sumPayments(invoice.payments), 0);
    const payrollCost = payrollEntries.reduce((total, entry) => total + calculatePayrollEntryCost(entry), 0);
    const openJobProfit = jobs.reduce((total, job) => total + calculateJobPnl({ job, invoices, bills, payrollEntries }).grossProfit, 0);
    return {
      arOutstanding: roundMoney(arOutstanding),
      apDue: roundMoney(apDue),
      collectedThisMonth: roundMoney(collectedThisMonth),
      payrollCost: roundMoney(payrollCost),
      openJobProfit: roundMoney(openJobProfit),
    };
  }, [bills, invoices, jobs, payrollEntries]);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) || jobs[0];
  const selectedPnl = calculateJobPnl({ job: selectedJob, invoices, bills, payrollEntries });

  const showToast = (message) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const jobName = (jobId) => jobs.find((job) => job.id === jobId)?.customerName || 'Unassigned';

  const openPayment = (type, record) => {
    const balance = documentBalance(record.amount, record.payments);
    setPaymentTarget({ type, record });
    setPaymentForm({
      date: todayInput(),
      amount: String(balance),
      method: 'ACH',
      reference: '',
      notes: '',
    });
  };

  const submitPayment = () => {
    if (!paymentTarget) return;
    const payment = {
      date: paymentForm.date,
      amount: toNumber(paymentForm.amount),
      method: paymentForm.method,
      reference: paymentForm.reference,
      notes: paymentForm.notes,
    };
    if (payment.amount <= 0) {
      showToast('Enter a payment amount greater than zero.');
      return;
    }
    if (paymentTarget.type === 'invoice') {
      recordInvoicePayment(paymentTarget.record.id, payment);
      showToast(`Payment recorded for ${paymentTarget.record.invoiceNumber || paymentTarget.record.id}.`);
    } else {
      recordBillPayment(paymentTarget.record.id, payment);
      showToast(`Bill payment recorded for ${paymentTarget.record.id}.`);
    }
    setPaymentTarget(null);
  };

  const createEstimate = () => {
    const job = jobs.find((item) => item.id === estimateForm.jobId);
    const amount = toNumber(estimateForm.amount);
    if (!job || amount <= 0) {
      showToast('Choose a job and enter an amount.');
      return;
    }
    const estimate = {
      id: nextId('EST', estimates),
      jobId: job.id,
      customerId: job.customerId,
      estimateNumber: String(estimates.length + 1001),
      date: todayInput(),
      status: estimateForm.status,
      projectAccountRep: job.salesperson,
      taxRate: 0.055,
      items: [
        { id: `ESTITEM-${Date.now()}-1`, itemCode: '1000 - DP SR', description: `Down Payment on ${job.projectType} Contract for ${currency(amount)}`, quantity: 1, rate: roundMoney(amount * 0.2), taxable: false },
        { id: `ESTITEM-${Date.now()}-2`, itemCode: '1005 - FOC SR', description: `Factory Order Confirmation on ${job.projectType} Contract for ${currency(amount)}`, quantity: 1, rate: roundMoney(amount * 0.2), taxable: false },
        { id: `ESTITEM-${Date.now()}-3`, itemCode: '1020 - MC SR', description: `Major Completion on ${job.projectType} Contract for ${currency(amount)}`, quantity: 1, rate: roundMoney(amount * 0.6), taxable: false },
      ],
    };
    setEstimates((current) => [estimate, ...current]);
    setIsEstimateOpen(false);
    setEstimateForm({ jobId: jobs[0]?.id || '', amount: '', status: 'Draft' });
    showToast(`${estimate.id} created for ${job.customerName}.`);
  };

  const createBill = () => {
    const amount = toNumber(billForm.amount);
    if (!billForm.vendor || amount <= 0) {
      showToast('Vendor and amount are required.');
      return;
    }
    const bill = {
      id: nextId('BILL', bills),
      ...billForm,
      amount,
      payments: [],
    };
    setBills((current) => [bill, ...current]);
    setIsBillOpen(false);
    setBillForm({
      jobId: jobs[0]?.id || '',
      vendor: '',
      category: 'Materials',
      description: '',
      amount: '',
      billDate: todayInput(),
      dueDate: todayInput(),
    });
    showToast(`${bill.id} added for ${bill.vendor}.`);
  };

  const importBusyBusySample = () => {
    const targetJob = selectedJob || jobs[0];
    if (!targetJob) return;
    const imported = [
      { date: todayInput(), employeeFirstName: 'Jacob', employeeLastName: 'Tyborski', employeeName: 'Jacob Tyborski', hours: 4.25, project: targetJob.customerName, jobId: targetJob.id, hourlyRate: 30, laborCategory: 'Field Labor' },
      { date: todayInput(), employeeFirstName: 'Troy', employeeLastName: 'Forster', employeeName: 'Troy Forster', hours: 7.75, project: targetJob.customerName, jobId: targetJob.id, hourlyRate: 34, laborCategory: 'Field Labor' },
      { date: todayInput(), employeeFirstName: 'Dorothy', employeeLastName: 'Heller', employeeName: 'Dorothy Heller', hours: 2.5, project: '4 - Office', jobId: null, hourlyRate: 38, laborCategory: 'Office' },
      { date: todayInput(), employeeFirstName: 'Stephen', employeeLastName: 'Lehman', employeeName: 'Stephen Lehman', hours: 3.0, project: '2 - SERVICE', jobId: null, hourlyRate: 35, laborCategory: 'Service' },
    ].map((entry, index) => ({ ...entry, id: `TIME-IMPORT-${Date.now()}-${index}` }));
    addPayrollEntries(imported);
    showToast('BusyBusy sample hours imported into payroll/job costing.');
  };

  const renderEstimates = () => (
    <>
      <SectionToolbar
        title="Estimates"
        subtitle="Contracts are entered as estimates and invoiced from there."
        actions={<button className="btn btn-primary" onClick={() => setIsEstimateOpen(true)}><Plus size={16} /> New Estimate</button>}
      />
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr><th>Estimate #</th><th>Customer / Job</th><th>Project</th><th>Contract Amount</th><th>Milestones</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {estimates.map((estimate) => {
              const job = jobs.find((item) => item.id === estimate.jobId);
              return (
                <tr key={estimate.id}>
                  <td style={{ fontWeight: 700 }}>{estimate.estimateNumber || estimate.id}</td>
                  <td>
                    <strong>{job?.customerName || 'Unknown customer'}</strong>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{estimate.jobId}</div>
                  </td>
                  <td>{job?.projectType || 'Project'}</td>
                  <td style={{ fontWeight: 700 }}>{currency(estimateTotal(estimate))}</td>
                  <td>{estimate.items?.length || 0} billing lines</td>
                  <td><StatusBadge status={estimate.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.45rem 0.65rem' }} onClick={() => setSelectedEstimate(estimate)}>View Items</button>
                      {!['Approved', 'Converted'].includes(estimate.status) && (
                        <button className="btn btn-secondary" style={{ padding: '0.45rem 0.65rem' }} onClick={() => approveEstimate(estimate.id)}><CheckCircle2 size={14} /> Approve</button>
                      )}
                      {estimate.status === 'Approved' && (
                        <button className="btn btn-primary" style={{ padding: '0.45rem 0.65rem' }} onClick={() => { convertEstimateToInvoice(estimate.id); setActiveTab('invoices'); showToast(`${estimate.id} converted to invoice.`); }}>
                          <ArrowRight size={14} /> Invoice
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderInvoices = () => (
    <>
      <SectionToolbar title="Invoices" subtitle={`${currency(derived.arOutstanding)} still open across customer invoices.`} actions={<button className="btn btn-secondary" onClick={() => showToast('Invoice register export simulated.')}><Download size={16} /> Export</button>} />
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr><th>Invoice #</th><th>Customer / Job</th><th>Milestone</th><th>Total</th><th>Paid</th><th>Balance</th><th>Due</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const balance = documentBalance(invoice.amount, invoice.payments);
              const status = documentStatus({ amount: invoice.amount, payments: invoice.payments, dueDate: invoice.dueDate });
              return (
                <React.Fragment key={invoice.id}>
                  <tr>
                    <td style={{ fontWeight: 700 }}>{invoice.invoiceNumber || invoice.id}</td>
                    <td><strong>{jobName(invoice.jobId)}</strong><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{invoice.jobId}</div></td>
                    <td>{invoice.milestone}</td>
                    <td>{currency(invoice.amount)}</td>
                    <td>{currency(sumPayments(invoice.payments))}</td>
                    <td style={{ fontWeight: 700, color: balance > 0 ? 'var(--danger)' : 'var(--success)' }}>{currency(balance)}</td>
                    <td>{formatDate(invoice.dueDate)}</td>
                    <td><StatusBadge status={status} /></td>
                    <td>{balance > 0 && <button className="btn btn-primary" style={{ padding: '0.45rem 0.65rem' }} onClick={() => openPayment('invoice', invoice)}><CircleDollarSign size={14} /> Record</button>}</td>
                  </tr>
                  {invoice.payments?.length > 0 && (
                    <tr>
                      <td></td>
                      <td colSpan="8" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                        <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment history: </strong>
                        {invoice.payments.map((payment) => (
                          <span key={payment.id} style={{ marginRight: '1rem', fontSize: '0.85rem' }}>
                            {formatDate(payment.date)} - {currency(payment.amount)} - {payment.method}{payment.reference ? ` - ${payment.reference}` : ''}
                          </span>
                        ))}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderBills = () => (
    <>
      <SectionToolbar title="Bills" subtitle={`${currency(derived.apDue)} due to vendors and job costs.`} actions={<button className="btn btn-primary" onClick={() => setIsBillOpen(true)}><Plus size={16} /> New Bill</button>} />
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr><th>Bill #</th><th>Vendor</th><th>Job</th><th>Category</th><th>Total</th><th>Balance</th><th>Due</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {bills.map((bill) => {
              const balance = documentBalance(bill.amount, bill.payments);
              return (
                <tr key={bill.id}>
                  <td style={{ fontWeight: 700 }}>{bill.id}</td>
                  <td>{bill.vendor}</td>
                  <td>{bill.jobId ? jobName(bill.jobId) : 'Office / Overhead'}</td>
                  <td>{bill.category}</td>
                  <td>{currency(bill.amount)}</td>
                  <td style={{ fontWeight: 700 }}>{currency(balance)}</td>
                  <td>{formatDate(bill.dueDate)}</td>
                  <td><StatusBadge status={documentStatus({ amount: bill.amount, payments: bill.payments, dueDate: bill.dueDate })} /></td>
                  <td>{balance > 0 ? <button className="btn btn-primary" style={{ padding: '0.45rem 0.65rem' }} onClick={() => openPayment('bill', bill)}><CircleDollarSign size={14} /> Pay Bill</button> : <CheckCircle2 color="var(--success)" />}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderPayroll = () => {
    const totalHours = payrollEntries.reduce((total, entry) => total + toNumber(entry.hours), 0);
    const jobHours = payrollEntries.filter((entry) => entry.jobId).reduce((total, entry) => total + toNumber(entry.hours), 0);
    const overheadHours = totalHours - jobHours;
    const laborCost = payrollEntries.reduce((total, entry) => total + calculatePayrollEntryCost(entry), 0);
    const byProject = groupBy(payrollEntries, (entry) => entry.project || 'Unassigned');
    const byEmployee = groupBy(payrollEntries, (entry) => entry.employeeName || 'Employee');

    return (
      <>
        <SectionToolbar
          title="Payroll / BusyBusy Import"
          subtitle="BusyBusy stays in place; this imports pay-period hours by employee and job for costing."
          actions={<button className="btn btn-primary" onClick={importBusyBusySample}><Upload size={16} /> Import BusyBusy Sample</button>}
        />
        <div className="responsive-grid" style={{ padding: '1.5rem' }}>
          <div className="span-3"><KpiCard title="Total Hours" value={roundMoney(totalHours)} subtext="Imported pay-period hours" icon={Clock} /></div>
          <div className="span-3"><KpiCard title="Job Hours" value={roundMoney(jobHours)} subtext="Mapped to active jobs" icon={BriefcaseIcon} type="success" /></div>
          <div className="span-3"><KpiCard title="Office/Service/Training" value={roundMoney(overheadHours)} subtext="Non-job categories" icon={Users} type="warning" /></div>
          <div className="span-3"><KpiCard title="Estimated Labor Cost" value={currency(laborCost)} subtext="Hours x rate" icon={CircleDollarSign} type="primary" /></div>
        </div>
        <div className="responsive-grid" style={{ padding: '0 1.5rem 1.5rem' }}>
          <div className="span-6">
            <div className="card">
              <SectionToolbar title="Hours by Project" />
              <div className="table-scroll">
                <table className="data-table">
                  <tbody>
                    {Object.entries(byProject).map(([project, entries]) => (
                      <tr key={project}><td>{project}</td><td>{roundMoney(entries.reduce((total, entry) => total + toNumber(entry.hours), 0))} hrs</td><td>{currency(entries.reduce((total, entry) => total + calculatePayrollEntryCost(entry), 0))}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="span-6">
            <div className="card">
              <SectionToolbar title="Hours by Employee" />
              <div className="table-scroll">
                <table className="data-table">
                  <tbody>
                    {Object.entries(byEmployee).map(([employee, entries]) => (
                      <tr key={employee}><td>{employee}</td><td>{roundMoney(entries.reduce((total, entry) => total + toNumber(entry.hours), 0))} hrs</td><td>{currency(entries.reduce((total, entry) => total + calculatePayrollEntryCost(entry), 0))}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderCommissions = () => (
    <>
      <SectionToolbar title="Commissions" subtitle="Tracks the commission worksheet Dorothy shared." />
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>Customer / Job</th><th>Salesperson</th><th>Contract Date</th><th>Contract Amount</th><th>Commission Due</th><th>Paid</th><th>Balance</th><th>Notes</th></tr></thead>
          <tbody>
            {commissions.map((commission) => {
              const summary = calculateCommission(commission);
              return (
                <tr key={commission.id}>
                  <td><strong>{commission.customerName}</strong><div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{commission.jobId}</div></td>
                  <td>{commission.salesperson}</td>
                  <td>{formatDate(commission.contractDate)}</td>
                  <td>{currency(commission.contractAmount)}</td>
                  <td>{currency(summary.due)}</td>
                  <td>{currency(summary.paid)}</td>
                  <td style={{ fontWeight: 700 }}>{currency(summary.balance)}</td>
                  <td>{commission.notes || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderTax = () => (
    <>
      <SectionToolbar title="Sales & Use Tax" subtitle="Mirrors Dorothy's monthly Sales & Use worksheet." />
      <div style={{ padding: '1.5rem' }}>
        <div className="responsive-grid">
          <div className="span-6">
            <div className="card" style={{ padding: '1rem' }}>
              <h3>Sales Tax - Wisconsin</h3>
              <div className="detail-list">
                <div className="detail-item"><span>Total Sales</span><strong>{currency(salesTaxReport.totalSales)}</strong></div>
                <div className="detail-item"><span>Total Subtractions</span><strong>{currency(tax.totalSubtractions)}</strong></div>
                <div className="detail-item"><span>Sales Subject to State Tax</span><strong>{currency(tax.taxableSales)}</strong></div>
                <div className="detail-item"><span>State Sales Tax</span><strong>{currency(tax.stateSalesTax)}</strong></div>
              </div>
            </div>
          </div>
          <div className="span-6">
            <div className="card" style={{ padding: '1rem' }}>
              <h3>Use Tax / County Tax</h3>
              <div className="detail-list">
                <div className="detail-item"><span>Purchases Subject to Use Tax</span><strong>{currency(salesTaxReport.purchasesSubjectToUseTax)}</strong></div>
                <div className="detail-item"><span>County Sales Tax</span><strong>{currency(tax.countySalesTax)}</strong></div>
                <div className="detail-item"><span>State Use Tax</span><strong>{currency(tax.stateUseTax)}</strong></div>
                <div className="detail-item"><span>County Use Tax</span><strong>{currency(tax.countyUseTax)}</strong></div>
              </div>
            </div>
          </div>
          <div className="span-12">
            <div className="card" style={{ padding: '1rem' }}>
              <h3>Totals</h3>
              <div className="detail-list">
                <div className="detail-item"><span>Total Sales Tax</span><strong>{currency(tax.totalSalesTax)}</strong></div>
                <div className="detail-item"><span>Estimated Discount</span><strong>{currency(salesTaxReport.estimatedDiscount)}</strong></div>
                <div className="detail-item"><span>Total Use Tax</span><strong>{currency(tax.totalUseTax)}</strong></div>
                <div className="detail-item"><span>Total Amount Due</span><strong>{currency(tax.totalAmountDue)}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderPnl = () => (
    <>
      <SectionToolbar
        title="Job Profit & Loss"
        subtitle="Revenue, costs, labor, gross profit, and margin by job."
        actions={
          <select className="form-input" value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)} style={{ width: '260px' }}>
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.id} - {job.customerName}</option>)}
          </select>
        }
      />
      <div style={{ padding: '1.5rem' }}>
        <div className="card" style={{ maxWidth: '720px', margin: '0 auto', padding: '1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h3>Kool View Co., Inc.</h3>
            <p style={{ color: 'var(--text-muted)' }}>Profit & Loss for {selectedJob?.customerName}</p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>Accrual Basis</p>
          </div>
          {[
            ['Ordinary Income/Expense', ''],
            ['Income', currency(selectedPnl.invoicedRevenue)],
            ['Collected Revenue', currency(selectedPnl.collectedRevenue)],
            ['Costs - Bills / Materials', currency(selectedPnl.billCosts)],
            ['Costs - Labor', currency(selectedPnl.laborCost)],
            ['Total Costs', currency(selectedPnl.totalCosts)],
            ['Gross Profit', currency(selectedPnl.grossProfit)],
            ['Net Income', currency(selectedPnl.grossProfit)],
            ['Margin', `${selectedPnl.margin}%`],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', padding: '0.55rem 0', fontWeight: label.includes('Profit') || label.includes('Income') ? 700 : 500 }}>
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderReports = () => (
    <div style={{ padding: '1.5rem' }}>
      <div className="responsive-grid">
        <div className="span-3"><KpiCard title="A/R Aging" value={currency(derived.arOutstanding)} subtext="Open customer balances" icon={Receipt} type="danger" /></div>
        <div className="span-3"><KpiCard title="A/P Aging" value={currency(derived.apDue)} subtext="Open vendor balances" icon={BookOpen} type="warning" /></div>
        <div className="span-3"><KpiCard title="Collected Cash" value={currency(derived.collectedThisMonth)} subtext="Posted customer payments" icon={CheckCircle2} type="success" /></div>
        <div className="span-3"><KpiCard title="Simple P&L" value={currency(derived.openJobProfit)} subtext="Job revenue less costs" icon={CircleDollarSign} type="primary" /></div>
      </div>
      <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem' }}>
        This POC intentionally keeps reports operational: A/R, A/P, collected cash, payroll summary, and simple job P&L. Full general ledger and bank reconciliation remain Phase 2.
      </p>
    </div>
  );

  const renderActiveTab = () => {
    if (activeTab === 'estimates') return renderEstimates();
    if (activeTab === 'invoices') return renderInvoices();
    if (activeTab === 'bills') return renderBills();
    if (activeTab === 'payroll') return renderPayroll();
    if (activeTab === 'commissions') return renderCommissions();
    if (activeTab === 'tax') return renderTax();
    if (activeTab === 'pnl') return renderPnl();
    return renderReports();
  };

  return (
    <div className="animate-fade-in">
      {actionMessage && <div className="toast">{actionMessage}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Accounting Center</h1>
          <p className="page-subtitle">Estimates, invoices, payments, bills, payroll imports, commissions, sales/use tax, and job P&L.</p>
        </div>
      </div>

      <div className="responsive-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="span-3"><KpiCard title="A/R Outstanding" value={currency(derived.arOutstanding)} subtext="Customer balances" icon={Receipt} type="danger" /></div>
        <div className="span-3"><KpiCard title="Bills Due" value={currency(derived.apDue)} subtext="Vendor payables" icon={BookOpen} type="warning" /></div>
        <div className="span-3"><KpiCard title="Payroll Cost" value={currency(derived.payrollCost)} subtext="Imported hours x rate" icon={Clock} type="primary" /></div>
        <div className="span-3"><KpiCard title="Job Profit" value={currency(derived.openJobProfit)} subtext="Operational P&L snapshot" icon={CircleDollarSign} type="success" /></div>
      </div>

      <div className="card">
        <div className="tabs">
          {tabs.map((tab) => (
            <button key={tab.id} className={`tab-button ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {React.createElement(tab.icon, { size: 16 })}
              {tab.label}
            </button>
          ))}
        </div>
        {renderActiveTab()}
      </div>

      <Modal
        isOpen={!!selectedEstimate}
        onClose={() => setSelectedEstimate(null)}
        title={selectedEstimate ? `${selectedEstimate.id} Estimate Items` : 'Estimate Items'}
        footer={<button className="btn btn-primary" onClick={() => setSelectedEstimate(null)}>Close</button>}
      >
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Item</th><th>Description</th><th>Qty</th><th>Rate</th><th>Total</th></tr></thead>
            <tbody>
              {selectedEstimate?.items?.map((item) => (
                <tr key={item.id}>
                  <td>{item.itemCode}</td>
                  <td>{item.description}</td>
                  <td>{item.quantity}</td>
                  <td>{currency(item.rate)}</td>
                  <td>{currency(toNumber(item.quantity) * toNumber(item.rate))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal
        isOpen={!!paymentTarget}
        onClose={() => setPaymentTarget(null)}
        title={paymentTarget?.type === 'invoice' ? 'Record Invoice Payment' : 'Record Bill Payment'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setPaymentTarget(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitPayment}>Save Payment</button>
          </>
        }
      >
        <div className="field-grid">
          <div className="form-group">
            <label className="form-label">Payment Date</label>
            <input className="form-input" type="date" value={paymentForm.date} onChange={(event) => setPaymentForm({ ...paymentForm, date: event.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input className="form-input" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Method</label>
            <select className="form-input" value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })}>
              {paymentMethods.map((method) => <option key={method}>{method}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Reference / Check #</label>
            <input className="form-input" value={paymentForm.reference} onChange={(event) => setPaymentForm({ ...paymentForm, reference: event.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-input" rows="3" value={paymentForm.notes} onChange={(event) => setPaymentForm({ ...paymentForm, notes: event.target.value })} />
        </div>
      </Modal>

      <Modal
        isOpen={isEstimateOpen}
        onClose={() => setIsEstimateOpen(false)}
        title="New Estimate"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsEstimateOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={createEstimate}>Create Estimate</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Job</label>
          <select className="form-input" value={estimateForm.jobId} onChange={(event) => setEstimateForm({ ...estimateForm, jobId: event.target.value })}>
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.id} - {job.customerName}</option>)}
          </select>
        </div>
        <div className="field-grid">
          <div className="form-group">
            <label className="form-label">Contract Amount</label>
            <input className="form-input" value={estimateForm.amount} onChange={(event) => setEstimateForm({ ...estimateForm, amount: event.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-input" value={estimateForm.status} onChange={(event) => setEstimateForm({ ...estimateForm, status: event.target.value })}>
              <option>Draft</option>
              <option>Sent</option>
              <option>Approved</option>
            </select>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isBillOpen}
        onClose={() => setIsBillOpen(false)}
        title="New Vendor Bill"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsBillOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={createBill}>Add Bill</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Job</label>
          <select className="form-input" value={billForm.jobId} onChange={(event) => setBillForm({ ...billForm, jobId: event.target.value })}>
            <option value="">Office / Overhead</option>
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.id} - {job.customerName}</option>)}
          </select>
        </div>
        <div className="field-grid">
          <div className="form-group">
            <label className="form-label">Vendor</label>
            <input className="form-input" value={billForm.vendor} onChange={(event) => setBillForm({ ...billForm, vendor: event.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={billForm.category} onChange={(event) => setBillForm({ ...billForm, category: event.target.value })}>
              <option>Materials</option>
              <option>Permits</option>
              <option>Subcontractor</option>
              <option>Freight</option>
              <option>Insurance</option>
              <option>Utilities</option>
              <option>Office</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input className="form-input" value={billForm.amount} onChange={(event) => setBillForm({ ...billForm, amount: event.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input className="form-input" type="date" value={billForm.dueDate} onChange={(event) => setBillForm({ ...billForm, dueDate: event.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" rows="3" value={billForm.description} onChange={(event) => setBillForm({ ...billForm, description: event.target.value })} />
        </div>
      </Modal>
    </div>
  );
}

function BriefcaseIcon(props) {
  return <BookOpen {...props} />;
}
