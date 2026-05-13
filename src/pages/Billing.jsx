import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Download,
  FileText,
  Plus,
  Send,
  TrendingUp,
  Users,
} from 'lucide-react';
import Modal from '../components/Modal';
import {
  accountingSummary,
  billBalance,
  billStatus,
  currency,
  invoiceBalance,
  invoiceStatus,
  seedBills,
  seedEstimates,
  seedInvoices,
  seedPayrollEmployees,
  seedPayrollRuns,
} from '../data/accounting';

const today = new Date();
const todayInput = today.toISOString().slice(0, 10);

const fallbackEstimates = [
  { id: 'EST-1044', customer: 'Pam Beesly', project: 'Four season sunroom', amount: 12500, status: 'Approved', validUntil: '2026-06-15', notes: 'Includes permits and standard glazing.' },
  { id: 'EST-1045', customer: 'Dwight Schrute', project: 'Barn window replacement', amount: 8200, status: 'Sent', validUntil: '2026-06-02', notes: 'Customer requested black exterior frames.' },
  { id: 'EST-1046', customer: 'Jim Halpert', project: 'Patio enclosure', amount: 15800, status: 'Draft', validUntil: '2026-06-21', notes: 'Pending final measurement.' },
];

const fallbackInvoices = [
  { id: 'INV-2041', customer: 'Pam Beesly', project: 'Deposit', amount: 2500, dueDate: '2026-05-29', invoiceDate: '2026-05-01', status: 'Open', payments: [] },
  { id: 'INV-2042', customer: 'Dwight Schrute', project: 'Factory order', amount: 4800, dueDate: '2026-05-18', invoiceDate: '2026-04-25', status: 'Open', payments: [{ date: '2026-05-05', amount: 1800, method: 'ACH', reference: 'ACH-5921', notes: 'Partial deposit' }] },
  { id: 'INV-2043', customer: 'Jim Halpert', project: 'Final completion', amount: 8200, dueDate: '2026-04-28', invoiceDate: '2026-04-01', status: 'Overdue', payments: [] },
  { id: 'INV-2039', customer: 'Stanley Hudson', project: 'Deposit', amount: 1500, dueDate: '2026-04-16', invoiceDate: '2026-04-01', status: 'Paid', payments: [{ date: '2026-05-02', amount: 1500, method: 'Card', reference: 'CARD-1039', notes: 'Paid online' }] },
];

const fallbackBills = [
  { id: 'BILL-881', vendor: 'Great Lakes Glass', category: 'Materials', amount: 6400, dueDate: '2026-05-20', billDate: '2026-05-03', status: 'Open', payments: [] },
  { id: 'BILL-882', vendor: 'Permit Office', category: 'Permits', amount: 475, dueDate: '2026-05-16', billDate: '2026-05-04', status: 'Open', payments: [] },
  { id: 'BILL-879', vendor: 'Sunbelt Freight', category: 'Freight', amount: 980, dueDate: '2026-04-25', billDate: '2026-04-05', status: 'Overdue', payments: [] },
];

const fallbackEmployees = [
  { id: 'EMP-01', name: 'Meredith Palmer', role: 'Installer', hourlyRate: 32, hours: 76 },
  { id: 'EMP-02', name: 'Oscar Martinez', role: 'Office', hourlyRate: 38, hours: 80 },
  { id: 'EMP-03', name: 'Darryl Philbin', role: 'Crew lead', hourlyRate: 42, hours: 78 },
];

