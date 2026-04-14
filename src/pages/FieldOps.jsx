import React, { useState } from 'react';
import { Plus, MapPin, Truck, Calendar, Clock, AlertTriangle, CheckSquare, UploadCloud, Play } from 'lucide-react';
import Modal from '../components/Modal';

export default function FieldOps() {
  const [activeDate, setActiveDate] = useState('Today, Oct 24');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const crews = [
    {
      id: 'crew-alpha',
      name: 'Crew Alpha (Install)',
      color: 'primary',
      visits: [
        { id: 'V-101', time: '08:00 AM - 12:00 PM', customer: 'Pam Beesly', address: '492 Artist Way', type: 'Sunroom Framework', status: 'In Progress', progress: 40 },
        { id: 'V-102', time: '01:00 PM - 04:00 PM', customer: 'Dwight Schrute', address: '101 Farm Rd', type: 'Window Measurements', status: 'Scheduled', progress: 0 }
      ]
    },
    {
      id: 'crew-bravo',
      name: 'Crew Bravo (Install)',
      color: 'warning',
      visits: [
        { id: 'V-103', time: '09:00 AM - 02:00 PM', customer: 'Jim Halpert', address: '87 Paper St', type: 'Patio Enclosure', status: 'In Progress', progress: 80 },
        { id: 'V-104', time: '03:00 PM - 06:00 PM', customer: 'Stanley Hudson', address: '88 Pretzel St', type: 'Awning Delivery', status: 'Scheduled', progress: 0 }
      ]
    },
    {
      id: 'crew-charlie',
      name: 'Crew Charlie (Service/Quote)',
      color: 'success',
      visits: [
        { id: 'V-105', time: '10:00 AM - 11:30 AM', customer: 'Kelly Kapoor', address: '55 Fashion Ln', type: 'Initial Site Survey', status: 'Completed', progress: 100 }
      ]
    }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return 'badge badge-success';
      case 'In Progress': return 'badge badge-primary';
      case 'Scheduled': return 'badge badge-secondary';
      case 'Delayed': return 'badge badge-danger';
      default: return 'badge badge-secondary';
    }
  };

  const handleAction = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  return (
    <div className="animate-fade-in relative">
      {/* Toast */}
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
          <h1 className="page-title">Field Operations</h1>
          <p className="page-subtitle">Dispatch crews, track site visits, and manage labor schedules.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary">
            <Calendar size={18} /> {activeDate}
          </button>
          <button className="btn btn-primary">
            <Truck size={18} /> Dispatch Crew
          </button>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Active Crews</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>3</h3>
             <span style={{ fontSize: '0.875rem', color: 'var(--success)' }}>100% Deployed</span>
          </div>
        </div>
        <div className="card" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Total Visits Today</p>
          <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>5</h3>
        </div>
        <div className="card" style={{ gridColumn: 'span 4', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Completed</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <h3 style={{ fontSize: '2rem', fontWeight: 700 }}>1</h3>
             <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)' }}>
                <div style={{ width: '20%', height: '100%', backgroundColor: 'var(--text-main)', borderRadius: 'var(--radius-full)' }}></div>
             </div>
          </div>
        </div>
      </div>

      {/* Dispatch Board */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', overflowX: 'auto' }}>
        {crews.map(crew => (
          <div key={crew.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `4px solid var(--${crew.color})` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ backgroundColor: `var(--${crew.color}-light)`, color: `var(--${crew.color})`, padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                  <Truck size={18} />
                </div>
                <h3 style={{ fontSize: '1.125rem', margin: 0 }}>{crew.name}</h3>
              </div>
              <span className="badge badge-secondary">{crew.visits.length} Stops</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
               {crew.visits.map(visit => (
                  <div 
                    key={visit.id} 
                    style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', transition: 'var(--transition)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                    className="hover-lift"
                    onClick={() => setSelectedVisit(visit)}
                  >
                    {/* Progress Bar Background */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', backgroundColor: `var(--${crew.color})`, width: `${visit.progress}%` }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                       <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}><Clock size={10} style={{marginRight: '4px'}}/>{visit.time}</span>
                       <span className={getStatusBadge(visit.status)}>{visit.status}</span>
                    </div>
                    
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{visit.type}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: 500 }}>{visit.customer}</p>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                       <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                       <span>{visit.address}</span>
                    </div>
                  </div>
               ))}
               
               <button style={{ 
                  marginTop: 'auto', 
                  border: '1px dashed var(--border)', 
                  backgroundColor: 'var(--bg-subtle)', 
                  color: 'var(--text-muted)', 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.875rem'
               }} className="hover-lift">
                 <Plus size={16} /> Add Stop
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Field Worker App Simulation Modal */}
      <Modal 
        isOpen={!!selectedVisit} 
        onClose={() => setSelectedVisit(null)} 
        title={`Field Report: ${selectedVisit?.id}`}
        footer={
          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => handleAction(`Delay notice sent to ${selectedVisit?.customer}`)}>
              <AlertTriangle size={16} /> Report Delay
            </button>
            <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => { handleAction(`Visit ${selectedVisit?.id} marked as complete.`); setSelectedVisit(null); }}>
              <CheckSquare size={16} /> Mark Complete
            </button>
          </div>
        }
      >
        {selectedVisit && (
          <div>
            <div style={{ backgroundColor: 'black', color: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
               <h2 style={{ margin: '0 0 0.5rem 0' }}>{selectedVisit.type}</h2>
               <p style={{ fontSize: '0.875rem', opacity: 0.8, margin: '0 0 1rem 0' }}>{selectedVisit.customer}</p>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                   <MapPin color="var(--primary)" />
                   <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.4 }}>{selectedVisit.address}<br/><span style={{ opacity: 0.6 }}>Navigate to site...</span></p>
                 </div>
                 <button style={{ backgroundColor: 'var(--primary)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
                   <Play size={18} style={{ marginLeft: '2px' }} />
                 </button>
               </div>
            </div>

            <div className="form-group">
                <label className="form-label">On-Site Notes</label>
                <textarea className="form-input" rows="4" placeholder="Enter findings, progress updates, or issues..." defaultValue={selectedVisit.status === 'Completed' ? "Customer signed off on initial measurements. Structure looks sound for standard track bracket." : ""}></textarea>
            </div>

            <div className="form-group">
                <label className="form-label">Site Photos</label>
                <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                   <UploadCloud size={32} style={{ marginBottom: '0.5rem' }} />
                   <p style={{ margin: 0, fontSize: '0.875rem' }}>Tap to capture or upload photos</p>
                </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
                <input type="checkbox" defaultChecked={selectedVisit.status === 'Completed'} style={{ width: '18px', height: '18px' }} />
                Customer Signature Collected
              </label>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
