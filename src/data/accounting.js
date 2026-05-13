const REPORT_DATE = new Date('2026-05-13T12:00:00');

const toDate = (value) => new Date(`${value}T12:00:00`);

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

export const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const sumPayments = (payments = []) =>
  roundMoney(payments.reduce((total, payment) => total + (Number(payment.amount) || 0), 0));

export const invoiceBalance = (invoice) =>
  roundMoney(Math.max((Number(invoice?.amount) || 0) - sumPayments(invoice?.payments), 0));

export const invoiceStatus = (invoice) => {
  const balance = invoiceBalance(invoice);
  const paid = sumPayments(invoice?.payments);

  if (balance <= 0) return 'Paid';
  if (paid > 0) return 'Partial';
  if (invoice?.dueDate && toDate(invoice.dueDate) < REPORT_DATE) return 'Overdue';
  return 'Unpaid';
};

export const billBalance = (bill) =>
  roundMoney(Math.max((Number(bill?.amount) || 0) - sumPayments(bill?.payments), 0));

export const billStatus = (bill) => {
  const balance = billBalance(bill);
  const paid = sumPayments(bill?.payments);

  if (balance <= 0) return 'Paid';
  if (paid > 0) return 'Partial';
  if (bill?.dueDate && toDate(bill.dueDate) < REPORT_DATE) return 'Past Due';
  return 'Open';
};

export const accountingSummary = ({
  invoices = [],
  bills = [],
  payrollRuns = [],
  payrollEmployees = [],
} = {}) => {
  const month = REPORT_DATE.getMonth();
  const year = REPORT_DATE.getFullYear();

  const arOutstanding = roundMoney(invoices.reduce((total, invoice) => total + invoiceBalance(invoice), 0));
  const apDue = roundMoney(bills.reduce((total, bill) => total + billBalance(bill), 0));
  const payrollDue = roundMoney(
    payrollEmployees
      .filter((employee) => employee.payrollStatus === 'Due' || employee.payrollStatus === 'Pending setup')
      .reduce((total, employee) => total + (Number(employee.weeklyGross) || 0), 0)
  );

  const collectedThisMonth = roundMoney(
    invoices.reduce((total, invoice) => {
      return total + (invoice.payments || []).reduce((paymentTotal, payment) => {
        const paidDate = toDate(payment.date);
        const isThisMonth = paidDate.getMonth() === month && paidDate.getFullYear() === year;
        return paymentTotal + (isThisMonth ? Number(payment.amount) || 0 : 0);
      }, 0);
    }, 0)
  );

  const agingBuckets = invoices.reduce(
    (buckets, invoice) => {
      const balance = invoiceBalance(invoice);
      if (balance <= 0) return buckets;

      const dueDate = toDate(invoice.dueDate);
      const daysPastDue = Math.floor((REPORT_DATE - dueDate) / 86400000);

      if (daysPastDue <= 0) buckets.current += balance;
      else if (daysPastDue <= 30) buckets.days1To30 += balance;
      else if (daysPastDue <= 60) buckets.days31To60 += balance;
      else if (daysPastDue <= 90) buckets.days61To90 += balance;
      else buckets.days90Plus += balance;

      return buckets;
    },
    { current: 0, days1To30: 0, days31To60: 0, days61To90: 0, days90Plus: 0 }
  );

  const billedRevenue = roundMoney(invoices.reduce((total, invoice) => total + (Number(invoice.amount) || 0), 0));
  const vendorCosts = roundMoney(bills.reduce((total, bill) => total + (Number(bill.amount) || 0), 0));
  const payrollGross = roundMoney(payrollRuns.reduce((total, run) => total + (Number(run.grossPay) || 0), 0));
  const employerTaxes = roundMoney(payrollRuns.reduce((total, run) => total + (Number(run.employerTaxes) || 0), 0));
  const payrollExpense = roundMoney(payrollGross + employerTaxes);
  const grossProfit = roundMoney(billedRevenue - vendorCosts);
  const netIncome = roundMoney(grossProfit - payrollExpense);

  return {
    asOf: REPORT_DATE.toISOString().slice(0, 10),
    arOutstanding,
    apDue,
    payrollDue,
    collectedThisMonth,
    agingBuckets: Object.fromEntries(
      Object.entries(agingBuckets).map(([bucket, amount]) => [bucket, roundMoney(amount)])
    ),
    pnlSnapshot: {
      billedRevenue,
      collectedRevenue: sumPayments(invoices.flatMap((invoice) => invoice.payments || [])),
      vendorCosts,
      payrollExpense,
      grossProfit,
      netIncome,
    },
  };
};