const fallbackPayrollRuns = [
  { id: 'PAY-117', period: 'Apr 16-30, 2026', runDate: '2026-05-01', gross: 8636, taxes: 1727.2, net: 6908.8, status: 'Processed' },
];

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '1rem 1.5rem', fontWeight: 600 },
  td: { padding: '1rem 1.5rem', verticalAlign: 'top' },
  toolbar: {
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    borderBottom: '1px solid var(--border)',
    flexWrap: 'wrap',
  },
  rowActions: { display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' },
  mutedButton: { padding: '0.25rem', color: 'var(--text-muted)', transition: 'color 0.2s', cursor: 'pointer' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' },
  metricLabel: { color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' },
};

const safeArray = (value, fallback) => (Array.isArray(value) && value.length ? value : fallback);

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getValue = (record, keys, fallback = '') => {
  const found = keys.find((key) => record?.[key] !== undefined && record?.[key] !== null && record?.[key] !== '');
  return found ? record[found] : fallback;
};

const getTotal = (record) => toNumber(getValue(record, ['amount', 'total', 'invoiceTotal', 'billTotal', 'gross'], 0));

const paymentTotal = (record) => {
  const payments = Array.isArray(record?.payments) ? record.payments : [];
  const posted = payments.reduce((sum, payment) => sum + toNumber(payment.amount), 0);
  return posted + toNumber(getValue(record, ['paidAmount', 'amountPaid'], 0));
};

const formatMoney = (value) => {
  if (typeof currency === 'function') {
    try {
      return currency(value);
    } catch {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(toNumber(value));
    }
  }

  if (currency?.format) return currency.format(toNumber(value));
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(toNumber(value));
};

const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const daysPastDue = (dateValue) => {
  const dueDate = new Date(dateValue);
  if (Number.isNaN(dueDate.getTime())) return 0;
  return Math.max(0, Math.floor((today - dueDate) / 86400000));
};

const addDaysInput = (days) => {
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const helperNumber = (helper, record, fallback) => {
  if (typeof helper !== 'function') return fallback;
  try {
    const value = toNumber(helper(record));
    return Number.isFinite(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

const localInvoiceBalance = (invoice) => Math.max(0, getTotal(invoice) - paymentTotal(invoice));
const localBillBalance = (bill) => Math.max(0, getTotal(bill) - paymentTotal(bill));

const getInvoiceBalance = (invoice) => helperNumber(invoiceBalance, invoice, localInvoiceBalance(invoice));
const getBillBalance = (bill) => helperNumber(billBalance, bill, localBillBalance(bill));

const localDocumentStatus = (record, balance) => {
  if (balance <= 0) return 'Paid';
  if (paymentTotal(record) > 0) return 'Partial';
  if (daysPastDue(getValue(record, ['dueDate', 'due'])) > 0) return 'Overdue';
  return getValue(record, ['status'], 'Open');
};

const getInvoiceStatus = (invoice) => {
  if (typeof invoiceStatus === 'function') {
    try {
      return invoiceStatus(invoice);
    } catch {
      return localDocumentStatus(invoice, getInvoiceBalance(invoice));
    }
  }
  return localDocumentStatus(invoice, getInvoiceBalance(invoice));
};

const getBillStatus = (bill) => {
  if (typeof billStatus === 'function') {
    try {
      return billStatus(bill);
    } catch {
      return localDocumentStatus(bill, getBillBalance(bill));
    }
  }
  return localDocumentStatus(bill, getBillBalance(bill));
};

const getBadgeClass = (status) => {
  const normalized = String(status).toLowerCase();
  if (normalized.includes('paid') || normalized.includes('approved') || normalized.includes('processed') || normalized.includes('contract')) return 'badge badge-success';
  if (normalized.includes('overdue') || normalized.includes('void')) return 'badge badge-danger';
  if (normalized.includes('partial') || normalized.includes('converted')) return 'badge badge-primary';
  if (normalized.includes('open') || normalized.includes('sent') || normalized.includes('due')) return 'badge badge-warning';
  return 'badge';
};

const plainBadgeStyle = {
  backgroundColor: 'var(--bg-subtle)',
  color: 'var(--text-muted)',
  border: '1px solid var(--border)',
};

const nextId = (prefix, records) => {
  const highest = records.reduce((max, record) => {
    const numeric = Number(String(record.id || '').replace(/\D/g, ''));
    return Number.isFinite(numeric) ? Math.max(max, numeric) : max;
  }, 0);
  return `${prefix}-${highest + 1}`;
};

const normalizeEmployee = (employee) => {
  const seededWeeklyGross = toNumber(getValue(employee, ['weeklyGross'], 0));
  const rate = toNumber(getValue(employee, ['hourlyRate', 'rate'], seededWeeklyGross ? seededWeeklyGross / 40 : 0));
  const hours = toNumber(getValue(employee, ['hours', 'periodHours'], seededWeeklyGross ? 40 : 0));
  const gross = toNumber(getValue(employee, ['gross', 'grossPay', 'weeklyGross'], rate * hours));
  return {
    id: getValue(employee, ['id', 'employeeId'], employee.name),
    name: getValue(employee, ['name', 'employee'], 'Team member'),
    role: getValue(employee, ['role', 'title'], 'Crew'),
    payType: getValue(employee, ['payType'], seededWeeklyGross ? 'Weekly' : 'Hourly'),
    payrollStatus: getValue(employee, ['payrollStatus'], 'Due'),
    hourlyRate: rate,
    hours,
    gross,
    taxes: gross * 0.2,
    net: gross * 0.8,
  };
};

const normalizePayrollRun = (run) => {
  const gross = toNumber(getValue(run, ['gross', 'grossPay', 'total'], 0));
  const taxes = toNumber(getValue(run, ['taxes', 'withholding'], gross * 0.2));
  return {
    ...run,
    id: getValue(run, ['id', 'runId'], 'PAY-RUN'),
    period: getValue(run, ['period', 'payPeriod'], run.periodStart && run.periodEnd ? `${formatDate(run.periodStart)} - ${formatDate(run.periodEnd)}` : 'Current period'),
    runDate: getValue(run, ['runDate', 'date', 'checkDate'], todayInput),
    gross,
    taxes,
    net: toNumber(getValue(run, ['net', 'netPay'], gross - taxes)),
    status: getValue(run, ['status'], 'Processed'),
  };
};

const sum = (records, selector) => records.reduce((total, record) => total + selector(record), 0);

const getSummaryValue = (summary, keys) => {
  const source = typeof summary === 'function' ? {} : summary || {};
  return toNumber(getValue(source, keys, 0));
};

function KpiCard({ title, value, subtext, icon, type = 'primary' }) {
  return (
    <div className="card" style={{ gridColumn: 'span 3', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
        <div>
          <p style={styles.metricLabel}>{title}</p>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 700, margin: 0 }}>{value}</h3>
        </div>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: `var(--${type}-light)`,
          color: `var(--${type})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {React.createElement(icon, { size: 20 })}
        </div>
      </div>
      <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginTop: '0.75rem' }}>{subtext}</p>
    </div>
  );
}

function TabButton({ id, activeTab, onClick, children, icon }) {
  const active = activeTab === id;
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        fontWeight: 600,
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
        paddingBottom: '0.75rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        whiteSpace: 'nowrap',
      }}
    >
      {React.createElement(icon, { size: 16 })}
      {children}
    </button>
  );
}

function TableHeader({ columns }) {
  return (
    <thead>
      <tr style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {columns.map((column) => (
          <th key={column} style={styles.th}>{column}</th>
        ))}
      </tr>
    </thead>
  );
}

function StatusBadge({ status }) {
  const className = getBadgeClass(status);
  return <span className={className} style={className === 'badge' ? plainBadgeStyle : undefined}>{status}</span>;
}

function EmptyRow({ colSpan, label }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        {label}
      </td>
    </tr>
  );
}

function Field({ label, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export default function Billing() {
  const [activeTab, setActiveTab] = useState('estimates');
  const [actionMessage, setActionMessage] = useState('');
  const [estimates, setEstimates] = useState(() => safeArray(seedEstimates, fallbackEstimates));
  const [invoices, setInvoices] = useState(() => safeArray(seedInvoices, fallbackInvoices));
  const [bills, setBills] = useState(() => safeArray(seedBills, fallbackBills));
  const [payrollEmployees] = useState(() => safeArray(seedPayrollEmployees, fallbackEmployees).map(normalizeEmployee));
  const [payrollRuns, setPayrollRuns] = useState(() => safeArray(seedPayrollRuns, fallbackPayrollRuns).map(normalizePayrollRun));

  const [isEstimateOpen, setIsEstimateOpen] = useState(false);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [payingBill, setPayingBill] = useState(null);
  const [payrollPeriod, setPayrollPeriod] = useState('May 1-15, 2026');

  const [estimateForm, setEstimateForm] = useState({
    customer: '',
    project: '',
    amount: '',
    validUntil: addDaysInput(30),
    notes: '',
  });

  const [billForm, setBillForm] = useState({
    vendor: '',
    category: 'Materials',
    amount: '',
    billDate: todayInput,
    dueDate: addDaysInput(14),
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    date: todayInput,
    amount: '',
    method: 'ACH',
    reference: '',
    notes: '',
  });

  const derived = useMemo(() => {
    const summary = typeof accountingSummary === 'function'
      ? accountingSummary({ estimates, invoices, bills, payrollEmployees, payrollRuns })
      : accountingSummary;

    const arOutstanding = sum(invoices, getInvoiceBalance);
    const apDue = sum(bills, getBillBalance);
    const payrollGross = sum(payrollEmployees, (employee) => employee.gross);
    const payrollTaxes = payrollGross * 0.2;
    const payrollDue = getSummaryValue(summary, ['payrollDue', 'payrollLiability']) || payrollGross - payrollTaxes;

    const collectedThisMonthLive = sum(invoices, (invoice) => {
      const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
      return sum(payments, (payment) => {
        const date = new Date(payment.date);
        if (date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()) return toNumber(payment.amount);
        return 0;
      });
    });

    const collectedThisMonth = collectedThisMonthLive || getSummaryValue(summary, ['collectedThisMonth', 'monthlyCollected', 'collected']);
    const recognizedRevenue = sum(invoices, (invoice) => paymentTotal(invoice) || (getInvoiceStatus(invoice) === 'Paid' ? getTotal(invoice) : 0));
    const paidBills = sum(bills, (bill) => paymentTotal(bill) || (getBillStatus(bill) === 'Paid' ? getTotal(bill) : 0));
    const payrollExpense = sum(payrollRuns, (run) => normalizePayrollRun(run).gross);

    return {
      arOutstanding: arOutstanding || getSummaryValue(summary, ['arOutstanding', 'accountsReceivable', 'receivablesOutstanding']),
      apDue: apDue || getSummaryValue(summary, ['apDue', 'accountsPayable', 'payablesDue']),
      payrollDue,
      collectedThisMonth,
      recognizedRevenue,
      paidBills,
      payrollExpense,
      profit: recognizedRevenue - paidBills - payrollExpense,
    };
  }, [bills, estimates, invoices, payrollEmployees, payrollRuns]);

  const payrollPreview = useMemo(() => {
    const gross = sum(payrollEmployees, (employee) => employee.gross);
    const taxes = gross * 0.2;
    return { gross, taxes, net: gross - taxes };
  }, [payrollEmployees]);

  const showToast = (message) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const resetEstimateForm = () => {
    setEstimateForm({ customer: '', project: '', amount: '', validUntil: addDaysInput(30), notes: '' });
  };

  const resetBillForm = () => {
    setBillForm({ vendor: '', category: 'Materials', amount: '', billDate: todayInput, dueDate: addDaysInput(14), notes: '' });
  };

  const openPaymentModal = (invoice) => {
    setPaymentInvoice(invoice);
    setPaymentForm({ date: todayInput, amount: String(getInvoiceBalance(invoice)), method: 'ACH', reference: '', notes: '' });
  };

  const openBillPaymentModal = (bill) => {
    setPayingBill(bill);
    setPaymentForm({ date: todayInput, amount: String(getBillBalance(bill)), method: 'ACH', reference: '', notes: '' });
  };

  const createEstimate = () => {
    const amount = toNumber(estimateForm.amount);
    if (!estimateForm.customer || !estimateForm.project || amount <= 0) {
      showToast('Customer, project, and amount are required.');
      return;
    }

    const estimate = {
      id: nextId('EST', estimates),
      customer: estimateForm.customer,
      project: estimateForm.project,
      amount,
      status: 'Draft',
      validUntil: estimateForm.validUntil,
      notes: estimateForm.notes,
      createdAt: todayInput,
    };

    setEstimates([estimate, ...estimates]);
    setIsEstimateOpen(false);
    resetEstimateForm();
    showToast(`${estimate.id} created for ${estimate.customer}.`);
  };

  const updateEstimateStatus = (id, status) => {
    setEstimates((current) => current.map((estimate) => estimate.id === id ? { ...estimate, status } : estimate));
  };

  const convertEstimateToInvoice = (estimate) => {
    if (estimate.status !== 'Approved') return;
    const invoiceId = nextId('INV', invoices);
    const invoice = {
      id: invoiceId,
      customer: estimate.customer,
      project: getValue(estimate, ['project', 'projectType', 'description'], 'Project estimate'),
      address: getValue(estimate, ['address'], ''),
      amount: getTotal(estimate),
      dueDate: addDaysInput(30),
      invoiceDate: todayInput,
      status: 'Open',
      sourceEstimateId: estimate.id,
      payments: [],
    };

    setInvoices([invoice, ...invoices]);
    setEstimates((current) => current.map((item) => (
      item.id === estimate.id ? { ...item, status: 'Converted', convertedInvoiceId: invoiceId } : item
    )));
    setActiveTab('invoices');
    showToast(`${estimate.id} converted to ${invoiceId}.`);
  };

  const recordInvoicePayment = () => {
    if (!paymentInvoice) return;
    const amount = Math.min(toNumber(paymentForm.amount), getInvoiceBalance(paymentInvoice));
    if (amount <= 0) {
      showToast('Enter a payment amount greater than zero.');
      return;
    }

    setInvoices((current) => current.map((invoice) => {
      if (invoice.id !== paymentInvoice.id) return invoice;
      const payments = [...(Array.isArray(invoice.payments) ? invoice.payments : []), { ...paymentForm, amount }];
      const updated = { ...invoice, payments };
      return { ...updated, status: localDocumentStatus(updated, localInvoiceBalance(updated)) };
    }));
    setPaymentInvoice(null);
    showToast(`Payment recorded for ${paymentInvoice.id}.`);
  };

  const createBill = () => {
    const amount = toNumber(billForm.amount);
    if (!billForm.vendor || amount <= 0) {
      showToast('Vendor and amount are required.');
      return;
    }

    const bill = {
      id: nextId('BILL', bills),
      vendor: billForm.vendor,
      category: billForm.category,
      amount,
      billDate: billForm.billDate,
      dueDate: billForm.dueDate,
      notes: billForm.notes,
      status: 'Open',
      payments: [],
    };

    setBills([bill, ...bills]);
    setIsBillOpen(false);
    resetBillForm();
    showToast(`${bill.id} added for ${bill.vendor}.`);
  };

  const payBill = () => {
    if (!payingBill) return;
    const amount = Math.min(toNumber(paymentForm.amount), getBillBalance(payingBill));
    if (amount <= 0) {
      showToast('Enter a bill payment amount greater than zero.');
      return;
    }

    setBills((current) => current.map((bill) => {
      if (bill.id !== payingBill.id) return bill;
      const payments = [...(Array.isArray(bill.payments) ? bill.payments : []), { ...paymentForm, amount }];
      const updated = { ...bill, payments };
      return { ...updated, status: localDocumentStatus(updated, localBillBalance(updated)) };
    }));
    setPayingBill(null);
    showToast(`Payment posted to ${payingBill.id}.`);
  };

  const runPayroll = () => {
    const run = {
      id: nextId('PAY', payrollRuns),
      period: payrollPeriod,
      runDate: todayInput,
      gross: payrollPreview.gross,
      taxes: payrollPreview.taxes,
      net: payrollPreview.net,
      status: 'Processed',
      employees: payrollEmployees.map((employee) => ({ id: employee.id, gross: employee.gross, net: employee.net })),
    };

    setPayrollRuns([run, ...payrollRuns]);
    showToast(`Payroll ${run.id} processed for ${run.period}.`);
  };

  const renderEstimates = () => (
    <>
      <div style={styles.toolbar}>
        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Estimates</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{estimates.length} active quotes and proposals</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsEstimateOpen(true)}>
          <Plus size={18} /> New Estimate
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <TableHeader columns={['Estimate #', 'Customer', 'Project', 'Amount', 'Valid Until', 'Status', 'Actions']} />
          <tbody>
            {estimates.map((estimate) => (
              <tr key={estimate.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-lift">
                <td style={{ ...styles.td, fontWeight: 700 }}>{estimate.id}</td>
                <td style={styles.td}>{estimate.customer}</td>
                <td style={styles.td}>
                  <div style={{ fontWeight: 600 }}>{getValue(estimate, ['project', 'projectType', 'description'], 'Project estimate')}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    {getValue(estimate, ['address', 'notes'], estimate.notes || 'No notes')}
                  </div>
                </td>
                <td style={{ ...styles.td, fontWeight: 700 }}>{formatMoney(getTotal(estimate))}</td>
                <td style={{ ...styles.td, color: 'var(--text-muted)' }}>{formatDate(getValue(estimate, ['validUntil', 'expiresDate']))}</td>
                <td style={styles.td}>
                  <StatusBadge status={estimate.status} />
                  {estimate.convertedInvoiceId && (
                    <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '0.35rem' }}>{estimate.convertedInvoiceId}</div>
                  )}
                </td>
                <td style={styles.td}>
                  <div style={styles.rowActions}>
                    {estimate.status === 'Draft' && (
                      <button className="btn btn-secondary" style={{ padding: '0.45rem 0.75rem' }} onClick={() => updateEstimateStatus(estimate.id, 'Sent')}>
                        <Send size={14} /> Send
                      </button>
                    )}
                    {estimate.status !== 'Approved' && estimate.status !== 'Converted' && (
                      <button className="btn btn-secondary" style={{ padding: '0.45rem 0.75rem' }} onClick={() => updateEstimateStatus(estimate.id, 'Approved')}>
                        <CheckCircle2 size={14} /> Approve
                      </button>
                    )}
                    {estimate.status === 'Approved' && (
                      <button className="btn btn-primary" style={{ padding: '0.45rem 0.75rem' }} onClick={() => convertEstimateToInvoice(estimate)}>
                        <ArrowRight size={14} /> Invoice
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {estimates.length === 0 && <EmptyRow colSpan={7} label="No estimates yet." />}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderInvoices = () => (
    <>
      <div style={styles.toolbar}>
        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Invoices</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatMoney(derived.arOutstanding)} outstanding across receivables</p>
        </div>
        <button className="btn btn-secondary" onClick={() => showToast('Invoice register exported.')}>
          <Download size={16} /> Export
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <TableHeader columns={['Invoice #', 'Customer', 'Project', 'Total', 'Balance', 'Due Date', 'Status', 'Actions']} />
          <tbody>
            {invoices.map((invoice) => {
              const balance = getInvoiceBalance(invoice);
              const status = getInvoiceStatus(invoice);
              const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
              return (
                <React.Fragment key={invoice.id}>
                  <tr style={{ borderBottom: payments.length ? 'none' : '1px solid var(--border)' }} className="hover-lift">
                    <td style={{ ...styles.td, fontWeight: 700 }}>{invoice.id}</td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 600 }}>{invoice.customer}</div>
                      <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '0.25rem' }}>{getValue(invoice, ['address'], '')}</div>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--text-muted)' }}>
                      {getValue(invoice, ['project', 'milestone', 'description'], 'Invoice')}
                      {invoice.sourceEstimateId || invoice.estimateId ? (
                        <div style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          From {invoice.sourceEstimateId || invoice.estimateId}
                        </div>
                      ) : null}
                    </td>
                    <td style={{ ...styles.td, fontWeight: 700 }}>{formatMoney(getTotal(invoice))}</td>
                    <td style={{ ...styles.td, fontWeight: 700, color: balance > 0 ? 'var(--danger)' : 'var(--success)' }}>{formatMoney(balance)}</td>
                    <td style={{ ...styles.td, color: 'var(--text-muted)' }}>{formatDate(invoice.dueDate)}</td>
                    <td style={styles.td}><StatusBadge status={status} /></td>
                    <td style={styles.td}>
                      <div style={styles.rowActions}>
                        {balance > 0 && (
                          <button className="btn btn-primary" style={{ padding: '0.45rem 0.75rem' }} onClick={() => openPaymentModal(invoice)}>
                            <CircleDollarSign size={14} /> Record
                          </button>
                        )}
                        <button style={styles.mutedButton} title="Send invoice" onClick={() => showToast(`${invoice.id} queued for delivery.`)}>
                          <Send size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {payments.length > 0 && (
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0 1.5rem 1rem' }}></td>
                      <td colSpan={7} style={{ padding: '0 1.5rem 1rem' }}>
                        <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Payment history</span>
                          {payments.map((payment, index) => (
                            <span key={`${invoice.id}-payment-${index}`} style={{ fontSize: '0.8125rem', color: 'var(--text-main)' }}>
                              {formatDate(payment.date)} · {formatMoney(payment.amount)} · {payment.method}{payment.reference ? ` · ${payment.reference}` : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {invoices.length === 0 && <EmptyRow colSpan={8} label="No invoices yet." />}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderBills = () => (
    <>
      <div style={styles.toolbar}>
        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Bills</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{formatMoney(derived.apDue)} due to vendors</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsBillOpen(true)}>
          <Plus size={18} /> New Bill
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <TableHeader columns={['Bill #', 'Vendor', 'Category', 'Total', 'Balance', 'Due Date', 'Status', 'Actions']} />
          <tbody>
            {bills.map((bill) => {
              const balance = getBillBalance(bill);
              const status = getBillStatus(bill);
              return (
                <tr key={bill.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-lift">
                  <td style={{ ...styles.td, fontWeight: 700 }}>{bill.id}</td>
                  <td style={styles.td}>{bill.vendor}</td>
                  <td style={{ ...styles.td, color: 'var(--text-muted)' }}>{bill.category}</td>
                  <td style={{ ...styles.td, fontWeight: 700 }}>{formatMoney(getTotal(bill))}</td>
                  <td style={{ ...styles.td, fontWeight: 700, color: balance > 0 ? 'var(--warning)' : 'var(--success)' }}>{formatMoney(balance)}</td>
                  <td style={{ ...styles.td, color: 'var(--text-muted)' }}>{formatDate(bill.dueDate)}</td>
                  <td style={styles.td}><StatusBadge status={status} /></td>
                  <td style={styles.td}>
                    {balance > 0 ? (
                      <button className="btn btn-primary" style={{ padding: '0.45rem 0.75rem' }} onClick={() => openBillPaymentModal(bill)}>
                        <CircleDollarSign size={14} /> Pay Bill
                      </button>
                    ) : (
                      <CheckCircle2 size={18} color="var(--success)" />
                    )}
                  </td>
                </tr>
              );
            })}
            {bills.length === 0 && <EmptyRow colSpan={8} label="No bills yet." />}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderPayroll = () => (
    <>
      <div style={styles.toolbar}>
        <div>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Payroll</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{payrollEmployees.length} employees in the current run</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input className="form-input" value={payrollPeriod} onChange={(event) => setPayrollPeriod(event.target.value)} style={{ width: '190px', padding: '0.6rem 0.8rem' }} />
          <button className="btn btn-primary" onClick={runPayroll}>
            <Plus size={18} /> Run Payroll
          </button>
        </div>
      </div>
      <div className="dashboard-grid" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ gridColumn: 'span 4' }}>
          <p style={styles.metricLabel}>Gross Pay</p>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{formatMoney(payrollPreview.gross)}</h3>
        </div>
        <div style={{ gridColumn: 'span 4' }}>
          <p style={styles.metricLabel}>Taxes</p>
          <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{formatMoney(payrollPreview.taxes)}</h3>
        </div>
        <div style={{ gridColumn: 'span 4' }}>
          <p style={styles.metricLabel}>Net Payroll</p>
          <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--success)' }}>{formatMoney(payrollPreview.net)}</h3>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <TableHeader columns={['Employee', 'Role', 'Pay Type', 'Hours', 'Rate', 'Gross', 'Net', 'Status']} />
          <tbody>
            {payrollEmployees.map((employee) => (
              <tr key={employee.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ ...styles.td, fontWeight: 700 }}>{employee.name}</td>
                <td style={{ ...styles.td, color: 'var(--text-muted)' }}>{employee.role}</td>
                <td style={styles.td}>{employee.payType}</td>
                <td style={styles.td}>{employee.hours}</td>
                <td style={styles.td}>{formatMoney(employee.hourlyRate)}</td>
                <td style={{ ...styles.td, fontWeight: 700 }}>{formatMoney(employee.gross)}</td>
                <td style={{ ...styles.td, fontWeight: 700 }}>{formatMoney(employee.net)}</td>
                <td style={styles.td}><StatusBadge status={employee.payrollStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Run History</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {payrollRuns.map((run) => (
            <div key={run.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{run.id} · {run.period}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>Run date {formatDate(run.runDate)}</div>
              </div>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700 }}>{formatMoney(run.net)} net</span>
                <StatusBadge status={run.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderAgingTable = (title, rows, type) => (
    <div className="card" style={{ gridColumn: 'span 6', padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {rows.map((row) => (
          <div key={row.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{type === 'ar' ? row.customer : row.vendor}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{row.id} · {daysPastDue(row.dueDate)} days past due</div>
            </div>
            <div style={{ fontWeight: 700 }}>{formatMoney(type === 'ar' ? getInvoiceBalance(row) : getBillBalance(row))}</div>
          </div>
        ))}
        {rows.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No past due items.</p>}
      </div>
    </div>
  );

  const renderReports = () => {
    const arAging = invoices.filter((invoice) => getInvoiceBalance(invoice) > 0 && daysPastDue(invoice.dueDate) > 0);
    const apAging = bills.filter((bill) => getBillBalance(bill) > 0 && daysPastDue(bill.dueDate) > 0);
    const collected = sum(invoices, paymentTotal);
    const payrollTotal = sum(payrollRuns, (run) => run.gross);

    return (
      <div style={{ padding: '1.5rem' }}>
        <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
          {renderAgingTable('A/R Aging', arAging, 'ar')}
          {renderAgingTable('A/P Aging', apAging, 'ap')}
        </div>
        <div className="dashboard-grid">
          <div className="card" style={{ gridColumn: 'span 3', padding: '1.5rem' }}>
            <p style={styles.metricLabel}>Collected</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--success)' }}>{formatMoney(collected)}</h3>
          </div>
          <div className="card" style={{ gridColumn: 'span 3', padding: '1.5rem' }}>
            <p style={styles.metricLabel}>Payroll</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{formatMoney(payrollTotal)}</h3>
          </div>
          <div className="card" style={{ gridColumn: 'span 6', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Simple P&L Snapshot</h3>
            {[
              ['Revenue', derived.recognizedRevenue],
              ['Vendor expenses', -derived.paidBills],
              ['Payroll expense', -derived.payrollExpense],
              ['Net profit', derived.profit],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0', borderTop: label === 'Net profit' ? '1px solid var(--border)' : 'none', fontWeight: label === 'Net profit' ? 700 : 500 }}>
                <span style={{ color: label === 'Net profit' ? 'var(--text-main)' : 'var(--text-muted)' }}>{label}</span>
                <span style={{ color: value < 0 ? 'var(--danger)' : 'var(--text-main)' }}>{formatMoney(value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderActiveTab = () => {
    if (activeTab === 'estimates') return renderEstimates();
    if (activeTab === 'invoices') return renderInvoices();
    if (activeTab === 'bills') return renderBills();
    if (activeTab === 'payroll') return renderPayroll();
    return renderReports();
  };

  return (
    <div className="animate-fade-in relative">
      {actionMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '50%',
          transform: 'translateX(50%)',
          backgroundColor: 'var(--text-main)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-float)',
          zIndex: 1000,
          animation: 'fadeInDown 0.3s ease-out',
        }}>
          {actionMessage}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Accounting Center</h1>
          <p className="page-subtitle">Manage estimates, receivables, payables, payroll, and month-end reporting.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsEstimateOpen(true)}>
          <Plus size={18} /> New Estimate
        </button>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <KpiCard title="A/R Outstanding" value={formatMoney(derived.arOutstanding)} subtext={`${invoices.length} invoices tracked`} icon={CircleDollarSign} type="danger" />
        <KpiCard title="A/P Due" value={formatMoney(derived.apDue)} subtext={`${bills.length} vendor bills open`} icon={Briefcase} type="warning" />
        <KpiCard title="Payroll Due" value={formatMoney(derived.payrollDue)} subtext={payrollPeriod} icon={Users} type="primary" />
        <KpiCard title="Collected This Month" value={formatMoney(derived.collectedThisMonth)} subtext="Cash received in current month" icon={TrendingUp} type="success" />
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={styles.toolbar}>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
            <TabButton id="estimates" activeTab={activeTab} onClick={setActiveTab} icon={FileText}>Estimates</TabButton>
            <TabButton id="invoices" activeTab={activeTab} onClick={setActiveTab} icon={CircleDollarSign}>Invoices</TabButton>
            <TabButton id="bills" activeTab={activeTab} onClick={setActiveTab} icon={Briefcase}>Bills</TabButton>
            <TabButton id="payroll" activeTab={activeTab} onClick={setActiveTab} icon={Users}>Payroll</TabButton>
            <TabButton id="reports" activeTab={activeTab} onClick={setActiveTab} icon={TrendingUp}>Reports</TabButton>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <Clock size={16} /> Live local state
          </div>
        </div>
        {renderActiveTab()}
      </div>

      <Modal
        isOpen={isEstimateOpen}
        onClose={() => setIsEstimateOpen(false)}
        title="Create New Estimate"
        footer={<><button className="btn btn-secondary" onClick={() => setIsEstimateOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={createEstimate}>Create Estimate</button></>}
      >
        <div style={styles.formGrid}>
          <Field label="Customer">
            <input className="form-input" value={estimateForm.customer} onChange={(event) => setEstimateForm({ ...estimateForm, customer: event.target.value })} />
          </Field>
          <Field label="Project">
            <input className="form-input" value={estimateForm.project} onChange={(event) => setEstimateForm({ ...estimateForm, project: event.target.value })} />
          </Field>
          <Field label="Amount">
            <input className="form-input" inputMode="decimal" value={estimateForm.amount} onChange={(event) => setEstimateForm({ ...estimateForm, amount: event.target.value })} />
          </Field>
          <Field label="Valid Until">
            <input className="form-input" type="date" value={estimateForm.validUntil} onChange={(event) => setEstimateForm({ ...estimateForm, validUntil: event.target.value })} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea className="form-input" rows="3" value={estimateForm.notes} onChange={(event) => setEstimateForm({ ...estimateForm, notes: event.target.value })} />
        </Field>
      </Modal>

      <Modal
        isOpen={!!paymentInvoice}
        onClose={() => setPaymentInvoice(null)}
        title={`Record Payment: ${paymentInvoice?.id}`}
        footer={<><button className="btn btn-secondary" onClick={() => setPaymentInvoice(null)}>Cancel</button><button className="btn btn-primary" onClick={recordInvoicePayment}>Record Payment</button></>}
      >
        {paymentInvoice && (
          <>
            <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Current Balance</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatMoney(getInvoiceBalance(paymentInvoice))}</div>
            </div>
            <div style={styles.formGrid}>
              <Field label="Payment Date">
                <input className="form-input" type="date" value={paymentForm.date} onChange={(event) => setPaymentForm({ ...paymentForm, date: event.target.value })} />
              </Field>
              <Field label="Amount">
                <input className="form-input" inputMode="decimal" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} />
              </Field>
              <Field label="Method">
                <select className="form-input" value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })}>
                  <option>ACH</option>
                  <option>Card</option>
                  <option>Check</option>
                  <option>Cash</option>
                </select>
              </Field>
              <Field label="Reference">
                <input className="form-input" value={paymentForm.reference} onChange={(event) => setPaymentForm({ ...paymentForm, reference: event.target.value })} />
              </Field>
            </div>
            <Field label="Notes">
              <textarea className="form-input" rows="3" value={paymentForm.notes} onChange={(event) => setPaymentForm({ ...paymentForm, notes: event.target.value })} />
            </Field>
          </>
        )}
      </Modal>

      <Modal
        isOpen={isBillOpen}
        onClose={() => setIsBillOpen(false)}
        title="New Vendor Bill"
        footer={<><button className="btn btn-secondary" onClick={() => setIsBillOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={createBill}>Save Bill</button></>}
      >
        <div style={styles.formGrid}>
          <Field label="Vendor">
            <input className="form-input" value={billForm.vendor} onChange={(event) => setBillForm({ ...billForm, vendor: event.target.value })} />
          </Field>
          <Field label="Category">
            <select className="form-input" value={billForm.category} onChange={(event) => setBillForm({ ...billForm, category: event.target.value })}>
              <option>Materials</option>
              <option>Permits</option>
              <option>Freight</option>
              <option>Subcontractor</option>
              <option>Overhead</option>
            </select>
          </Field>
          <Field label="Amount">
            <input className="form-input" inputMode="decimal" value={billForm.amount} onChange={(event) => setBillForm({ ...billForm, amount: event.target.value })} />
          </Field>
          <Field label="Bill Date">
            <input className="form-input" type="date" value={billForm.billDate} onChange={(event) => setBillForm({ ...billForm, billDate: event.target.value })} />
          </Field>
          <Field label="Due Date">
            <input className="form-input" type="date" value={billForm.dueDate} onChange={(event) => setBillForm({ ...billForm, dueDate: event.target.value })} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea className="form-input" rows="3" value={billForm.notes} onChange={(event) => setBillForm({ ...billForm, notes: event.target.value })} />
        </Field>
      </Modal>

      <Modal
        isOpen={!!payingBill}
        onClose={() => setPayingBill(null)}
        title={`Pay Bill: ${payingBill?.id}`}
        footer={<><button className="btn btn-secondary" onClick={() => setPayingBill(null)}>Cancel</button><button className="btn btn-primary" onClick={payBill}>Pay Bill</button></>}
      >
        {payingBill && (
          <>
            <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Balance Due</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{formatMoney(getBillBalance(payingBill))}</div>
            </div>
            <div style={styles.formGrid}>
              <Field label="Payment Date">
                <input className="form-input" type="date" value={paymentForm.date} onChange={(event) => setPaymentForm({ ...paymentForm, date: event.target.value })} />
              </Field>
              <Field label="Amount">
                <input className="form-input" inputMode="decimal" value={paymentForm.amount} onChange={(event) => setPaymentForm({ ...paymentForm, amount: event.target.value })} />
              </Field>
              <Field label="Method">
                <select className="form-input" value={paymentForm.method} onChange={(event) => setPaymentForm({ ...paymentForm, method: event.target.value })}>
                  <option>ACH</option>
                  <option>Card</option>
                  <option>Check</option>
                  <option>Cash</option>
                </select>
              </Field>
              <Field label="Reference">
                <input className="form-input" value={paymentForm.reference} onChange={(event) => setPaymentForm({ ...paymentForm, reference: event.target.value })} />
              </Field>
            </div>
            <Field label="Notes">
              <textarea className="form-input" rows="3" value={paymentForm.notes} onChange={(event) => setPaymentForm({ ...paymentForm, notes: event.target.value })} />
            </Field>
          </>
        )}
      </Modal>
    </div>
  );
}
