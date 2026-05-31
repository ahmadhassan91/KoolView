import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, MessageSquare, Phone, Send, UserPlus } from 'lucide-react';
import Modal from '../components/Modal';
import { useKoolViewData } from '../state/useKoolViewData';

const kanbanColumns = [
  { title: 'New', color: 'primary' },
  { title: 'Contacted', color: 'warning' },
  { title: 'Appt. Set', color: 'success' },
  { title: 'Quoted', color: 'primary' },
  { title: 'Converted', color: 'success' },
];

export default function Leads() {
  const { leads, setLeads, addLead, convertLeadToJob } = useKoolViewData();
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedSmsLead, setSelectedSmsLead] = useState(leads[0]);
  const [smsText, setSmsText] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [newLead, setNewLead] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Website',
    address: '',
    city: '',
    projectType: 'Transition Living Space',
    notes: '',
  });
  const [chatHistory, setChatHistory] = useState([
    { sender: 'us', text: 'Hi, this is Kool View confirming your site visit. Reply C to confirm or R to reschedule.', time: '10:00 AM' },
    { sender: 'them', text: 'C', time: '10:15 AM' },
  ]);

  const showToast = (message) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(''), 3500);
  };

  const handleDragStart = (event, leadId) => {
    event.dataTransfer.setData('leadId', leadId);
    event.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (event) => {
    event.currentTarget.style.opacity = '1';
  };

  const handleDrop = (event, newStatus) => {
    event.preventDefault();
    const leadId = event.dataTransfer.getData('leadId');
    setLeads((current) => current.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)));
  };

  const openSmsForLead = (lead) => {
    setSelectedSmsLead(lead);
    setChatHistory([
      { sender: 'us', text: `Hi ${lead.name.split(' ')[0]}, thanks for reaching out to Kool View. We can help with your ${lead.projectType || 'project'} request.`, time: 'Just now' },
    ]);
  };

  const sendSms = () => {
    if (!smsText.trim()) return;
    setChatHistory((current) => [...current, { sender: 'us', text: smsText, time: 'Now' }]);
    setSmsText('');
    setTimeout(() => {
      setChatHistory((current) => [...current, { sender: 'them', text: 'Sounds good, thank you.', time: 'Now' }]);
    }, 800);
  };

  const createLead = () => {
    if (!newLead.name || !newLead.phone) {
      showToast('Name and phone are required.');
      return;
    }
    const created = addLead({ ...newLead, status: 'New', time: 'Just now' });
    setSelectedSmsLead(created);
    setIsAddLeadOpen(false);
    setNewLead({ name: '', phone: '', email: '', source: 'Website', address: '', city: '', projectType: 'Transition Living Space', notes: '' });
    showToast(`${created.name} added to the lead pipeline.`);
  };

  const createJobFromLead = (lead) => {
    const job = convertLeadToJob(lead.id);
    if (job) {
      setSelectedLead(null);
      showToast(`${lead.name} converted into ${job.id} and ready for estimate.`);
    }
  };

  return (
    <div className="animate-fade-in">
      {actionMessage && (
        <div className="toast" style={{ backgroundColor: 'var(--success)' }}>
          <CheckCircle2 size={18} /> {actionMessage}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Leads & Scheduling</h1>
          <p className="page-subtitle">Manage new inquiries, schedule site visits, and create jobs/contracts when ready.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddLeadOpen(true)}>
          <UserPlus size={18} /> Add Lead
        </button>
      </div>

      <div className="responsive-grid">
        <div className="span-8">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(190px, 1fr))', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {kanbanColumns.map((column) => {
              const columnLeads = leads.filter((lead) => lead.status === column.title);
              return (
                <div
                  key={column.title}
                  style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '0.75rem', minHeight: '62vh' }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, column.title)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.25rem 0.5rem' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.875rem' }}>{column.title}</h4>
                    <span className={`badge badge-${column.color}`}>{columnLeads.length}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {columnLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="card hover-lift"
                        draggable
                        onDragStart={(event) => handleDragStart(event, lead.id)}
                        onDragEnd={handleDragEnd}
                        style={{ padding: '1rem', cursor: 'grab', borderLeft: `3px solid var(--${column.color})` }}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <h5 style={{ fontWeight: 700, margin: 0, fontSize: '0.875rem' }}>{lead.name}</h5>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{lead.time}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Source: <strong>{lead.source}</strong></p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginBottom: '0.75rem' }}>{lead.projectType}</p>
                        <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }} onClick={(event) => event.stopPropagation()}>
                          <button style={{ color: 'var(--text-muted)', padding: '0.25rem' }} title="Call"><Phone size={14} /></button>
                          <button style={{ color: selectedSmsLead?.id === lead.id ? 'var(--primary)' : 'var(--text-muted)', padding: '0.25rem' }} title="Text" onClick={() => openSmsForLead(lead)}><MessageSquare size={14} /></button>
                          <button style={{ color: 'var(--text-muted)', padding: '0.25rem' }} title="Schedule"><CalendarIcon size={14} /></button>
                        </div>
                      </div>
                    ))}
                    {columnLeads.length === 0 && <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Drag leads here</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="span-4">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '62vh' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>Live SMS Hub</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Chatting with: <strong>{selectedSmsLead?.name || 'No lead selected'}</strong></p>
            </div>
            <div style={{ flex: 1, backgroundColor: 'var(--bg-subtle)', padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {chatHistory.map((message, index) => (
                <div key={`${message.time}-${index}`} style={{
                  alignSelf: message.sender === 'us' ? 'flex-end' : 'flex-start',
                  backgroundColor: message.sender === 'us' ? 'var(--primary)' : 'var(--bg-surface)',
                  color: message.sender === 'us' ? 'white' : 'var(--text-main)',
                  border: message.sender === 'them' ? '1px solid var(--border)' : 'none',
                  padding: '0.75rem',
                  borderRadius: message.sender === 'us' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  fontSize: '0.875rem',
                  maxWidth: '90%',
                }}>
                  {message.text}
                  <div style={{ fontSize: '0.65rem', marginTop: '0.25rem', opacity: 0.75 }}>{message.time}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
              <input className="form-input" value={smsText} onChange={(event) => setSmsText(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendSms()} placeholder="Type SMS message..." />
              <button className="btn btn-primary" style={{ padding: '0.75rem' }} onClick={sendSms}><Send size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title={selectedLead ? `${selectedLead.name} - Lead Details` : 'Lead Details'}
        footer={
          selectedLead && (
            <>
              <button className="btn btn-secondary" onClick={() => setSelectedLead(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => createJobFromLead(selectedLead)} disabled={selectedLead.status === 'Converted'}>
                Create Job/Contract
              </button>
            </>
          )
        }
      >
        {selectedLead && (
          <div className="detail-list">
            <div className="detail-item"><span>Source</span><strong>{selectedLead.source}</strong></div>
            <div className="detail-item"><span>Phone</span><strong>{selectedLead.phone}</strong></div>
            <div className="detail-item"><span>Project</span><strong>{selectedLead.projectType}</strong></div>
            <div className="detail-item"><span>Status</span><strong>{selectedLead.status}</strong></div>
            <div className="detail-item"><span>Address</span><strong>{selectedLead.address || 'Not entered'}, {selectedLead.city || ''}</strong></div>
            <div className="detail-item"><span>Notes</span><strong>{selectedLead.notes || 'No notes'}</strong></div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        title="Add New Lead"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAddLeadOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={createLead}>Save Lead</button>
          </>
        }
      >
        <div className="field-grid">
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={newLead.name} onChange={(event) => setNewLead({ ...newLead, name: event.target.value })} /></div>
          <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={newLead.phone} onChange={(event) => setNewLead({ ...newLead, phone: event.target.value })} /></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" value={newLead.email} onChange={(event) => setNewLead({ ...newLead, email: event.target.value })} /></div>
          <div className="form-group"><label className="form-label">Lead Source</label><select className="form-input" value={newLead.source} onChange={(event) => setNewLead({ ...newLead, source: event.target.value })}><option>Website</option><option>Angie</option><option>Google Ads</option><option>Facebook</option><option>Call-in</option><option>Referral</option></select></div>
          <div className="form-group"><label className="form-label">Project Type</label><input className="form-input" value={newLead.projectType} onChange={(event) => setNewLead({ ...newLead, projectType: event.target.value })} /></div>
          <div className="form-group"><label className="form-label">City</label><input className="form-input" value={newLead.city} onChange={(event) => setNewLead({ ...newLead, city: event.target.value })} /></div>
        </div>
        <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={newLead.address} onChange={(event) => setNewLead({ ...newLead, address: event.target.value })} /></div>
        <div className="form-group"><label className="form-label">Notes</label><textarea className="form-input" rows="3" value={newLead.notes} onChange={(event) => setNewLead({ ...newLead, notes: event.target.value })} /></div>
      </Modal>
    </div>
  );
}
