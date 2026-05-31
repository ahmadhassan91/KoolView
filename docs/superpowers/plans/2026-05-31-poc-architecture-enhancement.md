# Kool View POC Architecture Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the current Kool View React POC into a job-centered operational prototype that reflects Dorothy's shared files: contracts/jobs, production list, estimates, invoices, payment recording, bills, payroll/job hours, commissions, sales/use tax, job P&L, and FileCenter-style documents.

**Architecture:** Keep this as a frontend-only POC, but organize it like the real system: one shared Job/Contract data model feeds all pages. Add a lightweight React context for shared seed data and workflow actions so Jobs, Accounting, Documents, and Dashboard tell the same story.

**Tech Stack:** React 19, Vite 8, React Router 7, lucide-react, local React state/context, existing CSS variables and card/table/modal patterns.

---

## Existing POC Baseline

The current app is a Vite React frontend with no backend persistence. Important files:

- `src/App.jsx` - shell layout, sidebar routes, top search/header.
- `src/pages/Dashboard.jsx` - static dashboard cards, recent activity, appointments.
- `src/pages/Leads.jsx` - lead pipeline/scheduling POC.
- `src/pages/Customers.jsx` - customer CRM POC.
- `src/pages/Jobs.jsx` - internal jobs table and job detail modal.
- `src/pages/FieldOps.jsx` - field operations board.
- `src/pages/Documents.jsx` - FileCenter-style document list by property.
- `src/pages/Billing.jsx` - current Accounting Center POC with estimates, invoices, bills, payroll, reports.
- `src/data/accounting.js` - accounting seed data and finance helpers.
- `src/components/Modal.jsx` - reusable modal.
- `src/index.css` and `src/App.css` - global styles and responsive shell.

The current POC already has an Accounting nav label and accounting flows. The enhancement should make the whole POC coherent around Kool View's actual workflow and files instead of isolated page demos.

---

## Target User Story

Dorothy should be able to tell this story in the POC:

1. A lead/customer becomes a job/contract.
2. The job appears in the production list.
3. The job has an estimate with milestone billing lines.
4. The estimate converts into one or more invoices.
5. Payments are recorded with method, date, amount, reference, and notes.
6. Vendor bills and payroll/job hours attach to the job.
7. Commissions are calculated/tracked from the contract.
8. The system can show sales reports, sales/use tax, and job P&L.
9. Documents are organized by current job/customer and searchable later by address/category.
10. The dashboard shows the same active jobs, receivables, permits, and next actions.

---

## Data Model

Create one shared seed/state layer instead of each page inventing separate sample data.

### Core Entities

Use these shapes in `src/data/koolViewSeed.js`:

```js
export const seedCustomers = [
  {
    id: 'CUST-1001',
    name: 'Sample Sunroom Customer',
    phone: '(608) 555-0101',
    email: 'customer@example.com',
    address: '123 Sample Street',
    city: 'Madison',
    status: 'Active',
  },
];

export const seedJobs = [
  {
    id: 'JOB-240136',
    customerId: 'CUST-1001',
    customerName: 'Sample Sunroom Customer',
    phone: '(608) 555-0101',
    projectType: 'Transition Living Space',
    contractDate: '2026-05-04',
    address: '123 Sample Street',
    city: 'Madison',
    status: 'Factory Order Confirmation',
    productionStage: 'FOC',
    contractAmount: 62420,
    changeOrders: 0,
    changeOrderDate: null,
    salesperson: 'C',
    busyBusyProject: 'Sample Sunroom Customer',
    documentFolder: 'Active/Rooms/Sample Sunroom Customer/JOB-240136',
  },
];

export const seedEstimateItems = [
  {
    id: 'ESTITEM-1',
    estimateId: 'EST-1001',
    itemCode: '1000 - DP SR',
    description: 'Down Payment on Sunroom Contract for $62,420.00',
    quantity: 1,
    rate: 12484,
    taxable: false,
  },
];
```

### Workflow Relationships

Use these IDs consistently:

- `jobs.customerId -> customers.id`
- `estimates.jobId -> jobs.id`
- `invoices.jobId -> jobs.id`
- `payments.invoiceId -> invoices.id`
- `bills.jobId -> jobs.id`
- `payrollEntries.jobId -> jobs.id`
- `commissions.jobId -> jobs.id`
- `documents.jobId -> jobs.id`
- `salesTaxReports.sourceInvoiceIds -> invoices.id[]`

---

## File Structure

### Create

- `src/data/koolViewSeed.js` - shared seed data for customers, leads, jobs, estimates, invoices, payments, bills, payroll entries, commissions, documents, sales reports, and tax report.
- `src/state/KoolViewDataContext.jsx` - React context and reducer-like actions for the POC.
- `src/utils/koolViewCalculations.js` - pure helpers for balances, job P&L, commissions, sales report totals, sales/use tax totals.
- `src/components/KpiCard.jsx` - shared KPI card extracted from page-local versions.
- `src/components/StatusBadge.jsx` - shared status badge mapping.
- `src/components/EmptyState.jsx` - shared empty table/card state.
- `src/components/SectionToolbar.jsx` - shared table header/action toolbar.

### Modify

- `src/App.jsx` - wrap routes with `KoolViewDataProvider`; optionally rename Jobs nav to `Jobs & Contracts`.
- `src/pages/Dashboard.jsx` - consume shared state and show job/accounting KPIs from the same data.
- `src/pages/Jobs.jsx` - become the Job/Contract Hub with production list, checklist, and job detail tabs.
- `src/pages/Billing.jsx` - consume shared state/actions; add Commission, Payroll Import, Sales & Use Tax, and Job P&L views.
- `src/pages/Documents.jsx` - use shared job/document data and show FileCenter current/past structure.
- `src/pages/Customers.jsx` - use shared customers/jobs where low-risk.
- `src/pages/Leads.jsx` - keep current POC, but add "Convert to Job" demo action if feasible.
- `src/index.css` and `src/App.css` - add reusable table/detail/layout classes if existing inline styles become too crowded.

