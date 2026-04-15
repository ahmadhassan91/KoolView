import React, { useState } from 'react';
import { Plus, Search, Filter, Phone, Mail, MapPin, Eye, Briefcase, FileText, Image as ImageIcon, Home, TrendingUp, Download } from 'lucide-react';
import Modal from '../components/Modal';

export default function Customers() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const customers = [
    { 
      id: 'C-1001', 
      name: 'Pam Beesly', 
      address: '492 Artist Way, Scranton, PA', 
      phone: '(555) 111-2222', 
      email: 'pam@example.com', 
      ltv: '$2,500', 
      status: 'Active',
      property: {
        type: 'Single Family',
        yearBuilt: '1998',
        sqFt: '1,850',
        estValue: '$285,000'
      },
      financials: {
        billed: '$2,500',
        outstanding: '$1,250',
        margin: '32%'
      },
      history: [
        { date: 'Oct 2023', type: 'Job', desc: 'Sunroom Installation (Job #4492)', amount: '$2,500' },
        { date: 'Sep 2023', type: 'Email', desc: 'Sent "Pre-Winter Sunroom Prep" marketing email', amount: '--' },
        { date: 'Sep 2023', type: 'Quote', desc: 'Delivered initial estimate via Kool View Portal', amount: '--' }
      ]
    },
    { 
      id: 'C-1002', 
      name: 'Jim Halpert', 
      address: '87 Paper St, Scranton, PA', 
      phone: '(555) 333-4444', 
      email: 'jim@example.com', 
      ltv: '$8,200', 
      status: 'Active',
      property: {
        type: 'Townhouse',
        yearBuilt: '2005',
        sqFt: '2,100',
        estValue: '$345,000'
      },
      financials: {
        billed: '$8,200',
        outstanding: '$0',
        margin: '41%'
      },
      history: [
        { date: 'Sep 2023', type: 'Job', desc: 'Patio Enclosure (Job #4494)', amount: '$8,200' }
      ]
    },
    { 
      id: 'C-1003', 
      name: 'Michael Scott', 
      address: '123 Condo Way, Scranton, PA', 
      phone: '(555) 555-6666', 
      email: 'michael@example.com', 
      ltv: '$18,500', 
      status: 'Past Client',
      property: {
        type: 'Condominium',
        yearBuilt: '2010',
        sqFt: '1,200',
        estValue: '$195,000'
      },
      financials: {
        billed: '$18,500',
        outstanding: '$0',
        margin: '38%'
      },
      history: [
        { date: 'Jan 2022', type: 'Job', desc: 'Master Bedroom Windows', amount: '$12,000' },
        { date: 'Mar 2023', type: 'Job', desc: 'Front Door Replacement', amount: '$6,500' }
      ]
    }
  ];

  const filteredCustomers = customers.filter(c => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return c.status === 'Active';
    if (activeTab === 'past') return c.status === 'Past Client';
    return true;
  });

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
          <h1 className="page-title">Customers CRM</h1>
          <p className="page-subtitle">Manage all active and past clients, property intelligence, and historical jobs.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setSelectedCustomer({ isNew: true })}>
          <Plus size={18} /> New Customer
        </button>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Total Custom LTV</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>$1.4M</h3>
             <span style={{ fontSize: '0.875rem', color: 'var(--success)' }}>+12% YTD</span>
          </div>
        </div>
        <div className="card" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Active Projects</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>24</h3>
        </div>
        <div className="card" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Avg Target Margin</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>36.5%</h3>
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
              All Customers
            </button>
            <button 
              style={{ fontWeight: 500, color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'active' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem' }}
              onClick={() => setActiveTab('active')}
            >
              Active Projects
            </button>
            <button 
              style={{ fontWeight: 500, color: activeTab === 'past' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'past' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem' }}
              onClick={() => setActiveTab('past')}
            >
              Past Clients
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search customers..." style={{ padding: '0.5rem 1rem 0.5rem 2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => showToast('Advanced Filtering coming soon.')}>
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Customer Name</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Contact Info</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Property Address</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>LTV</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr 
                  key={customer.id} 
                  style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)', cursor: 'pointer' }} 
                  className="hover-lift"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>
                    {customer.name}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{customer.id}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <Phone size={12} color="var(--text-muted)"/> {customer.phone}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      <Mail size={12} /> {customer.email}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem' }}>
                       <MapPin size={14} color="var(--text-muted)" style={{ marginTop: '2px' }}/>
                       <span>{customer.address}</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={`badge badge-${customer.status === 'Active' ? 'success' : 'secondary'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--primary)' }}>
                    {customer.ltv}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                     <button style={{ padding: '0.25rem', color: 'var(--text-muted)', transition: 'color 0.2s', cursor: 'pointer' }} title="View Profile">
                        <Eye size={18} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile / Form Modal */}
      {selectedCustomer && !selectedCustomer.isNew && (
         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg-page)', padding: 0 }}>
               
               {/* Modal Header */}
               <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-surface)' }}>
                  <div>
                     <h2 style={{ margin: '0 0 0.25rem 0' }}>{selectedCustomer.name}</h2>
                     <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>{selectedCustomer.id} | Account Since 2022</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                     <button className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>Close</button>
                     <button className="btn btn-primary" onClick={() => showToast(`Generating new customizable quote for ${selectedCustomer.name}...`)}><Plus size={16} /> New Quote</button>
                  </div>
               </div>

               {/* Modal Body */}
               <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '2rem' }}>
                 
                 {/* Left Column (Meta & Real Estate) */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Identity Block */}
                    <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                         <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                           {selectedCustomer.name.charAt(0)}
                         </div>
                         <div>
                            <span className={`badge badge-${selectedCustomer.status === 'Active' ? 'success' : 'secondary'}`} style={{ marginBottom: '0.25rem', display: 'inline-block' }}>{selectedCustomer.status}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                               <Phone size={14} /> {selectedCustomer.phone}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                               <Mail size={14} /> {selectedCustomer.email}
                            </div>
                         </div>
                       </div>
                    </div>

                    {/* Property Intelligence Block */}
                    <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                       <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Home size={18} color="var(--primary)" /> Property Intelligence
                       </h3>
                       <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                          <MapPin size={16} color="var(--text-muted)" style={{ marginTop: '2px' }}/>
                          <span style={{ fontSize: '0.875rem' }}>{selectedCustomer.address}</span>
                       </div>
                       
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div>
                             <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Property Type</p>
                             <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>{selectedCustomer.property.type}</p>
                          </div>
                          <div>
                             <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Year Built</p>
                             <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>{selectedCustomer.property.yearBuilt}</p>
                          </div>
                          <div>
                             <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Square Footage</p>
                             <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>{selectedCustomer.property.sqFt} sq ft</p>
                          </div>
                          <div>
                             <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Zillow Value</p>
                             <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem', color: 'var(--success)' }}>{selectedCustomer.property.estValue}</p>
                          </div>
                       </div>
                    </div>

                    {/* Asset Vault Preview */}
                    <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                       <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={18} color="var(--primary)" /> Asset Vault</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => showToast('Opening comprehensive vault history...')}>View All</span>
                       </h3>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-page)', borderRadius: 'var(--radius-sm)' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <FileText size={16} color="var(--danger)" /> Signed_Contract.pdf
                             </div>
                             <Download size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => showToast('Downloading Signed_Contract.pdf...')} />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-page)', borderRadius: 'var(--radius-sm)' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                <ImageIcon size={16} color="var(--success)" /> Pre_Install_Photo.jpg
                             </div>
                             <Download size={14} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={() => showToast('Downloading Pre_Install_Photo.jpg...')} />
                          </div>
                       </div>
                    </div>

                 </div>

                 {/* Right Column (Financials & History) */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Financials Strip */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                       <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Billed (LTV)</p>
                          <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>{selectedCustomer.financials.billed}</h3>
                       </div>
                       <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Outstanding</p>
                          <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: selectedCustomer.financials.outstanding === '$0' ? 'var(--text-main)' : 'var(--danger)' }}>{selectedCustomer.financials.outstanding}</h3>
                       </div>
                       <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                          <TrendingUp size={64} color="var(--success)" style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.1 }} />
                          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. Margin</p>
                          <h3 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>{selectedCustomer.financials.margin}</h3>
                       </div>
                    </div>

                    {/* Deep History Log */}
                    <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', flex: 1 }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                         <h3 style={{ margin: 0, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={18} color="var(--primary)" /> CRM Timeline
                         </h3>
                         <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="badge badge-secondary" style={{ cursor: 'pointer' }}>All Activity</button>
                            <button className="badge badge-primary" style={{ cursor: 'pointer', backgroundColor: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>Jobs Only</button>
                         </div>
                       </div>
                       
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                         {/* Connecting Line */}
                         <div style={{ position: 'absolute', left: '15px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--border)', zIndex: 0 }}></div>
                         
                         {selectedCustomer.history.map((record, idx) => (
                            <div key={idx} style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                              
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: record.type === 'Job' ? 'var(--primary)' : 'var(--bg-subtle)', color: record.type === 'Job' ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '4px solid var(--bg-surface)' }}>
                                {record.type === 'Job' ? <Briefcase size={14} /> : record.type === 'Email' ? <Mail size={14} /> : <FileText size={14} />}
                              </div>

                              <div style={{ backgroundColor: 'var(--bg-page)', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                   <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{record.type} Activity</span>
                                   <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record.date}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>{record.desc}</p>
                                {record.amount !== '--' && (
                                   <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold', fontSize: '0.875rem', color: 'var(--success)' }}>Value: {record.amount}</p>
                                )}
                              </div>
                            </div>
                         ))}
                       </div>
                    </div>

                 </div>
               </div>
            </div>
         </div>
      )}

      {/* Fallback existing simple modal for "New Customer" */}
      {selectedCustomer?.isNew && (
         <Modal 
          isOpen={true} 
          onClose={() => setSelectedCustomer(null)} 
          title="Add New Customer"
          footer={<><button className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>Cancel</button><button className="btn btn-primary" onClick={() => setSelectedCustomer(null)}>Save Customer</button></>}
         >
          <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="e.g. Toby Flenderson" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-input" placeholder="(555) 000-0000" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="email@example.com" />
              </div>
          </div>
          <div className="form-group">
              <label className="form-label">Primary Property Address</label>
              <input type="text" className="form-input" placeholder="123 Street Name, City, State ZIP" />
          </div>
         </Modal>
      )}

    </div>
  );
}
