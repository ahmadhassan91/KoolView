import React, { useState } from 'react';
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
import { documentBalance, estimateTotal, roundMoney, toNumber } from '../utils/koolViewCalculations';
import { KoolViewDataContext } from './koolViewDataContextCore';

const todayInput = () => new Date().toISOString().slice(0, 10);

const addDaysInput = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const nextId = (prefix, records) => {
  const max = records.reduce((highest, record) => {
    const numeric = Number(String(record.id || '').replace(/\D/g, ''));
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

  const addCustomer = (customerInput) => {
    const customer = {
      id: nextId('CUST', customers),
      status: 'Active',
      email: '',
      city: '',
      ...customerInput,
    };
    setCustomers((current) => [customer, ...current]);
    return customer;
  };

  const addLead = (leadInput) => {
    const lead = {
      id: nextId('LEAD', leads),
      status: 'New',
      time: 'Just now',
      ...leadInput,
    };
    setLeads((current) => [lead, ...current]);
    return lead;
  };

  const addJob = (jobInput) => {
    const id = nextId('JOB', jobs);
    const job = {
      id,
      status: 'Deposit Billed',
      productionStage: 'DP',
      changeOrders: 0,
      changeOrderDate: null,
      contractDate: todayInput(),
      salesperson: 'C',
      contractAmount: 0,
      ...jobInput,
    };
    setJobs((current) => [job, ...current]);
    return job;
  };

  const updateJob = (jobId, updates) => {
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, ...updates } : job)));
  };

  const convertLeadToJob = (leadId) => {
    const lead = leads.find((item) => item.id === leadId);
    if (!lead) return null;
    const customer = addCustomer({
      name: lead.name,
      phone: lead.phone,
      email: lead.email || '',
      address: lead.address || '',
      city: lead.city || '',
    });
    const job = addJob({
      customerId: customer.id,
      customerName: customer.name,
      phone: customer.phone,
      projectType: lead.projectType || 'Initial Site Survey',
      address: customer.address,
      city: customer.city,
      status: 'Lead Converted',
      productionStage: 'DP',
      contractAmount: 0,
      busyBusyProject: customer.name,
      documentFolder: `Active/Unsigned Contracts/${customer.name}`,
    });
    setLeads((current) => current.map((item) => (item.id === leadId ? { ...item, status: 'Converted', convertedJobId: job.id } : item)));
    return job;
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
    const amount = firstItem ? roundMoney(toNumber(firstItem.quantity) * toNumber(firstItem.rate)) : estimateTotal(estimate);
    const invoice = {
      id: invoiceId,
      invoiceNumber: invoiceId.replace('INV-', '03113'),
      estimateId: estimate.id,
      jobId: estimate.jobId,
      milestone: firstItem?.description || 'Contract billing',
      issueDate: todayInput(),
      dueDate: addDaysInput(14),
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
    const normalized = entries.map((entry, index) => ({
      id: entry.id || `TIME-${Date.now()}-${index}`,
      ...entry,
    }));
    setPayrollEntries((current) => [...normalized, ...current]);
  };

  const addDocument = (documentInput) => {
    const document = {
      id: nextId('DOC', documents),
      type: 'pdf',
      size: 'POC',
      status: 'Current',
      addedBy: 'Dorothy',
      addedDate: todayInput(),
      ...documentInput,
    };
    setDocuments((current) => [document, ...current]);
    return document;
  };

  const value = {
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
    addCustomer,
    addLead,
    addJob,
    updateJob,
    convertLeadToJob,
    approveEstimate,
    convertEstimateToInvoice,
    recordInvoicePayment,
    recordBillPayment,
    addPayrollEntries,
    addDocument,
  };

  return <KoolViewDataContext.Provider value={value}>{children}</KoolViewDataContext.Provider>;
}