### Do Not Modify Unless Needed

- `src/components/Modal.jsx` - only touch if modal overflow/responsiveness breaks.
- `src/pages/FieldOps.jsx` - only align labels/statuses; do not expand field ops in this enhancement pass.

---

## Task 0: Baseline Verification

**Files:**
- Read only: `package.json`, `src/App.jsx`, `src/pages/Billing.jsx`, `src/pages/Jobs.jsx`, `src/pages/Documents.jsx`

- [ ] **Step 1: Run the current build**

Run:

```bash
npm run build
```

Expected:

```text
vite build succeeds
```

- [ ] **Step 2: Run lint to capture existing failures**

Run:

```bash
npm run lint
```

Expected:

```text
Lint may fail on pre-existing issues in Dashboard.jsx, FieldOps.jsx, or Jobs.jsx. Record exact failures before editing.
```

- [ ] **Step 3: Start dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected:

```text
Vite dev server starts, usually at http://127.0.0.1:5173/
```

- [ ] **Step 4: Browser smoke check**

Open:

```text
http://127.0.0.1:5173/
http://127.0.0.1:5173/jobs
http://127.0.0.1:5173/billing
http://127.0.0.1:5173/documents
```

Expected:

```text
All pages render before enhancement work begins.
```

---

## Task 1: Shared Kool View Seed Data

**Files:**
- Create: `src/data/koolViewSeed.js`
- Modify: none

- [ ] **Step 1: Create shared seed module**

Create `src/data/koolViewSeed.js` with anonymized Kool View-style data. Use real workflow categories from Dorothy's files, but avoid copying sensitive names/phone numbers from the attachments.

Required exports:

```js
export const seedCustomers = [];
export const seedLeads = [];
export const seedJobs = [];
export const seedEstimates = [];
export const seedInvoices = [];
export const seedBills = [];
export const seedPayrollEntries = [];
export const seedCommissions = [];
export const seedDocuments = [];
export const seedSalesCategories = [];
export const seedSalesTaxReport = {};
```

- [ ] **Step 2: Populate `seedCustomers`**

Include 5-7 mock customers with fields:

```js
{
  id: 'CUST-1001',
  name: 'Sample Sunroom Customer',
  phone: '(608) 555-0101',
  email: 'customer@example.com',
  address: '123 Sample Street',
  city: 'Madison',
  status: 'Active',
}
```

- [ ] **Step 3: Populate `seedJobs` using Production List fields**

Include 8-12 jobs using fields from `Production List.xlsx`:

```js
{
  id: 'JOB-240136',
  customerId: 'CUST-1001',
  customerName: 'Sample Sunroom Customer',
  phone: '(608) 555-0101',
  projectType: 'Transition Living Space',
  contractDate: '2026-05-04',
  address: '123 Sample Street',
  city: 'Madison',
  status: 'Factory Order Confirmation',
  productionStage: 'FOC',
  contractAmount: 62420,
  changeOrders: 0,
  changeOrderDate: null,
  salesperson: 'C',
  busyBusyProject: 'Sample Sunroom Customer',
  documentFolder: 'Active/Rooms/Sample Sunroom Customer/JOB-240136',
}
```

Use these `productionStage` values because they match Dorothy's list:

```js
'DP'
'FOC'
'RD'
'C'
```

- [ ] **Step 4: Populate estimates with milestone line items**

Each estimate should support the QuickBooks-style milestone structure:

```js
{
  id: 'EST-1001',
  jobId: 'JOB-240136',
  customerId: 'CUST-1001',
  estimateNumber: 'Testing',
  date: '2026-05-18',
  status: 'Approved',
  projectAccountRep: 'C',
  taxRate: 0.055,
  items: [
    {
      id: 'ESTITEM-1',
      itemCode: '1000 - DP SR',
      description: 'Down Payment on Sunroom Contract for $62,420.00',
      quantity: 1,
      rate: 12484,
      taxable: false,
    }
  ],
}
```

Include milestone labels:

```js
'Down Payment'
'Factory Order Confirmation'
'Foundation/Floor Completion/Enclosure'
'Room Delivery'
'Major Completion'
'Change Order'
'Work not covered by contract'
```

- [ ] **Step 5: Populate invoices and payments**

Each invoice should connect to job and estimate:

```js
{
  id: 'INV-1001',
  invoiceNumber: '03113010',
  jobId: 'JOB-240136',
  estimateId: 'EST-1001',
  milestone: 'Down Payment',
  issueDate: '2026-05-18',
  dueDate: '2026-06-01',
  amount: 12484,
  taxAmount: 0,
  payments: [
    {
      id: 'PAY-1001',
      date: '2026-05-20',
      amount: 5000,
      method: 'ACH',
      reference: 'ACH-1001',
      notes: 'Partial payment',
    }
  ],
}
```

- [ ] **Step 6: Populate bills**

Use job-related cost categories:

```js
'Materials'
'Permits'
'Subcontractor'
'Freight'
'Insurance'
'Utilities'
'Office'
```

Each bill:

```js
{
  id: 'BILL-1001',
  vendor: 'Sample Vendor',
  jobId: 'JOB-240136',
  category: 'Materials',
  description: 'Sunroom materials package',
  billDate: '2026-05-10',
  dueDate: '2026-05-30',
  amount: 8200,
  payments: [],
}
```

- [ ] **Step 7: Populate payroll entries from BusyBusy-style export**

Use the shared shape:

```js
{
  id: 'TIME-1001',
  date: '2026-05-12',
  employeeFirstName: 'Sample',
  employeeLastName: 'Installer',
  employeeName: 'Sample Installer',
  hours: 5.27,
  project: 'Sample Sunroom Customer',
  jobId: 'JOB-240136',
  hourlyRate: 32,
  laborCategory: 'Field Labor',
}
```