export const seedEstimates = [
  {
    id: 'EST-1186',
    jobId: '4492',
    customer: 'Pam Beesly',
    address: '492 Artist Way, Scranton, PA',
    projectType: 'Three-season sunroom',
    status: 'Converted',
    issuedDate: '2026-03-14',
    expiresDate: '2026-04-13',
    contractId: 'CON-4492',
    convertedInvoiceId: 'INV-2041',
    amount: 18450,
    depositRequired: 4612.5,
  },
  {
    id: 'EST-1187',
    jobId: '4493',
    customer: 'Dwight Schrute',
    address: '101 Farm Rd, Honesdale, PA',
    projectType: 'Casement window package',
    status: 'Contract signed',
    issuedDate: '2026-03-22',
    expiresDate: '2026-04-21',
    contractId: 'CON-4493',
    convertedInvoiceId: 'INV-2042',
    amount: 12800,
    depositRequired: 3200,
  },
  {
    id: 'EST-1188',
    jobId: '4494',
    customer: 'Jim Halpert',
    address: '87 Paper St, Scranton, PA',
    projectType: 'Patio enclosure',
    status: 'Converted',
    issuedDate: '2026-02-26',
    expiresDate: '2026-03-28',
    contractId: 'CON-4494',
    convertedInvoiceId: 'INV-2043',
    amount: 24600,
    depositRequired: 6150,
  },
  {
    id: 'EST-1189',
    jobId: '4497',
    customer: 'Phyllis Vance',
    address: '63 Garden Terrace, Scranton, PA',
    projectType: 'Solarium glass replacement',
    status: 'Estimate sent',
    issuedDate: '2026-05-02',
    expiresDate: '2026-06-01',
    contractId: null,
    convertedInvoiceId: null,
    amount: 9400,
    depositRequired: 2350,
  },
];

export const seedInvoices = [
  {
    id: 'INV-2041',
    estimateId: 'EST-1186',
    contractId: 'CON-4492',
    jobId: '4492',
    customer: 'Pam Beesly',
    address: '492 Artist Way, Scranton, PA',
    milestone: 'Contract deposit',
    issueDate: '2026-04-02',
    dueDate: '2026-04-17',
    amount: 4612.5,
    payments: [
      {
        id: 'PAY-9011',
        date: '2026-04-08',
        method: 'ACH',
        reference: 'ACH-8842',
        amount: 2500,
        notes: 'Initial deposit from signed sunroom contract.',
      },
    ],
  },
  {
    id: 'INV-2042',
    estimateId: 'EST-1187',
    contractId: 'CON-4493',
    jobId: '4493',
    customer: 'Dwight Schrute',
    address: '101 Farm Rd, Honesdale, PA',
    milestone: 'Factory order release',
    issueDate: '2026-04-18',
    dueDate: '2026-05-18',
    amount: 6400,
    payments: [],
  },
  {
    id: 'INV-2043',
    estimateId: 'EST-1188',
    contractId: 'CON-4494',
    jobId: '4494',
    customer: 'Jim Halpert',
    address: '87 Paper St, Scranton, PA',
    milestone: 'Final completion',
    issueDate: '2026-03-25',
    dueDate: '2026-04-24',
    amount: 8200,
    payments: [
      {
        id: 'PAY-9012',
        date: '2026-05-03',
        method: 'Credit card',
        reference: 'VISA-4402',
        amount: 4100,
        notes: 'Partial final payment after punch list walk-through.',
      },
    ],
  },
  {
    id: 'INV-2044',
    estimateId: 'EST-1185',
    contractId: 'CON-4488',
    jobId: '4488',
    customer: 'Stanley Hudson',
    address: '88 Pretzel St, Scranton, PA',
    milestone: 'Awning installation closeout',
    issueDate: '2026-04-28',
    dueDate: '2026-05-12',
    amount: 1500,
    payments: [
      {
        id: 'PAY-9013',
        date: '2026-05-10',
        method: 'Check',
        reference: 'CHK-1538',
        amount: 1500,
        notes: 'Paid at final inspection.',
      },
    ],
  },
];

