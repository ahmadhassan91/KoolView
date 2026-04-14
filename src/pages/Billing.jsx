import React, { useState } from 'react';
import { Plus, Download, Search, Filter, IndianRupee, Eye, Send, CheckCircle2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function Billing() {
  const [activeTab, setActiveTab] = useState('unpaid');
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [sendInvoice, setSendInvoice] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const [invoices, setInvoices] = useState([
    { id: 'INV-2041', customer: 'Pam Beesly', amount: '$2,500.00', status: 'Unpaid', dueDate: 'Oct 30, 2023', milestone: 'Deposit' },
    { id: 'INV-2042', customer: 'Dwight Schrute', amount: '$4,800.00', status: 'Unpaid', dueDate: 'Nov 02, 2023', milestone: 'Factory Order' },
    { id: 'INV-2043', customer: 'Jim Halpert', amount: '$8,200.00', status: 'Overdue', dueDate: 'Oct 10, 2023', milestone: 'Final Completion' },
    { id: 'INV-2039', customer: 'Stanley Hudson', amount: '$1,500.00', status: 'Paid', dueDate: 'Oct 15, 2023', milestone: 'Deposit' },
    { id: 'INV-2040', customer: 'Angela Martin', amount: '$3,200.00', status: 'Paid', dueDate: 'Oct 18, 2023', milestone: 'Factory Order' },
  ]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Paid': return 'badge badge-success';
      case 'Unpaid': return 'badge badge-warning';
      case 'Overdue': return 'badge badge-danger';
      default: return 'badge badge-secondary';
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unpaid') return inv.status === 'Unpaid' || inv.status === 'Overdue';
    if (activeTab === 'paid') return inv.status === 'Paid';
    return true;
  });

  const handleMarkPaid = (id) => {
    setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: 'Paid' } : inv));
  };

  const handleDownload = (id) => {
    setActionMessage(`Downloading Invoice ${id}.pdf...`);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleSendReminder = () => {
    if (!sendInvoice) return;
    setActionMessage(`Payment reminder sent to ${sendInvoice.customer}!`);
    setSendInvoice(null);
    setTimeout(() => setActionMessage(''), 3000);
  };

  return (
    <div className="animate-fade-in relative">
      {/* Toast Notification */}
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
          animation: 'fadeInDown 0.3s ease-out'
        }}>
          {actionMessage}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Invoices</h1>
          <p className="page-subtitle">Track payments, send invoices, and manage A/R.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Create Invoice
        </button>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Total Outstanding (A/R)</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>$15,500.00</h3>
        </div>
        <div className="card" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Overdue</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--danger)' }}>$8,200.00</h3>
        </div>
        <div className="card" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Collected this Month</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>$4,700.00</h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', backgroundColor: 'var(--success-light)', padding: '0.125rem 0.5rem', borderRadius: '1rem' }}>+12%</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        {/* Table Toolbar */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              style={{ fontWeight: 500, color: activeTab === 'all' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'all' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem' }}
              onClick={() => setActiveTab('all')}
            >
              All Invoices
            </button>
            <button 
              style={{ fontWeight: 500, color: activeTab === 'unpaid' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'unpaid' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem' }}
              onClick={() => setActiveTab('unpaid')}
            >
              Outstanding
            </button>
            <button 
              style={{ fontWeight: 500, color: activeTab === 'paid' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'paid' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem' }}
              onClick={() => setActiveTab('paid')}
            >
              Paid
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search invoices..." style={{ padding: '0.5rem 1rem 0.5rem 2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.5rem' }}>
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Invoice #</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Milestone</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Due Date</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }} className="hover-lift">
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-main)' }}>{inv.id}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{inv.customer}</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{inv.milestone}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>{inv.amount}</td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{inv.dueDate}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={getStatusBadge(inv.status)}>{inv.status}</span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => setPreviewInvoice(inv)} style={{ padding: '0.25rem', color: 'var(--primary)', transition: 'color 0.2s', cursor: 'pointer' }} title="View">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => setSendInvoice(inv)} style={{ padding: '0.25rem', color: 'var(--text-muted)', transition: 'color 0.2s', cursor: 'pointer' }} title="Send Reminder">
                        <Send size={16} />
                      </button>
                      {inv.status !== 'Paid' && (
                        <button onClick={() => handleMarkPaid(inv.id)} style={{ padding: '0.25rem', color: 'var(--success)', transition: 'color 0.2s', cursor: 'pointer' }} title="Mark Paid">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDownload(inv.id)} style={{ padding: '0.25rem', color: 'var(--text-muted)', transition: 'color 0.2s', cursor: 'pointer' }} title="Download PDF">
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Modal */}
      <Modal 
        isOpen={!!previewInvoice} 
        onClose={() => setPreviewInvoice(null)} 
        title={`Invoice Preview: ${previewInvoice?.id}`}
        footer={<button className="btn btn-primary" onClick={() => handleDownload(previewInvoice?.id) || setPreviewInvoice(null)}>Download PDF</button>}
      >
        {previewInvoice && (
          <div style={{ fontFamily: 'monospace', backgroundColor: 'white', padding: '2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: '#000' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
               <div>
                  <h2 style={{ margin: 0, color: 'var(--primary)' }}>KOOL VIEW</h2>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>123 Window Way<br/>Sunroom City, WI</p>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <h1 style={{ margin: 0, fontWeight: 300 }}>INVOICE</h1>
                 <p style={{ margin: 0 }}>#{previewInvoice.id}</p>
               </div>
             </div>
             
             <div style={{ marginBottom: '2rem' }}>
                <p style={{ fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>Bill To:</p>
                <p style={{ margin: 0 }}>{previewInvoice.customer}</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Due: {previewInvoice.dueDate}</p>
             </div>

             <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
               <thead>
                 <tr style={{ borderBottom: '1px solid #ccc' }}>
                   <th style={{ textAlign: 'left', padding: '0.5rem 0' }}>Description</th>
                   <th style={{ textAlign: 'right', padding: '0.5rem 0' }}>Amount</th>
                 </tr>
               </thead>
               <tbody>
                 <tr>
                   <td style={{ padding: '0.75rem 0' }}>{previewInvoice.milestone} Payment</td>
                   <td style={{ textAlign: 'right', padding: '0.75rem 0' }}>{previewInvoice.amount}</td>
                 </tr>
               </tbody>
             </table>

             <div style={{ textAlign: 'right', fontSize: '1.25rem', fontWeight: 'bold' }}>
                Total Due: {previewInvoice.amount}
             </div>
             
             {previewInvoice.status === 'Paid' && (
               <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--success)', border: '2px solid var(--success)', padding: '1rem', borderRadius: '8px', transform: 'rotate(-5deg)', width: 'fit-content', margin: '2rem auto 0 auto', fontWeight: 'bold', letterSpacing: '2px' }}>
                 PAID IN FULL
               </div>
             )}
          </div>
        )}
      </Modal>

      {/* Send Reminder Modal */}
      <Modal 
        isOpen={!!sendInvoice} 
        onClose={() => setSendInvoice(null)} 
        title={`Send Payment Reminder`}
        footer={<><button className="btn btn-secondary" onClick={() => setSendInvoice(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSendReminder}>Send Reminder</button></>}
      >
        {sendInvoice && (
          <div>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Confirm sending an automated email and SMS reminder to <strong>{sendInvoice.customer}</strong> for Invoice <strong>{sendInvoice.id}</strong>.
            </p>
            
            <div className="form-group">
                <label className="form-label">Delivery Methods</label>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                     <input type="checkbox" defaultChecked /> Email to customer on file
                   </label>
                   <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                     <input type="checkbox" defaultChecked /> SMS text via Kool View number
                   </label>
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">Attached Message</label>
              <textarea className="form-input" rows="4" defaultValue={`Hi ${sendInvoice.customer.split(' ')[0]},\n\nThis is a friendly reminder from Kool View that your payment of ${sendInvoice.amount} for the ${sendInvoice.milestone} is due on ${sendInvoice.dueDate}.\n\nClick the link below to pay securely online.\n\nThank you!`}></textarea>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