Include non-job categories:

```js
'1 - SHOP'
'2 - SERVICE'
'3 - Training'
'4 - Office'
```

- [ ] **Step 8: Populate commissions**

Use `Commission.xlsx` structure:

```js
{
  id: 'COMM-1001',
  jobId: 'JOB-240136',
  customerName: 'Sample Sunroom Customer',
  salesperson: 'C',
  contractDate: '2026-05-04',
  contractAmount: 62420,
  commissionRate: 0.1,
  payments: [
    { id: 'COMMPAY-1', date: '2026-05-08', amount: 2500 }
  ],
  notes: '',
}
```

- [ ] **Step 9: Populate documents**

Use FileCenter-inspired fields:

```js
{
  id: 'DOC-1001',
  jobId: 'JOB-240136',
  customerId: 'CUST-1001',
  name: 'Signed_Contract.pdf',
  type: 'pdf',
  size: '1.1 MB',
  status: 'Current',
  category: 'Rooms',
  lookupAddress: '123 Sample Street',
  folderPath: 'Active/Rooms/Sample Sunroom Customer/JOB-240136',
  addedBy: 'Dorothy',
  addedDate: '2026-05-18',
}
```

- [ ] **Step 10: Populate sales categories and tax report**

Use sales categories from `2026 Sales Report.xlsx`:

```js
export const seedSalesCategories = [
  'Room Sales',
  'Change Orders',
  'Awning Sales',
  'Deck Sales',
  'Contractor Sales',
  'Service',
  'Parts',
  'Surcharge Fees',
  'Finance Charges',
];
```

Use sales/use tax fields from `Sales & Use.xlsx`:

```js
export const seedSalesTaxReport = {
  month: '2026-01',
  totalSales: 181234.29,
  exemptSales: 0,
  exemptProperty: 163230.14,
  returnsAllowancesBadDebts: 0,
  otherSubtractions: 990.09,
  purchasesSubjectToUseTax: 29829.99,
  stateTaxRate: 0.05,
  countyTaxRate: 0.005,
  estimatedDiscount: 10,
};
```

- [ ] **Step 11: Verify import compiles**

Temporarily run:

```bash
npm run build
```

Expected:

```text
Build succeeds. The new seed file is not imported yet, so it should not affect UI.
```

- [ ] **Step 12: Commit**

Run:

```bash
git add src/data/koolViewSeed.js
git commit -m "feat: add kool view seed data"
```

---

## Task 2: Calculation Helpers

**Files:**
- Create: `src/utils/koolViewCalculations.js`
- Test manually through build and later UI checks.

- [ ] **Step 1: Create currency and number helpers**

Add:

```js
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
```

- [ ] **Step 2: Add invoice/bill payment helpers**

Add:

```js
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
```

- [ ] **Step 3: Add commission helper**

Add:

```js
export const calculateCommission = (commission) => {
  const due = roundMoney(toNumber(commission.contractAmount) * toNumber(commission.commissionRate));
  const paid = sumPayments(commission.payments);
  return {
    due,
    paid,
    balance: roundMoney(Math.max(due - paid, 0)),
  };
};
```

- [ ] **Step 4: Add payroll/job labor helper**

Add:

```js
export const calculatePayrollEntryCost = (entry) =>
  roundMoney(toNumber(entry.hours) * toNumber(entry.hourlyRate));

export const payrollCostByJob = (payrollEntries = []) =>
  payrollEntries.reduce((totals, entry) => {
    if (!entry.jobId) return totals;
    totals[entry.jobId] = roundMoney((totals[entry.jobId] || 0) + calculatePayrollEntryCost(entry));
    return totals;
  }, {});
```

- [ ] **Step 5: Add job P&L helper**

Add:

```js
export const calculateJobPnl = ({ job, invoices = [], bills = [], payrollEntries = [] }) => {
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
```

- [ ] **Step 6: Add sales/use tax helper**

Add:

```js
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
```

- [ ] **Step 7: Verify helper exports compile**

Run:

```bash
npm run build
```

Expected:

```text
Build succeeds.
```

- [ ] **Step 8: Commit**

Run:

```bash
git add src/utils/koolViewCalculations.js
git commit -m "feat: add kool view calculation helpers"
```

---

## Task 3: Shared State Provider

**Files:**
- Create: `src/state/KoolViewDataContext.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create context file**

Add `src/state/KoolViewDataContext.jsx`:

```jsx
import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  seedBills,
  seedCommissions,
  seedCustomers,
  seedDocuments,
  seedEstimates,
  seedInvoices,
  seedJobs,
  seedLeads,
  seedPayrollEntries,
  seedSalesCategories,
  seedSalesTaxReport,
} from '../data/koolViewSeed';
import { documentBalance, roundMoney, toNumber } from '../utils/koolViewCalculations';

const KoolViewDataContext = createContext(null);

const todayInput = () => new Date().toISOString().slice(0, 10);

const nextId = (prefix, records) => {
  const max = records.reduce((highest, record) => {
    const numeric = Number(String(record.id || '').replace(/\\D/g, ''));
    return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
  }, 0);
  return `${prefix}-${max + 1}`;
};

