export const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export const roundMoney = (value) =>
  Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

export const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(toNumber(value));

export const formatDate = (value) => {
  if (!value) return 'Not set';
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const sumPayments = (payments = []) =>
  roundMoney(payments.reduce((total, payment) => total + toNumber(payment.amount), 0));

export const documentBalance = (amount, payments = []) =>
  roundMoney(Math.max(toNumber(amount) - sumPayments(payments), 0));

export const documentStatus = ({ amount, payments = [], dueDate }) => {
  const balance = documentBalance(amount, payments);
  if (balance <= 0) return 'Paid';
  if (sumPayments(payments) > 0) return 'Partial';
  if (dueDate && new Date(`${dueDate}T12:00:00`) < new Date()) return 'Overdue';
  return 'Open';
};

export const estimateTotal = (estimate) =>
  roundMoney((estimate.items || []).reduce((total, item) => total + toNumber(item.quantity) * toNumber(item.rate), 0));

export const calculateCommission = (commission) => {
  const due = roundMoney(toNumber(commission.contractAmount) * toNumber(commission.commissionRate));
  const paid = sumPayments(commission.payments);
  return {
    due,
    paid,
    balance: roundMoney(Math.max(due - paid, 0)),
  };
};

export const calculatePayrollEntryCost = (entry) =>
  roundMoney(toNumber(entry.hours) * toNumber(entry.hourlyRate));

export const payrollCostByJob = (payrollEntries = []) =>
  payrollEntries.reduce((totals, entry) => {
    if (!entry.jobId) return totals;
    totals[entry.jobId] = roundMoney((totals[entry.jobId] || 0) + calculatePayrollEntryCost(entry));
    return totals;
  }, {});

export const calculateJobPnl = ({ job, invoices = [], bills = [], payrollEntries = [] }) => {
  if (!job) {
    return {
      invoicedRevenue: 0,
      collectedRevenue: 0,
      billCosts: 0,
      laborCost: 0,
      totalCosts: 0,
      grossProfit: 0,
      margin: 0,
    };
  }

  const jobInvoices = invoices.filter((invoice) => invoice.jobId === job.id);
  const jobBills = bills.filter((bill) => bill.jobId === job.id);
  const jobPayrollEntries = payrollEntries.filter((entry) => entry.jobId === job.id);

  const invoicedRevenue = roundMoney(jobInvoices.reduce((total, invoice) => total + toNumber(invoice.amount), 0));
  const collectedRevenue = roundMoney(jobInvoices.reduce((total, invoice) => total + sumPayments(invoice.payments), 0));
  const billCosts = roundMoney(jobBills.reduce((total, bill) => total + toNumber(bill.amount), 0));
  const laborCost = roundMoney(jobPayrollEntries.reduce((total, entry) => total + calculatePayrollEntryCost(entry), 0));
  const totalCosts = roundMoney(billCosts + laborCost);
  const grossProfit = roundMoney(invoicedRevenue - totalCosts);
  const margin = invoicedRevenue > 0 ? roundMoney((grossProfit / invoicedRevenue) * 100) : 0;

  return {
    invoicedRevenue,
    collectedRevenue,
    billCosts,
    laborCost,
    totalCosts,
    grossProfit,
    margin,
  };
};

export const calculateSalesUseTax = (report) => {
  const totalSubtractions = roundMoney(
    toNumber(report.exemptSales) +
    toNumber(report.exemptProperty) +
    toNumber(report.returnsAllowancesBadDebts) +
    toNumber(report.otherSubtractions)
  );
  const taxableSales = roundMoney(toNumber(report.totalSales) - totalSubtractions);
  const stateSalesTax = roundMoney(taxableSales * toNumber(report.stateTaxRate));
  const countySalesTax = roundMoney(taxableSales * toNumber(report.countyTaxRate));
  const stateUseTax = roundMoney(toNumber(report.purchasesSubjectToUseTax) * toNumber(report.stateTaxRate));
  const countyUseTax = roundMoney(toNumber(report.purchasesSubjectToUseTax) * toNumber(report.countyTaxRate));
  const totalSalesTax = roundMoney(stateSalesTax + countySalesTax);
  const totalUseTax = roundMoney(stateUseTax + countyUseTax);
  const netSalesTax = roundMoney(totalSalesTax - toNumber(report.estimatedDiscount));
  const totalAmountDue = roundMoney(netSalesTax + totalUseTax);

  return {
    totalSubtractions,
    taxableSales,
    stateSalesTax,
    countySalesTax,
    stateUseTax,
    countyUseTax,
    totalSalesTax,
    totalUseTax,
    netSalesTax,
    totalAmountDue,
  };
};
