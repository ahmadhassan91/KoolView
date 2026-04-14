import React, { useState } from 'react';
import { Plus, MessageSquare, Phone, Calendar as CalendarIcon, UserPlus, Clock, Send } from 'lucide-react';
import Modal from '../components/Modal';

export default function Leads() {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [leads, setLeads] = useState([
    { id: 'L-101', name: 'Angela Martin', source: 'HomeAdvisor', phone: '(555) 019-2831', status: 'New', time: '2h ago', notes: 'Looking for a 3-season sunroom.' },
    { id: 'L-104', name: 'Toby Flenderson', source: 'Website', phone: '(555) 777-1234', status: 'New', time: '5h ago', notes: 'Needs front door replacement.' },
    { id: 'L-105', name: 'Phyllis Vance', source: 'Call-in', phone: '(555) 123-9876', status: 'New', time: '1d ago', notes: 'Window replacement for kitchen.' },
    { id: 'L-102', name: 'Creed Bratton', source: 'Website', phone: '(555) 998-1123', status: 'Contacted', time: '1d ago', notes: 'Needs 5 windows replaced.' },
    { id: 'L-106', name: 'Ryan Howard', source: 'Angie', phone: '(555) 888-5555', status: 'Contacted', time: '2d ago', notes: 'Patio cover request.' },
    { id: 'L-103', name: 'Kelly Kapoor', source: 'Angie', phone: '(555) 777-6655', status: 'Appt. Set', time: '2d ago', notes: 'Wants patio enclosure quote.' },
    { id: 'L-107', name: 'Meredith Palmer', source: 'Referral', phone: '(555) 333-2222', status: 'Appt. Set', time: '3d ago', notes: 'Gutter replacement.' },
    { id: 'L-108', name: 'Kevin Malone', source: 'HomeAdvisor', phone: '(555) 444-1111', status: 'Quoted', time: '4d ago', notes: 'Sunroom extension. Quoted $15k.' },
  ]);

  const kanbanColumns = [
    { title: 'New', color: 'primary' },
    { title: 'Contacted', color: 'warning' },
    { title: 'Appt. Set', color: 'success' },
    { title: 'Quoted', color: 'primary' },
  ];

  /* --- Drag and Drop Handlers --- */
  const handleDragStart = (e, leadId) => {
    e.dataTransfer.setData('leadId', leadId);
    e.currentTarget.style.opacity = '0.5'; // Visual feedback
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow dropping
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    ));
  };

  /* --- Interactive SMS Handlers --- */
  const [selectedSmsLead, setSelectedSmsLead] = useState(leads.find(l => l.name === 'Kelly Kapoor'));
  const [smsText, setSmsText] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'us', text: 'Hi Kelly, this is Kool View confirming your site visit tomorrow at 10:00 AM. Reply C to confirm or R to reschedule.', time: '10:00 AM' },
    { sender: 'them', text: 'C', time: '10:15 AM' }
  ]);

  const openSmsForLead = (lead) => {
    setSelectedSmsLead(lead);
    setChatHistory([
      { sender: 'us', text: `Hi ${lead.name.split(' ')[0]}, thanks for reaching out to Kool View! How can we help you today?`, time: 'Just now' }
    ]);
  };

  const sendSms = () => {
    if (!smsText.trim()) return;
    setChatHistory([...chatHistory, { sender: 'us', text: smsText, time: 'Now' }]);
    setSmsText('');
    
    // Simulate a fake reply after 2 seconds for the demo!
    setTimeout(() => {
      setChatHistory(prev => [...prev, { sender: 'them', text: "Sounds great, looking forward to it!", time: 'Now' }]);
    }, 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Leads & Scheduling</h1>
          <p className="page-subtitle">Manage new inquiries and schedule site visits.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddLeadOpen(true)}>
          <UserPlus size={18} /> Add Lead
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 7fr) minmax(0, 3fr)', gap: '1.5rem' }}>
        {/* Kanban Board */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Lead Pipeline</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', overflowX: 'auto' }}>
            {kanbanColumns.map((col) => {
              const columnLeads = leads.filter(l => l.status === col.title);
              
              return (
                <div 
                  key={col.title} 
                  style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '0.75rem', minHeight: '65vh' }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.title)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.25rem 0.5rem' }}>
                    <h4 style={{ fontWeight: 600, fontSize: '0.875rem' }}>{col.title}</h4>
                    <span style={{ backgroundColor: 'var(--border)', color: 'var(--text-main)', fontSize: '0.75rem', fontWeight: 600, padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                      {columnLeads.length}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minHeight: '100px' }}>
                    {columnLeads.map((lead) => (
                      <div 
                        key={lead.id} 
                        className="card hover-lift" 
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onDragEnd={handleDragEnd}
                        style={{ padding: '1rem', cursor: 'grab', borderLeft: `3px solid var(--${col.color})` }}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h5 style={{ fontWeight: 600, margin: 0, fontSize: '0.875rem' }}>{lead.name}</h5>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{lead.time}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                          Source: <span style={{ fontWeight: 500 }}>{lead.source}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }} onClick={e => e.stopPropagation()}>
                          <button style={{ color: 'var(--text-muted)', padding: '0.25rem' }} title="Call"><Phone size={14} /></button>
                          <button 
                            style={{ color: selectedSmsLead?.id === lead.id ? 'var(--primary)' : 'var(--text-muted)', padding: '0.25rem', transition: 'var(--transition)' }} 
                            title="Text"
                            onClick={(e) => { e.stopPropagation(); openSmsForLead(lead); }}
                          >
                            <MessageSquare size={14} />
                          </button>
                          <button style={{ color: 'var(--text-muted)', padding: '0.25rem' }} title="Schedule"><CalendarIcon size={14} /></button>
                        </div>
                      </div>
                    ))}
                    {columnLeads.length === 0 && (
                      <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Drag leads here
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Interactive SMS Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '75vh' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Live SMS Hub</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Chatting with: <strong style={{ color: 'var(--text-main)' }}>{selectedSmsLead?.name || 'No lead selected'}</strong>
              </p>
            </div>
            
            <div style={{ flex: 1, backgroundColor: 'var(--bg-subtle)', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {chatHistory.map((msg, idx) => (
                <div key={idx} style={{ 
                  alignSelf: msg.sender === 'us' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === 'us' ? 'var(--primary)' : 'var(--bg-surface)', 
                  color: msg.sender === 'us' ? 'white' : 'var(--text-main)', 
                  border: msg.sender === 'them' ? '1px solid var(--border)' : 'none',
                  padding: '0.75rem', 
                  borderRadius: msg.sender === 'us' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', 
                  fontSize: '0.875rem', 
                  lineHeight: 1.5,
                  maxWidth: '85%'
                }}>
                  {msg.text}
                  <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', opacity: 0.7, textAlign: msg.sender === 'us' ? 'right' : 'left' }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem', backgroundColor: 'var(--bg-surface)' }}>
              <input 
                type="text" 
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendSms()}
                placeholder="Type SMS message..." 
                style={{ flex: 1, padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', outline: 'none', fontSize: '0.875rem', backgroundColor: 'var(--bg-page)' }}
              />
              <button 
                onClick={sendSms}
                style={{ backgroundColor: 'var(--primary)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none', transition: 'var(--transition)' }}
              >
                <Send size={16} style={{ marginLeft: '-2px' }} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Lead Modal & Details Modal code remains completely unchanged below */}
      <Modal 
        isOpen={isAddLeadOpen} 
        onClose={() => setIsAddLeadOpen(false)} 
        title="Add New Lead"
        footer={<><button className="btn btn-secondary" onClick={() => setIsAddLeadOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={() => setIsAddLeadOpen(false)}>Save Lead</button></>}
      >
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" className="form-input" placeholder="e.g. Michael Scott" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" className="form-input" placeholder="(555) 000-0000" />
          </div>
          <div className="form-group">
            <label className="form-label">Source</label>
            <select className="form-input">
              <option>Manual Entry</option>
              <option>Angie's List</option>
              <option>HomeAdvisor</option>
              <option>Website Contact</option>
              <option>TV Ad / Call-in</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Initial Notes</label>
          <textarea className="form-input" rows="3" placeholder="What are they looking for?"></textarea>
        </div>
      </Modal>

      <Modal 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
        title={`Lead: ${selectedLead?.name}`}
        footer={<button className="btn btn-primary">Schedule Appointment</button>}
      >
        {selectedLead && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</p>
                <p style={{ fontWeight: 600 }}>{selectedLead.status}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone</p>
                <p style={{ fontWeight: 600 }}>{selectedLead.phone}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Source</p>
                <p style={{ fontWeight: 600 }}>{selectedLead.source}</p>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <p style={{ fontSize: '0.875rem', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                {selectedLead.notes}
              </p>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