export function KoolViewDataProvider({ children }) {
  const [customers, setCustomers] = useState(seedCustomers);
  const [leads, setLeads] = useState(seedLeads);
  const [jobs, setJobs] = useState(seedJobs);
  const [estimates, setEstimates] = useState(seedEstimates);
  const [invoices, setInvoices] = useState(seedInvoices);
  const [bills, setBills] = useState(seedBills);
  const [payrollEntries, setPayrollEntries] = useState(seedPayrollEntries);
  const [commissions, setCommissions] = useState(seedCommissions);
  const [documents, setDocuments] = useState(seedDocuments);
  const [salesTaxReport, setSalesTaxReport] = useState(seedSalesTaxReport);

  const addJob = (jobInput) => {
    const id = nextId('JOB', jobs);
    const job = {
      id,
      status: 'Deposit Billed',
      productionStage: 'DP',
      changeOrders: 0,
      changeOrderDate: null,
      ...jobInput,
    };
    setJobs((current) => [job, ...current]);
    return job;
  };

  const updateJob = (jobId, updates) => {
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, ...updates } : job)));
  };

  const approveEstimate = (estimateId) => {
    setEstimates((current) => current.map((estimate) => (
      estimate.id === estimateId ? { ...estimate, status: 'Approved' } : estimate
    )));
  };

  const convertEstimateToInvoice = (estimateId) => {
    const estimate = estimates.find((item) => item.id === estimateId);
    if (!estimate) return null;
    const invoiceId = nextId('INV', invoices);
    const firstItem = estimate.items?.[0];
    const amount = firstItem ? roundMoney(toNumber(firstItem.quantity) * toNumber(firstItem.rate)) : toNumber(estimate.amount);
    const invoice = {
      id: invoiceId,
      invoiceNumber: invoiceId.replace('INV-', '03113'),
      estimateId: estimate.id,
      jobId: estimate.jobId,
      milestone: firstItem?.description || 'Contract billing',
      issueDate: todayInput(),
      dueDate: todayInput(),
      amount,
      taxAmount: 0,
      payments: [],
    };
    setInvoices((current) => [invoice, ...current]);
    setEstimates((current) => current.map((item) => (
      item.id === estimateId ? { ...item, status: 'Converted', convertedInvoiceId: invoiceId } : item
    )));
    return invoice;
  };

  const recordInvoicePayment = (invoiceId, paymentInput) => {
    setInvoices((current) => current.map((invoice) => {
      if (invoice.id !== invoiceId) return invoice;
      const balance = documentBalance(invoice.amount, invoice.payments);
      const payment = {
        id: nextId('PAY', invoice.payments || []),
        date: todayInput(),
        method: 'ACH',
        reference: '',
        notes: '',
        ...paymentInput,
        amount: Math.min(toNumber(paymentInput.amount), balance),
      };
      return { ...invoice, payments: [...(invoice.payments || []), payment] };
    }));
  };

  const recordBillPayment = (billId, paymentInput) => {
    setBills((current) => current.map((bill) => {
      if (bill.id !== billId) return bill;
      const balance = documentBalance(bill.amount, bill.payments);
      const payment = {
        id: nextId('VPAY', bill.payments || []),
        date: todayInput(),
        method: 'ACH',
        reference: '',
        notes: '',
        ...paymentInput,
        amount: Math.min(toNumber(paymentInput.amount), balance),
      };
      return { ...bill, payments: [...(bill.payments || []), payment] };
    }));
  };

  const addPayrollEntries = (entries) => {
    setPayrollEntries((current) => [...entries, ...current]);
  };

  const value = useMemo(() => ({
    customers,
    leads,
    jobs,
    estimates,
    invoices,
    bills,
    payrollEntries,
    commissions,
    documents,
    salesCategories: seedSalesCategories,
    salesTaxReport,
    setCustomers,
    setLeads,
    setJobs,
    setEstimates,
    setInvoices,
    setBills,
    setPayrollEntries,
    setCommissions,
    setDocuments,
    setSalesTaxReport,
    addJob,
    updateJob,
    approveEstimate,
    convertEstimateToInvoice,
    recordInvoicePayment,
    recordBillPayment,
    addPayrollEntries,
  }), [customers, leads, jobs, estimates, invoices, bills, payrollEntries, commissions, documents, salesTaxReport]);

  return <KoolViewDataContext.Provider value={value}>{children}</KoolViewDataContext.Provider>;
}

export const useKoolViewData = () => {
  const context = useContext(KoolViewDataContext);
  if (!context) throw new Error('useKoolViewData must be used inside KoolViewDataProvider');
  return context;
};
```

- [ ] **Step 2: Wrap routes in `App.jsx`**

Modify `src/App.jsx`:

```jsx
import { KoolViewDataProvider } from './state/KoolViewDataContext';
```

Wrap the router content:

```jsx
function App() {
  return (
    <KoolViewDataProvider>
      <Router>
        <Layout>
          <Routes>
            ...
          </Routes>
        </Layout>
      </Router>
    </KoolViewDataProvider>
  );
}
```

- [ ] **Step 3: Rename Jobs nav label**

In `src/App.jsx`, change:

```jsx
<NavItem to="/jobs" icon={Briefcase} label="Internal Jobs" />
```

to:

```jsx
<NavItem to="/jobs" icon={Briefcase} label="Jobs & Contracts" />
```

- [ ] **Step 4: Verify provider does not break app**

Run:

```bash
npm run build
```

Expected:

```text
Build succeeds.
```

- [ ] **Step 5: Browser smoke test**

Open:

```text
http://127.0.0.1:5173/
http://127.0.0.1:5173/jobs
http://127.0.0.1:5173/billing
```

Expected:

```text
Pages render exactly as before, plus nav label says Jobs & Contracts.
```

- [ ] **Step 6: Commit**

Run:

```bash
git add src/state/KoolViewDataContext.jsx src/App.jsx
git commit -m "feat: add shared kool view data provider"
```

---

## Task 4: Shared UI Components

**Files:**
- Create: `src/components/KpiCard.jsx`
- Create: `src/components/StatusBadge.jsx`
- Create: `src/components/EmptyState.jsx`
- Create: `src/components/SectionToolbar.jsx`
- Modify: pages only after components compile.

- [ ] **Step 1: Create `StatusBadge.jsx`**

Use status mapping that covers jobs, accounting, documents, payroll, and commissions:

```jsx
const statusType = (status) => {
  const value = String(status || '').toLowerCase();
  if (value.includes('paid') || value.includes('approved') || value.includes('complete') || value.includes('current')) return 'success';
  if (value.includes('overdue') || value.includes('past due') || value.includes('void')) return 'danger';
  if (value.includes('partial') || value.includes('converted') || value.includes('factory') || value.includes('foc')) return 'primary';
  if (value.includes('pending') || value.includes('open') || value.includes('due') || value.includes('draft')) return 'warning';
  return 'secondary';
};

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${statusType(status)}`}>{status}</span>;
}
```