export const seedBills = [
  {
    id: 'BILL-7331',
    vendor: 'Keystone Glass & Aluminum',
    jobId: '4492',
    category: 'Materials',
    description: 'Low-E insulated sunroom glass package',
    billDate: '2026-04-20',
    dueDate: '2026-05-20',
    amount: 6125,
    payments: [],
  },
  {
    id: 'BILL-7332',
    vendor: 'Scranton Permit Services',
    jobId: '4492',
    category: 'Permits',
    description: 'Permit filing and municipal review fees',
    billDate: '2026-04-03',
    dueDate: '2026-04-18',
    amount: 875,
    payments: [
      {
        id: 'VPAY-4110',
        date: '2026-04-17',
        method: 'ACH',
        reference: 'ACH-6618',
        amount: 875,
        notes: 'Paid before permit release.',
      },
    ],
  },
  {
    id: 'BILL-7333',
    vendor: 'Northeast Install Crew',
    jobId: '4494',
    category: 'Subcontract labor',
    description: 'Patio enclosure installation labor',
    billDate: '2026-04-26',
    dueDate: '2026-05-06',
    amount: 3200,
    payments: [
      {
        id: 'VPAY-4111',
        date: '2026-05-07',
        method: 'Check',
        reference: 'CHK-6022',
        amount: 1600,
        notes: 'Half paid pending final caulk repair.',
      },
    ],
  },
  {
    id: 'BILL-7334',
    vendor: 'BrightWay Marketing',
    jobId: null,
    category: 'Sales and marketing',
    description: 'May local search ads and landing page maintenance',
    billDate: '2026-05-01',
    dueDate: '2026-05-31',
    amount: 980,
    payments: [],
  },
];

export const seedPayrollEmployees = [
  {
    id: 'EMP-1007',
    name: 'Carlos Rivera',
    role: 'Lead installer',
    department: 'Field operations',
    status: 'Active',
    payrollStatus: 'Due',
    weeklyGross: 1425,
    nextPayDate: '2026-05-15',
    ytdGross: 25650,
  },
  {
    id: 'EMP-1011',
    name: 'Nina Patel',
    role: 'Project coordinator',
    department: 'Operations',
    status: 'Active',
    payrollStatus: 'Current',
    weeklyGross: 1180,
    nextPayDate: '2026-05-15',
    ytdGross: 21240,
  },
  {
    id: 'EMP-1014',
    name: 'Marcus Lee',
    role: 'Apprentice installer',
    department: 'Field operations',
    status: 'Pending',
    payrollStatus: 'Pending setup',
    weeklyGross: 860,
    nextPayDate: '2026-05-22',
    ytdGross: 0,
  },
  {
    id: 'EMP-1015',
    name: 'Erin Hannon',
    role: 'Accounting assistant',
    department: 'Finance',
    status: 'Active',
    payrollStatus: 'Due',
    weeklyGross: 975,
    nextPayDate: '2026-05-15',
    ytdGross: 17550,
  },
];

export const seedPayrollRuns = [
  {
    id: 'PR-2026-08',
    periodStart: '2026-04-13',
    periodEnd: '2026-04-26',
    checkDate: '2026-05-01',
    status: 'Paid',
    employeeCount: 3,
    grossPay: 7160,
    employeeTaxes: 1360.4,
    employerTaxes: 547.74,
    netPay: 5799.6,
  },
  {
    id: 'PR-2026-09',
    periodStart: '2026-04-27',
    periodEnd: '2026-05-10',
    checkDate: '2026-05-15',
    status: 'Scheduled',
    employeeCount: 3,
    grossPay: 7160,
    employeeTaxes: 1360.4,
    employerTaxes: 547.74,
    netPay: 5799.6,
  },
  {
    id: 'PR-2026-10',
    periodStart: '2026-05-11',
    periodEnd: '2026-05-24',
    checkDate: '2026-05-29',
    status: 'Draft',
    employeeCount: 4,
    grossPay: 8880,
    employeeTaxes: 1687.2,
    employerTaxes: 679.32,
    netPay: 7192.8,
  },
];
