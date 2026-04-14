import React, { useState } from 'react';
import { Plus, Filter, Search, MoreVertical, FileText, CircleDollarSign } from 'lucide-react';
import Modal from '../components/Modal';

export default function Jobs() {
  const [activeTab, setActiveTab] = useState('active');
  const [selectedJob, setSelectedJob] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const [jobs, setJobs] = useState([
    { id: '4492', customer: 'Pam Beesly', address: '492 Artist Way', type: 'Sunroom', status: 'Awaiting Permit', nextAction: 'City Approval', progress: 25 },
    { id: '4493', customer: 'Dwight Schrute', address: '101 Farm Rd', type: 'Window Replacement', status: 'Factory Order', nextAction: 'Delivery Confirmation', progress: 60 },
    { id: '4494', customer: 'Jim Halpert', address: '87 Paper St', type: 'Patio Enclosure', status: 'Installation', nextAction: 'Final Inspection', progress: 85 },
    { id: '4495', customer: 'Stanley Hudson', address: '88 Pretzel St', type: 'Awning', status: 'Deposit Billed', nextAction: 'Measure & Specs', progress: 10 },
  ]);

  const getStatusBadge = (status) => {
    const map = {
      'Deposit Billed': 'primary',
      'Awaiting Permit': 'warning',
      'Factory Order': 'primary',
      'Installation': 'warning',
      'Completed': 'success'
    };
    return `badge badge-${map[status] || 'secondary'}`;
  };

  const showToast = (msg) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleAction = (e, actionType, job) => {
    e.stopPropagation(); // prevent opening the job details modal
    if (actionType === 'doc') {
      showToast(`Reviewing attached documents for Job #${job.id}`);
    } else if (actionType === 'invoice') {
      showToast(`Generating auto-filled invoice for Job #${job.id}`);
    } else if (actionType === 'more') {
      showToast(`Opening advanced options for Job #${job.id}`);
    }
  };

  const JobTimeline = ({ job }) => {
    const milestones = [
      { key: 'Deposit Billed', label: '1. Deposit Billed' },
      { key: 'Awaiting Permit', label: '2. Permit Procurement' },
      { key: 'Factory Order', label: '3. Factory Order Placed' },
      { key: 'Installation', label: '4. Installation Phase' },
      { key: 'Completed', label: '5. Post-Install & Final Bill' }
    ];

    let currentPassed = false;
    
    return (
      <div className="timeline">
        {milestones.map((m, idx) => {
          const isCurrent = m.key === job.status;
          const isCompleted = milestones.findIndex(ms => ms.key === job.status) > idx;

          let itemClass = 'timeline-item';
          if (isCurrent) itemClass += ' active';
          if (isCompleted) itemClass += ' completed';

          return (
            <div key={m.key} className={itemClass}>
              <div className="timeline-dot"></div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ margin: 0, fontWeight: isCurrent ? 700 : 500, color: (isCurrent || isCompleted) ? 'var(--text-main)' : 'var(--text-muted)' }}>{m.label}</h5>
                {isCurrent && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Next Action: {job.nextAction}</p>}
                {isCompleted && <p style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Completed</p>}
              </div>
            </div>
          );
        })}
      </div>
    );
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
          <h1 className="page-title">Production Jobs</h1>
          <p className="page-subtitle">Track job progress, milestones, and production pipeline.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setSelectedJob({ isNew: true })}>
          <Plus size={18} /> New Job
        </button>
      </div>

      <div className="card" style={{ padding: '0' }}>
        {/* Table Toolbar */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              style={{ fontWeight: 500, color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'active' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem' }}
              onClick={() => setActiveTab('active')}
            >
              Active Jobs (30)
            </button>
            <button 
              style={{ fontWeight: 500, color: activeTab === 'completed' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: activeTab === 'completed' ? '2px solid var(--primary)' : 'none', paddingBottom: '0.5rem' }}
              onClick={() => setActiveTab('completed')}
            >
              Completed
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search jobs..." style={{ padding: '0.5rem 1rem 0.5rem 2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
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
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Job ID</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Customer / Address</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Project Type</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Current Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Progress</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr 
                  key={job.id} 
                  style={{ borderBottom: '1px solid var(--border)', transition: 'var(--transition)', cursor: 'pointer' }} 
                  className="hover-lift"
                  onClick={() => setSelectedJob(job)}
                >
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>#{job.id}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 500 }}>{job.customer}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.address}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{job.type}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={getStatusBadge(job.status)}>{job.status}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Next: {job.nextAction}</div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', width: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ width: `${job.progress}%`, height: '100%', backgroundColor: 'var(--success)', borderRadius: 'var(--radius-full)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>{job.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={(e) => handleAction(e, 'doc', job)} style={{ padding: '0.25rem', color: 'var(--text-muted)', transition: 'color 0.2s', cursor: 'pointer' }} title="View Documents">
                        <FileText size={18} />
                      </button>
                      <button onClick={(e) => handleAction(e, 'invoice', job)} style={{ padding: '0.25rem', color: 'var(--primary)', transition: 'color 0.2s', cursor: 'pointer' }} title="Generate Invoice">
                        <CircleDollarSign size={18} />
                      </button>
                      <button onClick={(e) => handleAction(e, 'more', job)} style={{ padding: '0.25rem', color: 'var(--text-muted)', transition: 'color 0.2s', cursor: 'pointer' }} title="More Options">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Job Tracker Modal */}
      <Modal 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)} 
        title={selectedJob?.isNew ? 'Create New Job' : `Job Timeline: ${selectedJob?.address}`}
        footer={
          selectedJob?.isNew ? 
            <><button className="btn btn-secondary" onClick={() => setSelectedJob(null)}>Cancel</button><button className="btn btn-primary" onClick={() => setSelectedJob(null)}>Create Job</button></> 
            : <button className="btn btn-primary" onClick={() => setSelectedJob(null)}>Update Status</button>
        }
      >
        {selectedJob?.isNew ? (
          <div>
             <div className="form-group">
                <label className="form-label">Link Lead (Optional)</label>
                <select className="form-input">
                  <option>-- Select Linked Lead --</option>
                  <option>Kelly Kapoor</option>
                  <option>Oscar Martinez</option>
                </select>
             </div>
             <div className="form-group">
                <label className="form-label">Property Address</label>
                <input type="text" className="form-input" placeholder="e.g. 123 Main St" />
             </div>
             <div className="form-group">
                <label className="form-label">Project Type</label>
                <select className="form-input">
                  <option>Sunroom installation</option>
                  <option>Window Replacement</option>
                  <option>Patio Enclosure</option>
                </select>
             </div>
          </div>
        ) : (
          <div>
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer</p>
                <p style={{ fontWeight: 600 }}>{selectedJob?.customer}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project</p>
                <p style={{ fontWeight: 600 }}>{selectedJob?.type}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Status</p>
                <p className={getStatusBadge(selectedJob?.status)}>{selectedJob?.status}</p>
              </div>
            </div>

            <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Production Milestones</h4>
            {selectedJob && <JobTimeline job={selectedJob} />}
          </div>
        )}
      </Modal>

    </div>
  );
}