- [ ] **Step 2: Create `KpiCard.jsx`**

Add:

```jsx
import React from 'react';

export default function KpiCard({ title, value, subtext, icon: Icon, type = 'primary' }) {
  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</p>
          <h3 style={{ fontSize: '1.7rem', fontWeight: 700, margin: 0 }}>{value}</h3>
        </div>
        {Icon && (
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
            <Icon size={20} />
          </div>
        )}
      </div>
      {subtext && <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginTop: '0.75rem' }}>{subtext}</p>}
    </div>
  );
}
```

- [ ] **Step 3: Create `EmptyState.jsx`**

Add:

```jsx
export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      {Icon && <Icon size={42} style={{ opacity: 0.35, margin: '0 auto 1rem' }} />}
      <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>{title}</h3>
      {message && <p style={{ fontSize: '0.875rem' }}>{message}</p>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}
```

- [ ] **Step 4: Create `SectionToolbar.jsx`**

Add:

```jsx
export default function SectionToolbar({ title, subtitle, actions }) {
  return (
    <div style={{
      padding: '1.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      borderBottom: '1px solid var(--border)',
      flexWrap: 'wrap',
    }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{title}</h3>
        {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

Run:

```bash
npm run build
```

Expected:

```text
Build succeeds.
```

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/KpiCard.jsx src/components/StatusBadge.jsx src/components/EmptyState.jsx src/components/SectionToolbar.jsx
git commit -m "feat: add shared poc ui components"
```

---

## Task 5: Jobs & Contracts Hub

**Files:**
- Modify: `src/pages/Jobs.jsx`
- Import: `useKoolViewData`, `currency`, `calculateJobPnl`, `StatusBadge`

- [ ] **Step 1: Replace page-local `jobs` state with shared state**

In `src/pages/Jobs.jsx`, remove the hardcoded `useState([...])` jobs array and import:

```jsx
import { useKoolViewData } from '../state/KoolViewDataContext';
import StatusBadge from '../components/StatusBadge';
import { calculateJobPnl, currency } from '../utils/koolViewCalculations';
```

Inside `Jobs()`:

```jsx
const {
  jobs,
  estimates,
  invoices,
  bills,
  payrollEntries,
  commissions,
  documents,
  addJob,
  updateJob,
} = useKoolViewData();
```

- [ ] **Step 2: Update page title/copy**

Change:

```jsx
<h1 className="page-title">Internal Jobs</h1>
<p className="page-subtitle">Track project progress mapped to your leads and customers.</p>
```

to:

```jsx
<h1 className="page-title">Jobs & Contracts</h1>
<p className="page-subtitle">One job record feeds production, accounting, documents, commission, payroll, and P&L.</p>
```

- [ ] **Step 3: Update table columns to match Production List**

Columns:

```text
Track #
Customer
Project
Contract Date
Address
Billed
Price
Change Orders
Actions
```

Each job row should show:

```jsx
job.id
job.customerName
job.projectType
job.contractDate
`${job.address}, ${job.city}`
job.productionStage
currency(job.contractAmount)
currency(job.changeOrders)
```

- [ ] **Step 4: Add production stage filter tabs**

Use tabs:

```js
[
  { id: 'active', label: 'Active Jobs' },
  { id: 'DP', label: 'Deposit Billed' },
  { id: 'FOC', label: 'Factory Order' },
  { id: 'RD', label: 'Room Delivery' },
  { id: 'completed', label: 'Completed' },
]
```

Filtering logic:

```js
const visibleJobs = jobs.filter((job) => {
  if (activeTab === 'active') return job.status !== 'Completed';
  if (activeTab === 'completed') return job.status === 'Completed';
  return job.productionStage === activeTab;
});
```

- [ ] **Step 5: Add job detail modal tabs**

Inside selected job modal, add local modal tab state:

```jsx
const [detailTab, setDetailTab] = useState('overview');
```

Tabs:

```text
Overview
Checklist
Accounting
Documents
Payroll & Costs
P&L
```

- [ ] **Step 6: Implement Overview tab**

Show:

```text
Customer
Phone
Project Type
Contract Date
Address
City
Production Stage
Salesperson
Contract Amount
BusyBusy Project
FileCenter Folder
```

- [ ] **Step 7: Implement Entry Checklist tab**

Mirror `Entry Check List.docx` as system readiness checklist:

```js
const checklistItems = [
  { label: 'Accounting estimate created', complete: jobEstimateExists },
  { label: 'Production list updated', complete: true },
  { label: 'Commission tracking created', complete: jobCommissionExists },
  { label: 'Document folder created', complete: jobDocuments.length > 0 },
  { label: 'BusyBusy project mapped', complete: Boolean(job.busyBusyProject) },
];
```

Display each with `CheckCircle2` when complete and `Clock` when pending.

- [ ] **Step 8: Implement Accounting tab**

Show linked estimates/invoices for selected job:

```js
const jobEstimates = estimates.filter((estimate) => estimate.jobId === selectedJob.id);
const jobInvoices = invoices.filter((invoice) => invoice.jobId === selectedJob.id);
```

For each invoice show:

```text
Invoice #
Milestone
Amount
Balance
Status
```

- [ ] **Step 9: Implement Documents tab**

Show linked documents:

