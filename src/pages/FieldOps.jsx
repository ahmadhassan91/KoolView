import React, { useState } from 'react';
import { Plus, MapPin, Truck, Calendar, Clock, AlertTriangle, CheckSquare, UploadCloud, Play, CloudRain, Package, Smartphone, Edit3, Image as ImageIcon, Map as MapIcon, Loader2 } from 'lucide-react';
import Modal from '../components/Modal';

export default function FieldOps() {
  const [activeDate, setActiveDate] = useState('Today, Oct 24');
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // Lift crews to state so we can dynamically mutate them for the demo
  const [crews, setCrews] = useState([
    {
      id: 'crew-alpha',
      name: 'Crew Alpha (Install)',
      color: 'primary',
      visits: [
        { id: 'V-101', time: '08:00 AM - 12:00 PM', customer: 'Pam Beesly', address: '492 Artist Way', type: 'Sunroom Framework', status: 'In Progress', progress: 40, manifest: ['14x Alum. Extrusions', '8x Glass Panels', '2x Door Frames'], manifestLoaded: true },
        { id: 'V-102', time: '01:00 PM - 04:00 PM', customer: 'Dwight Schrute', address: '101 Farm Rd', type: 'Window Measurements', status: 'Scheduled', progress: 0, manifest: ['Measurement Kit', 'Laser Level'], manifestLoaded: true }
      ]
    },
    {
      id: 'crew-bravo',
      name: 'Crew Bravo (Install)',
      color: 'warning',
      visits: [
        { id: 'V-103', time: '09:00 AM - 02:00 PM', customer: 'Jim Halpert', address: '87 Paper St', type: 'Patio Enclosure', status: 'In Progress', progress: 80, manifest: ['Roofing Sheets 12x', 'Caulk x6', 'Screws (Bulk)'], manifestLoaded: true },
        { id: 'V-104', time: '03:00 PM - 06:00 PM', customer: 'Stanley Hudson', address: '88 Pretzel St', type: 'Awning Delivery', status: 'Delayed', progress: 0, manifest: ['Custom Awning 14ft', 'Mounting Brackets'], manifestLoaded: false }
      ]
    },
    {
      id: 'crew-charlie',
      name: 'Crew Charlie (Service)',
      color: 'success',
      visits: [
        { id: 'V-105', time: '10:00 AM - 11:30 AM', customer: 'Kelly Kapoor', address: '55 Fashion Ln', type: 'Initial Site Survey', status: 'Completed', progress: 100, manifest: ['Drone Camera', 'Tape Measure'], manifestLoaded: true }
      ]
    }
  ]);

  const [simulatedState, setSimulatedState] = useState({
    etaSent: false,
    routingActive: false,
    photoUploaded: false,
    isUploading: false,
    isSigned: false
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return 'badge badge-success';
      case 'In Progress': return 'badge badge-primary';
      case 'Scheduled': return 'badge badge-secondary';
      case 'Delayed': return 'badge badge-danger';
      default: return 'badge badge-secondary';
    }
  };

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 4000);
  };

  const openVisitModal = (visit) => {
    setSelectedVisit(visit);
    // Reset simulation state when opening a new visit, unless it's already completed
    setSimulatedState({
      etaSent: false,
      routingActive: false,
      photoUploaded: visit.status === 'Completed',
      isUploading: false,
      isSigned: visit.status === 'Completed'
    });
  };

  const simulatePhotoUpload = () => {
    setSimulatedState(prev => ({ ...prev, isUploading: true }));
    setTimeout(() => {
      setSimulatedState(prev => ({ ...prev, isUploading: false, photoUploaded: true }));
      showToast("Site photo successfully attached to job file.");
    }, 1500);
  };

  const completeJob = () => {
    if (!simulatedState.isSigned) {
      showToast("Cannot complete! Client signature is required.");
      return;
    }

    // Update the crew array
    const updatedCrews = crews.map(crew => {
      return {
        ...crew,
        visits: crew.visits.map(v => 
          v.id === selectedVisit.id ? { ...v, status: 'Completed', progress: 100 } : v
        )
      };
    });
    
    setCrews(updatedCrews);
    setSelectedVisit(null);
    showToast(`Visit ${selectedVisit.id} marked as Complete and synced to CRM.`);
  };

  return (
    <div className="animate-fade-in relative">
      {/* Toast Notification - High Z-Index to clear Modals */}
      {actionMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '50%',
          transform: 'translateX(50%)',
          backgroundColor: 'var(--success)',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-float)',
          zIndex: 9999,
          animation: 'fadeInDown 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 500
        }}>
          <CheckSquare size={18} /> {actionMessage}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Field Operations</h1>
          <p className="page-subtitle">Dispatch crews, track truck manifests, and manage labor schedules.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-subtle)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
             <CloudRain size={20} color="var(--primary)" />
             <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600 }}>Scranton, PA</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>45°F • 20% Precip (Safe)</p>
             </div>
          </div>

          <button className="btn btn-secondary" onClick={() => showToast('Opening Dispatch Calendar...')}>
            <Calendar size={18} /> {activeDate}
          </button>
          <button className="btn btn-primary" onClick={() => showToast('Routing to New Dispatch Tool...')}>
            <Truck size={18} /> Dispatch Crew
          </button>
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
                    onClick={() => openVisitModal(visit)}
                  >
                    <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', backgroundColor: `var(--${crew.color})`, width: `${visit.progress}%` }}></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                       <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}><Clock size={10} style={{marginRight: '4px'}}/>{visit.time}</span>
                       <span className={getStatusBadge(visit.status)}>{visit.status}</span>
                    </div>
                    
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem' }}>{visit.type}</h4>
                    <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.875rem', fontWeight: 500 }}>{visit.customer}</p>
                    
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                       <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                       <span>{visit.address}</span>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: visit.manifestLoaded ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                          <Package size={12} /> 
                          {visit.manifestLoaded ? 'Truck Loaded' : 'Missing Materials'}
                       </div>
                       <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px' }}>{visit.manifest.length} Items</span>
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
               }} className="hover-lift" onClick={() => showToast(`Opening unallocated stop assignment for ${crew.name}`)}>
                 <Plus size={16} /> Add Stop
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Field Worker App Simulation Modal */}
      {selectedVisit && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg-page)', padding: 0 }}>
             
             {/* iPad Header */}
             <div style={{ padding: '1rem 1.5rem', backgroundColor: 'black', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Site Execution: {selectedVisit.id}</h3>
                <button style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => setSelectedVisit(null)}>Close</button>
             </div>

             <div style={{ padding: '1.5rem' }}>
                
                {/* Geolocation & Routing */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                   <div>
                      <h2 style={{ margin: '0 0 0.25rem 0' }}>{selectedVisit.customer}</h2>
                      <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--primary)' }}>{selectedVisit.type}</p>
                      <p style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                         <MapPin size={14} style={{ marginTop: '2px' }} />
                         {selectedVisit.address}
                      </p>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {simulatedState.routingActive ? (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', backgroundColor: 'var(--primary-light)' }}>
                            <MapIcon size={14} /> Navigating (12 mins)
                         </div>
                      ) : (
                         <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }} onClick={() => setSimulatedState({...simulatedState, routingActive: true})}>
                           <Play size={14} /> Start Route
                         </button>
                      )}
                      
                      {simulatedState.etaSent ? (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontWeight: 600, fontSize: '0.875rem', backgroundColor: 'white' }}>
                            <CheckSquare size={14} /> ETA Sent
                         </div>
                      ) : (
                        <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', padding: '0.5rem 1rem' }} onClick={() => { setSimulatedState({...simulatedState, etaSent: true}); showToast(`Automated ETA Text sent to ${selectedVisit.customer}`); }}>
                           <Smartphone size={14} /> Send ETA Text
                        </button>
                      )}
                   </div>
                </div>

                {/* Job Manifest Validation */}
                <div style={{ marginBottom: '1.5rem' }}>
                   <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Package size={16} color="var(--primary)" /> Material Manifest Lock
                   </h4>
                   <div style={{ backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem', border: `1px solid ${selectedVisit.manifestLoaded ? 'var(--success)' : 'var(--danger)'}` }}>
                      <ul style={{ margin: 0, padding: '0 0 0 1.5rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                         {selectedVisit.manifest.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '0.25rem' }}>{item}</li>
                         ))}
                      </ul>
                      {!selectedVisit.manifestLoaded && (
                         <div style={{ marginTop: '1rem', color: 'var(--danger)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <AlertTriangle size={14} /> Warning: Required materials missing from Truck Inventory.
                         </div>
                      )}
                   </div>
                </div>

                <div className="form-group">
                    <label className="form-label">On-Site Media</label>
                    {simulatedState.photoUploaded ? (
                        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                           <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ImageIcon color="var(--text-muted)" />
                           </div>
                           <div>
                              <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, fontSize: '0.875rem' }}>site_install_1.jpg</p>
                              <p style={{ margin: 0, color: 'var(--success)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckSquare size={12}/> Sync Complete</p>
                           </div>
                        </div>
                    ) : (
                        <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', cursor: 'pointer', transition: 'var(--transition)' }} className="hover-lift" onClick={simulatePhotoUpload}>
                           {simulatedState.isUploading ? (
                              <Loader2 size={24} className="animate-spin" style={{ marginBottom: '0.5rem', color: 'var(--primary)' }} />
                           ) : (
                              <UploadCloud size={24} style={{ marginBottom: '0.5rem' }} />
                           )}
                           <p style={{ margin: 0, fontSize: '0.875rem' }}>{simulatedState.isUploading ? 'Uploading to cloud...' : 'Tap to capture Before/After photos'}</p>
                        </div>
                    )}
                </div>
                
                {/* Advanced Digital Signature Canvas Mockup */}
                <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                   <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Edit3 size={16} color="var(--primary)" /> Client Sign-Off
                   </h4>
                   
                   <div style={{ width: '100%', height: '120px', backgroundColor: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: simulatedState.isSigned ? 'default' : 'pointer' }} onClick={() => !simulatedState.isSigned && setSimulatedState({...simulatedState, isSigned: true})}>
                      {simulatedState.isSigned ? (
                         <img src={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80"><path d="M10 40 Q 60 10 100 50 T 190 30" fill="transparent" stroke="black" stroke-width="2"/></svg>`} alt="Signature" style={{ opacity: 0.8 }} />
                      ) : (
                         <span style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontStyle: 'italic' }}>Tap here to sign</span>
                      )}
                      <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', height: '1px', backgroundColor: 'var(--border)' }}></div>
                   </div>

                   <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      By signing, {selectedVisit.customer} acknowledges satisfactory completion of work as outlined in quote '{selectedVisit.type}'.
                   </p>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center' }} onClick={() => showToast('Delay warning sent to operations.')}>
                    <AlertTriangle size={16} /> Report Delay
                  </button>
                  <button className="btn btn-primary" style={{ flex: 2, display: 'flex', justifyContent: 'center' }} onClick={completeJob}>
                    <CheckSquare size={16} /> Complete & Sync
                  </button>
                </div>

             </div>
          </div>
        </div>
      )}

    </div>
  );
}
