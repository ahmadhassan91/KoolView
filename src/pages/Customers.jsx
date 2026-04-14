import React, { useState } from 'react';
import { Plus, Search, Filter, Phone, Mail, MapPin, Eye, Briefcase, ChevronRight } from 'lucide-react';
import Modal from '../components/Modal';

export default function Customers() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customers = [
    { 
      id: 'C-1001', 
      name: 'Pam Beesly', 
      address: '492 Artist Way, Scranton, PA', 
      phone: '(555) 111-2222', 
      email: 'pam@example.com', 
      ltv: '$2,500', 
      status: 'Active',
      history: [
        { date: 'Oct 2023', type: 'Job', desc: 'Sunroom Installation (Job #4492)', amount: '$2,500' }
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
      history: [
        { date: 'Jan 2022', type: 'Job', desc: 'Master Bedroom Windows', amount: '$12,000' },
        { date: 'Mar 2023', type: 'Job', desc: 'Front Door Replacement', amount: '$6,500' }
      ]
    },
    { 
      id: 'C-1004', 
      name: 'Stanley Hudson', 
      address: '88 Pretzel St, Scranton, PA', 
      phone: '(555) 888-9999', 
      email: 'shudson@example.com', 
      ltv: '$1,500', 
      status: 'Active',
      history: [
        { date: 'Oct 2023', type: 'Job', desc: 'Awning Installation (Job #4495)', amount: '$1,500' }
      ]
    },
    { 
      id: 'C-1005', 
      name: 'Angela Martin', 
      address: '4 猫 St, Scranton, PA', 
      phone: '(555) 019-2831', 
      email: 'angela@example.com', 
      ltv: '$3,200', 
      status: 'Past Client',
      history: [
        { date: 'Aug 2023', type: 'Job', desc: 'Window Replacement', amount: '$3,200' }
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers CRM</h1>
          <p className="page-subtitle">Manage all active and past clients, LTV, and historical jobs.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setSelectedCustomer({ isNew: true })}>
          <Plus size={18} /> New Customer
        </button>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Total Customers</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>{customers.length}</h3>
        </div>
        <div className="card" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Active Projects</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>3</h3>
        </div>
        <div className="card" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Avg Lifetime Value</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>$6,780</h3>
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
      <Modal 
        isOpen={!!selectedCustomer} 
        onClose={() => setSelectedCustomer(null)} 
        title={selectedCustomer?.isNew ? 'Add New Customer' : `Customer Profile: ${selectedCustomer?.name}`}
        footer={
          selectedCustomer?.isNew ? 
            <><button className="btn btn-secondary" onClick={() => setSelectedCustomer(null)}>Cancel</button><button className="btn btn-primary" onClick={() => setSelectedCustomer(null)}>Save Customer</button></> 
            : <button className="btn btn-primary" onClick={() => setSelectedCustomer(null)}>Close</button>
        }
      >
        {selectedCustomer?.isNew ? (
          <div>
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
          </div>
        ) : selectedCustomer && (
          <div>
            {/* Split Profile Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
               
               {/* Left Column: Info */}
               <div>
                 <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                   <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                     {selectedCustomer.name.charAt(0)}
                   </div>
                   <h3 style={{ margin: '0 0 0.5rem 0' }}>{selectedCustomer.name}</h3>
                   <span className={`badge badge-${selectedCustomer.status === 'Active' ? 'success' : 'secondary'}`} style={{ marginBottom: '1.5rem', display: 'inline-block' }}>
                      {selectedCustomer.status}
                   </span>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <div>
                       <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Contact</p>
                       <p style={{ fontSize: '0.875rem' }}><Phone size={12} style={{marginRight: '4px'}}/>{selectedCustomer.phone}</p>
                       <p style={{ fontSize: '0.875rem' }}><Mail size={12} style={{marginRight: '4px'}}/>{selectedCustomer.email}</p>
                     </div>
                     <div>
                       <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Property</p>
                       <p style={{ fontSize: '0.875rem' }}><MapPin size={12} style={{marginRight: '4px'}}/>{selectedCustomer.address}</p>
                     </div>
                     <div>
                       <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lifetime Value</p>
                       <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>{selectedCustomer.ltv}</p>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Right Column: History */}
               <div>
                  <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Briefcase size={18} color="var(--primary)" /> Interaction History
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedCustomer.history.map((record, idx) => (
                       <div key={idx} style={{ border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                             <span className="badge badge-primary">{record.type}</span>
                             <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{record.date}</span>
                           </div>
                           <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>{record.desc}</p>
                         </div>
                         <div style={{ fontWeight: 600 }}>
                           {record.amount}
                         </div>
                       </div>
                    ))}
                  </div>

                  <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem', border: '1px dashed var(--border)' }}>
                     <Plus size={16} /> Link New Job to Customer
                  </button>
               </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