```js
const jobDocuments = documents.filter((document) => document.jobId === selectedJob.id);
```

Columns:

```text
Name
Category
Folder Path
Added By
Date
```

- [ ] **Step 10: Implement Payroll & Costs tab**

Show:

```js
const jobPayroll = payrollEntries.filter((entry) => entry.jobId === selectedJob.id);
const jobBills = bills.filter((bill) => bill.jobId === selectedJob.id);
```

Sections:

```text
Labor hours by employee
Vendor bills/materials
```

- [ ] **Step 11: Implement P&L tab**

Use:

```js
const pnl = calculateJobPnl({ job: selectedJob, invoices, bills, payrollEntries });
```

Show KPI grid:

```text
Invoiced Revenue
Collected Revenue
Bill Costs
Labor Cost
Gross Profit
Margin %
```

- [ ] **Step 12: Implement New Job modal submit**

When new job form is saved, call:

```js
addJob({
  customerId: 'CUST-NEW',
  customerName: form.customerName,
  phone: form.phone,
  projectType: form.projectType,
  contractDate: form.contractDate,
  address: form.address,
  city: form.city,
  contractAmount: toNumber(form.contractAmount),
  salesperson: form.salesperson,
  busyBusyProject: form.customerName,
  documentFolder: `Active/${form.projectType}/${form.customerName}`,
});
```

For the POC, keep this as local state only.

- [ ] **Step 13: Verify job hub**

Run:

```bash
npm run build
```

Manual browser checks:

```text
/jobs renders Production List fields.
Click a job opens tabs.
Checklist reflects estimate/commission/document/BusyBusy status.
P&L tab shows non-zero values for jobs with invoices/bills/payroll.
New Job adds a row to the list.
```

- [ ] **Step 14: Commit**

Run:

```bash
git add src/pages/Jobs.jsx
git commit -m "feat: enhance jobs and contracts hub"
```

---

## Task 6: Accounting Center Alignment

**Files:**
- Modify: `src/pages/Billing.jsx`
- Import: shared state, helpers, shared components.

- [ ] **Step 1: Replace accounting page seed state with shared state**

In `Billing.jsx`, import:

```jsx
import { useKoolViewData } from '../state/KoolViewDataContext';
import KpiCard from '../components/KpiCard';
import StatusBadge from '../components/StatusBadge';
import SectionToolbar from '../components/SectionToolbar';
import {
  calculateCommission,
  calculateJobPnl,
  calculatePayrollEntryCost,
  calculateSalesUseTax,
  currency,
  documentBalance,
  documentStatus,
  sumPayments,
  toNumber,
} from '../utils/koolViewCalculations';
```

Use shared context:

```jsx
const {
  jobs,
  estimates,
  invoices,
  bills,
  payrollEntries,
  commissions,
  salesTaxReport,
  approveEstimate,
  convertEstimateToInvoice,
  recordInvoicePayment,
  recordBillPayment,
  addPayrollEntries,
} = useKoolViewData();
```

- [ ] **Step 2: Keep existing tabs and add missing tabs**

Tabs should be:

```text
Estimates
Invoices
Bills
Payroll
Commissions
Sales & Use Tax
Job P&L
Reports
```

- [ ] **Step 3: Update Estimates tab to show Kool View milestone data**

Columns:

```text
Estimate #
Customer / Job
Project
Contract Amount
Milestones
Status
Actions
```

Actions:

```text
Approve
Convert to Invoice
View Items
```

- [ ] **Step 4: Update Invoice tab payment behavior**

For each invoice:

```js
const balance = documentBalance(invoice.amount, invoice.payments);
const status = documentStatus({ amount: invoice.amount, payments: invoice.payments, dueDate: invoice.dueDate });
```

Record payment modal must include:

```text
Payment Date
Amount
Method: Check, Credit Card, ACH, Cash, Other
Reference / Check #
Notes
```

- [ ] **Step 5: Update Bills tab to attach costs to jobs**

Columns:

```text
Bill #
Vendor
Job
Category
Total
Balance
Due Date
Status
Actions
```

Pay Bill modal uses same fields as invoice payment modal.

- [ ] **Step 6: Add Payroll Import tab behavior**

The POC should have a button:

```text
Import BusyBusy Sample
```

On click, call `addPayrollEntries()` with 3-5 sample entries using the same shape as `seedPayrollEntries`.

Show summary:

```text
Total Hours
Job Hours
Shop/Office/Training Hours
Estimated Labor Cost
Hours by Project
Hours by Employee
```

- [ ] **Step 7: Add Commissions tab**

For each commission:

```js
const summary = calculateCommission(commission);
```

Columns:

```text
Customer / Job
Salesperson
Contract Date
Contract Amount
Commission Due
Paid
Balance
Notes
```

- [ ] **Step 8: Add Sales & Use Tax tab**

Use:

```js
const tax = calculateSalesUseTax(salesTaxReport);
```

Render sections matching Dorothy's worksheet:

```text
Sales Tax - Wisconsin
Use Tax - State
County Tax
Summary
Totals
```

Show:

```text
Total Sales
Total Subtractions
Sales Subject to State Sales Tax
Purchases Subject to Use Tax
State Sales Tax
County Sales Tax
State Use Tax
County Use Tax
Total Amount Due
```

- [ ] **Step 9: Add Job P&L tab**

Show a job selector using `jobs`.

For selected job:

```js
const pnl = calculateJobPnl({ job: selectedJob, invoices, bills, payrollEntries });
```

Show:

```text
Ordinary Income/Expense
Income
Costs
Labor
Gross Profit
Net Income
```

This should visually echo `P&L for Job.pdf`.

- [ ] **Step 10: Keep Reports tab high-level**

Reports tab should show:

```text
A/R Aging
A/P Aging
Collected Cash
Payroll Summary
Simple P&L
```

