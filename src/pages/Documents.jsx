import React, { useMemo, useState } from 'react';
import { Download, FileCode2, FileImage, FileText, Filter, Folder, MoreVertical, Search, Upload } from 'lucide-react';
import Modal from '../components/Modal';
import { useKoolViewData } from '../state/useKoolViewData';
import { formatDate } from '../utils/koolViewCalculations';

const drawers = [
  'Active',
  'Customers',
  'Rooms',
  'Decks',
  'Awnings',
  'Repairs',
  'Service',
  'Windows',
  'Cancelled Jobs',
  'Unsigned Contracts',
];

const fileIcon = (type) => {
  if (type === 'pdf') return <FileText size={22} color="var(--danger)" />;
  if (type === 'excel') return <FileCode2 size={22} color="var(--success)" />;
  if (type === 'image') return <FileImage size={22} color="var(--primary)" />;
  return <Folder size={22} color="var(--primary)" />;
};

export default function Documents() {
  const { documents, jobs, addDocument } = useKoolViewData();
  const [activeDrawer, setActiveDrawer] = useState('Active');
  const [documentMode, setDocumentMode] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [uploadForm, setUploadForm] = useState({
    jobId: jobs[0]?.id || '',
    type: 'pdf',
    name: '',
    category: 'Rooms',
    notes: '',
  });

  const showToast = (message) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(''), 3000);
  };

  const filteredDocuments = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return documents.filter((document) => {
      const modeMatches = documentMode === 'current' ? document.status === 'Current' : document.status === 'Past';
      const drawerMatches = activeDrawer === 'Active'
        ? document.folderPath?.startsWith('Active') || document.status === 'Current'
        : document.category === activeDrawer || document.folderPath?.toLowerCase().includes(activeDrawer.toLowerCase());
      const searchMatches = !normalized || [
        document.name,
        document.customerName,
        document.lookupAddress,
        document.folderPath,
        document.category,
        document.jobId,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(normalized));
      return modeMatches && drawerMatches && searchMatches;
    });
  }, [activeDrawer, documentMode, documents, searchTerm]);

  const groups = useMemo(() => {
    return filteredDocuments.reduce((result, document) => {
      const key = documentMode === 'current'
        ? `${document.customerName || 'Unknown Customer'} / ${document.jobId || 'No Job'}`
        : `${document.lookupAddress || 'Unknown Address'} / ${document.category || 'Uncategorized'}`;
      result[key] = (result[key] || 0) + 1;
      return result;
    }, {});
  }, [documentMode, filteredDocuments]);

  const submitUpload = () => {
    const job = jobs.find((item) => item.id === uploadForm.jobId);
    if (!uploadForm.name || !job) {
      showToast('Choose a job and enter a file name.');
      return;
    }

    addDocument({
      jobId: job.id,
      customerId: job.customerId,
      customerName: job.customerName,
      name: uploadForm.name,
      type: uploadForm.type,
      category: uploadForm.category,
      lookupAddress: job.address,
      folderPath: `${job.documentFolder}/${uploadForm.name}`,
      notes: uploadForm.notes,
    });
    setIsUploadOpen(false);
    setUploadForm({ jobId: jobs[0]?.id || '', type: 'pdf', name: '', category: 'Rooms', notes: '' });
    showToast('POC document row added. Real file storage is a later backend step.');
  };

  return (
    <div className="animate-fade-in">
      {actionMessage && <div className="toast">{actionMessage}</div>}

      <div className="page-header">
        <div>
          <h1 className="page-title">Document Hub</h1>
          <p className="page-subtitle">FileCenter-style current jobs by customer, past jobs by address and category.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsUploadOpen(true)}>
          <Upload size={18} /> Upload Document
        </button>
      </div>

      <div className="responsive-grid">
        <div className="span-3">
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>FileCenter Drawers</p>
            </div>
            <div style={{ display: 'grid', gap: '0.25rem' }}>
              {drawers.map((drawer) => (
                <button
                  key={drawer}
                  onClick={() => setActiveDrawer(drawer)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.7rem',
                    padding: '0.65rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: activeDrawer === drawer ? 'var(--primary-light)' : 'transparent',
                    color: activeDrawer === drawer ? 'var(--primary-hover)' : 'var(--text-main)',
                    fontWeight: activeDrawer === drawer ? 700 : 500,
                    textAlign: 'left',
                  }}
                >
                  <Folder size={16} fill={activeDrawer === drawer ? 'currentColor' : 'transparent'} /> {drawer}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              {documentMode === 'current' ? 'Current Job Groups' : 'Past Address Groups'}
            </p>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {Object.entries(groups).map(([group, count]) => (
                <div key={group} style={{ fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <span>{group}</span>
                  <strong>{count}</strong>
                </div>
              ))}
              {Object.keys(groups).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No groups in this view.</p>}
            </div>
          </div>
        </div>

        <div className="span-9">
          <div className="card">
            <div className="section-toolbar">
              <div>
                <h3>{activeDrawer}</h3>
                <p>{documentMode === 'current' ? 'New and active jobs organized by customer/job.' : 'Finished jobs searchable by street address and category.'}</p>
              </div>
              <div className="section-actions">
                <button className={`btn ${documentMode === 'current' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDocumentMode('current')}>Current Jobs</button>
                <button className={`btn ${documentMode === 'past' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setDocumentMode('past')}>Past Jobs</button>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search address, file, job..." style={{ paddingLeft: '2rem', width: '230px' }} />
                </div>
                <button className="btn btn-secondary" onClick={() => showToast('Filters are represented by drawers and current/past mode in this POC.')}>
                  <Filter size={16} /> Filter
                </button>
              </div>
            </div>

            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Customer / Address</th>
                    <th>Job</th>
                    <th>Category</th>
                    <th>Folder Path</th>
                    <th>Added By</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((document) => (
                    <tr key={document.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
                          {fileIcon(document.type)}
                          <span>{document.name}</span>
                        </div>
                      </td>
                      <td>
                        <strong>{documentMode === 'current' ? document.customerName : document.lookupAddress}</strong>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{document.lookupAddress}</div>
                      </td>
                      <td>{document.jobId}</td>
                      <td>{document.category}</td>
                      <td title={document.folderPath} style={{ maxWidth: '260px' }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{document.folderPath}</span>
                      </td>
                      <td>{document.addedBy}</td>
                      <td>{formatDate(document.addedDate)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button style={{ color: 'var(--text-muted)' }} title="Download"><Download size={16} /></button>
                          <button style={{ color: 'var(--text-muted)' }} title="More"><MoreVertical size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredDocuments.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <Folder size={42} style={{ opacity: 0.35, marginBottom: '1rem' }} />
                        <p>No documents found for this FileCenter view.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Add Document Row"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsUploadOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitUpload}>Add POC Document</button>
          </>
        }
      >
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>This POC adds a document record only. Real file upload/storage is part of backend implementation.</p>
        <div className="form-group">
          <label className="form-label">Job</label>
          <select className="form-input" value={uploadForm.jobId} onChange={(event) => setUploadForm({ ...uploadForm, jobId: event.target.value })}>
            {jobs.map((job) => <option key={job.id} value={job.id}>{job.id} - {job.customerName}</option>)}
          </select>
        </div>
        <div className="field-grid">
          <div className="form-group">
            <label className="form-label">Document Type</label>
            <select className="form-input" value={uploadForm.type} onChange={(event) => setUploadForm({ ...uploadForm, type: event.target.value })}>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="excel">Excel</option>
              <option value="zip">Zip</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-input" value={uploadForm.category} onChange={(event) => setUploadForm({ ...uploadForm, category: event.target.value })}>
              <option>Rooms</option>
              <option>Decks</option>
              <option>Awnings</option>
              <option>Windows</option>
              <option>Service</option>
              <option>Repairs</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">File Name</label>
          <input className="form-input" value={uploadForm.name} onChange={(event) => setUploadForm({ ...uploadForm, name: event.target.value })} placeholder="Signed_Contract.pdf" />
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-input" rows="3" value={uploadForm.notes} onChange={(event) => setUploadForm({ ...uploadForm, notes: event.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