Do not build full double-entry accounting.

- [ ] **Step 11: Verify accounting workflows**

Run:

```bash
npm run build
```

Manual checks:

```text
/billing shows all tabs.
Estimate can be approved and converted.
Converted invoice appears in Invoices.
Invoice payment records method/date/reference/notes.
Bill payment records method/date/reference/notes.
Payroll import adds entries and updates summaries.
Commission balances calculate.
Sales & Use Tax totals calculate.
Job P&L changes when payroll/bills/invoices exist.
```

- [ ] **Step 12: Commit**

Run:

```bash
git add src/pages/Billing.jsx
git commit -m "feat: align accounting center with kool view workflows"
```

---

## Task 7: FileCenter-Style Documents

**Files:**
- Modify: `src/pages/Documents.jsx`

- [ ] **Step 1: Replace local documents/properties with shared state**

Import:

```jsx
import { useKoolViewData } from '../state/KoolViewDataContext';
import StatusBadge from '../components/StatusBadge';
```

Inside component:

```jsx
const { documents, jobs } = useKoolViewData();
```

- [ ] **Step 2: Replace property list with FileCenter drawers**

Folders should include:

```text
Active
Customers
Rooms
Decks
Awnings
Repairs
Service
Windows
Cancelled Jobs
Unsigned Contracts
```

- [ ] **Step 3: Add Current/Past toggle**

Use:

```js
const [documentMode, setDocumentMode] = useState('current');
```

Mode labels:

```text
Current Jobs
Past Jobs
```

Current jobs should group by customer/job.
Past jobs should group by address/category.

- [ ] **Step 4: Update table columns**

Columns:

```text
File
Customer / Address
Job
Category
Folder Path
Added By
Date
Actions
```

- [ ] **Step 5: Add search behavior**

Search should filter by:

```js
document.name
document.lookupAddress
document.folderPath
document.customerName
document.category
```

- [ ] **Step 6: Add upload modal stub**

Clicking Upload Document opens a modal with:

```text
Job
Document Type
File Name
Category
Notes
```

POC action adds a mock document row. It does not upload a real file.

- [ ] **Step 7: Verify documents**

Run:

```bash
npm run build
```

Manual checks:

```text
/documents shows FileCenter-style drawers.
Current/Past toggle works.
Search by address finds past documents.
Upload mock document adds row.
```

- [ ] **Step 8: Commit**

Run:

```bash
git add src/pages/Documents.jsx
git commit -m "feat: enhance document hub with filecenter workflow"
```

---

## Task 8: Dashboard Connected To Shared Data

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Import shared state and helpers**

Add:

```jsx
import { useKoolViewData } from '../state/KoolViewDataContext';
import { calculateJobPnl, currency, documentBalance } from '../utils/koolViewCalculations';
```

- [ ] **Step 2: Replace static KPIs**

Use:

```js
const { jobs, leads, invoices, bills, payrollEntries } = useKoolViewData();
const activeJobs = jobs.filter((job) => job.status !== 'Completed').length;
const newLeads = leads.length;
const overdueInvoices = invoices.filter((invoice) => documentBalance(invoice.amount, invoice.payments) > 0 && new Date(invoice.dueDate) < new Date()).length;
const pendingPermits = jobs.filter((job) => String(job.status).toLowerCase().includes('permit')).length;
```

- [ ] **Step 3: Add financial KPI row**

Add cards:

```text
A/R Outstanding
A/P Due
Payroll Hours This Period
Open Job Profit
```

- [ ] **Step 4: Replace recent activity with real events**

Build recent activity from:

```text
latest job created
latest invoice payment
latest bill due
latest document added
latest payroll import
```

POC can create the activity list in memory from current arrays.

- [ ] **Step 5: Verify dashboard**

Run:

```bash
npm run build
```

Manual checks:

```text
/ dashboard KPIs match shared data.
Recording invoice payment in /billing changes dashboard A/R after navigation.
New job in /jobs changes Active Jobs after navigation.
```

- [ ] **Step 6: Commit**

Run:

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat: connect dashboard to shared kool view data"
```

---

## Task 9: Leads and Customers Light Alignment

**Files:**
- Modify: `src/pages/Leads.jsx`
- Modify: `src/pages/Customers.jsx`

- [ ] **Step 1: Update terminology**

Use language Dorothy understands:

```text
Lead Source
Appointment
Convert to Customer
Create Job/Contract
```

- [ ] **Step 2: Add lead-to-job demo action**

In `Leads.jsx`, add a visible action:

```text
Create Job/Contract
```

For the POC, clicking it opens a toast:

```text
Lead converted into a job and ready for estimate.
```

If time allows, call `addJob()` from context.

- [ ] **Step 3: Update Customers page to show active/past jobs**

For each customer card/table row, show:

```text
Active jobs
Past jobs
Open balance
Lifetime sales
```

Use shared `jobs` and `invoices`.

- [ ] **Step 4: Verify**

Run:

```bash
npm run build
```

Manual checks:

```text
/leads still renders pipeline.
/customers shows jobs and balances from shared data.
No duplicate disconnected customer names dominate the POC.
```

- [ ] **Step 5: Commit**

Run:

```bash
git add src/pages/Leads.jsx src/pages/Customers.jsx
git commit -m "feat: align leads and customers with job workflow"
```

---

## Task 10: Responsive UI and Copy Polish

**Files:**
- Modify: `src/index.css`
- Modify: `src/App.css`
- Touch page files only when fixing specific layout issues.

- [ ] **Step 1: Add reusable responsive grid utilities**

Add to `src/index.css`:

```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 1rem;
}

.span-3 { grid-column: span 3; }
.span-4 { grid-column: span 4; }
.span-6 { grid-column: span 6; }
.span-8 { grid-column: span 8; }
.span-12 { grid-column: span 12; }

@media (max-width: 900px) {
  .span-3,
  .span-4,
  .span-6,
  .span-8 {
    grid-column: span 12;
  }
}
```

- [ ] **Step 2: Add table responsive utility**

Add:

```css
.table-scroll {
  width: 100%;
  overflow-x: auto;
}

.table-scroll table {
  min-width: 780px;
}
```

- [ ] **Step 3: Replace risky inline widths**

Search:

```bash
rg "gridColumn: 'span|width: '200px'|width: '300px'" src
```

Where text clips on mobile, replace with responsive utility classes or `minmax(0, 1fr)`.

- [ ] **Step 4: Remove generic/fake names from visible seed data**

Search:

```bash
rg "Pam|Dwight|Jim|Stanley|Michael|Scranton|Paper" src
```

Replace visible sample data with anonymized Kool View-style data from `koolViewSeed.js`.

- [ ] **Step 5: Verify responsive layout**

Use browser viewports:

```text
Desktop: 1440x900
Tablet: 820x1180
Mobile: 390x844
```

Check:

```text
No table breaks page width without a scroll container.
No modal buttons overflow.
No sidebar overlaps content.
No button text clips.
```

- [ ] **Step 6: Commit**

Run:

```bash
git add src/index.css src/App.css src
git commit -m "polish: improve responsive poc layout and copy"
```

---

## Task 11: End-To-End POC QA

**Files:**
- No code changes unless bugs are found.

- [ ] **Step 1: Build**

Run:

```bash
npm run build
```

Expected:

```text
Build succeeds.
```

- [ ] **Step 2: Lint**

Run:

```bash
npm run lint
```

Expected:

```text
Passes, or only documented pre-existing issues remain.
```

- [ ] **Step 3: Start server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

- [ ] **Step 4: Browser test main pages**

Open and inspect:

```text
http://127.0.0.1:5173/
http://127.0.0.1:5173/leads
http://127.0.0.1:5173/customers
http://127.0.0.1:5173/jobs
http://127.0.0.1:5173/documents
http://127.0.0.1:5173/billing
```

- [ ] **Step 5: Test primary demo story**

Run this exact demo flow:

```text
1. Open Jobs & Contracts.
2. Open an active job.
3. Review Overview, Checklist, Accounting, Documents, Payroll & Costs, and P&L tabs.
4. Open Accounting.
5. Approve an estimate.
6. Convert it to invoice.
7. Record a partial invoice payment with ACH/check reference.
8. Pay a bill.
9. Import BusyBusy sample payroll hours.
10. Review Commission, Sales & Use Tax, and Job P&L tabs.
11. Open Documents and search by address.
12. Open Dashboard and confirm KPIs reflect shared data.
```

- [ ] **Step 6: Test mobile**

Use viewport:

```text
390x844
```

Check:

```text
Sidebar becomes usable.
Tabs scroll horizontally if needed.
Tables scroll inside containers.
Modals are usable.
No overlapping text.
```

- [ ] **Step 7: Fix bugs in focused commits**

For each issue:

```bash
git add <specific-files>
git commit -m "fix: <specific issue>"
```

- [ ] **Step 8: Final commit if needed**

Run:

```bash
git status --short
```

Expected:

```text
Only intentionally untracked proposal/docs files remain, or clean tree.
```

---

## Demo Script After Implementation

Use this when showing the enhanced POC:

```text
Dorothy, we updated the POC around the way your office actually works.

The center of the system is now the Job/Contract. When a contract is entered, that same record feeds the production list, estimate/invoice workflow, commission tracking, documents, BusyBusy payroll hours, and job P&L.

Here is the production list view, based on the spreadsheet you shared.

Opening a job shows the checklist you currently maintain manually: accounting, production list, commission, FileCenter, and BusyBusy setup.

In Accounting, estimates follow your QuickBooks-style milestone billing. We can approve an estimate, convert it into an invoice, and record the actual payment details instead of simply marking it paid.

We also added bills, commission, payroll/job-hour imports, sales/use tax reporting, and a job-level P&L so the accounting side is much closer to what you asked for.

For FileCenter, this first version supports new job documents going forward. Historical transfer can still be handled later as a separate phase.
```

---

## Scope Guardrails

Do not accidentally turn the POC into these larger systems during this implementation:

- Full QuickBooks clone.
- Full double-entry accounting engine.
- Bank reconciliation.
- Payroll tax filing.
- ACH/credit-card payment processor integration.
- BusyBusy mobile replacement.
- Full FileCenter migration.
- Real file upload/storage backend.
- Real Excel import parser.

For the POC, simulate imports and uploads with local state and clear UI labels.

---

## Self-Review

### Spec Coverage

- Production List: Task 1 and Task 5.
- Estimate and Invoice workflow: Task 1, Task 3, Task 6.
- Record invoice payment details: Task 3 and Task 6.
- Bills/AP: Task 1, Task 3, Task 6.
- Payroll/BusyBusy job hours: Task 1, Task 2, Task 6.
- Commission: Task 1, Task 2, Task 6.
- Sales report and sales/use tax: Task 1, Task 2, Task 6.
- Job P&L: Task 2, Task 5, Task 6.
- FileCenter current/past documents: Task 1 and Task 7.
- Dashboard coherence: Task 8.
- Mobile/browser QA: Task 10 and Task 11.

### Placeholder Scan

This plan avoids implementation placeholders. Optional future items are listed under scope guardrails and are explicitly out of POC scope.

### Type Consistency

Shared IDs and fields are defined in Task 1 and reused in Tasks 2-8:

- `jobId`
- `customerId`
- `payments`
- `contractAmount`
- `commissionRate`
- `payrollEntries`
- `documents`
- `salesTaxReport`

---

Plan complete and saved to `docs/superpowers/plans/2026-05-31-poc-architecture-enhancement.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, faster parallel-quality iteration.
2. **Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints.
