import React, { useState } from 'react';
import { Upload, Folder, FileText, FileImage, FileCode2, Search, Filter, MoreVertical, Download } from 'lucide-react';

export default function Documents() {
  const [activeProperty, setActiveProperty] = useState('All Properties');

  const properties = ['All Properties', '492 Artist Way', '101 Farm Rd', '87 Paper St', '88 Pretzel St'];

  const documents = [
    { id: 1, name: 'Building_Permit_Approved.pdf', type: 'pdf', size: '2.4 MB', property: '492 Artist Way', date: 'Oct 24, 2023', author: 'Dorothy' },
    { id: 2, name: 'Initial_Measurements.xlsx', type: 'excel', size: '156 KB', property: '101 Farm Rd', date: 'Oct 15, 2023', author: 'Michael Tech' },
    { id: 3, name: 'Site_Photos_Before.zip', type: 'zip', size: '14.2 MB', property: '87 Paper St', date: 'Sep 30, 2023', author: 'Jim H.' },
    { id: 4, name: 'Signed_Contract_Hudson.pdf', type: 'pdf', size: '1.1 MB', property: '88 Pretzel St', date: 'Oct 02, 2023', author: 'Dorothy' },
    { id: 5, name: 'Factory_Order_Specs.pdf', type: 'pdf', size: '4.8 MB', property: '101 Farm Rd', date: 'Oct 20, 2023', author: 'Dwight S.' },
  ];

  const getFileIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="text-danger" size={24} color="var(--danger)" />;
      case 'excel': return <FileCode2 className="text-success" size={24} color="var(--success)" />;
      case 'zip': return <Folder className="text-primary" size={24} color="var(--primary)" />;
      default: return <FileText size={24} color="var(--text-muted)" />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Document Hub</h1>
          <p className="page-subtitle">FileCenter Replacement: Documents organized by property address.</p>
        </div>
        <button className="btn btn-primary">
          <Upload size={18} /> Upload Document
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2.5fr) minmax(0, 9.5fr)', gap: '1.5rem', height: '65vh' }}>
        {/* Properties Sidebar (Folders) */}
        <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Filter address..." style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.875rem', outline: 'none' }} />
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.5rem', letterSpacing: '0.05em' }}>Addresses</p>
            {properties.map(prop => (
              <button 
                key={prop}
                onClick={() => setActiveProperty(prop)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  padding: '0.5rem 0.75rem', 
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: activeProperty === prop ? 'var(--primary-light)' : 'transparent',
                  color: activeProperty === prop ? 'var(--primary-hover)' : 'var(--text-main)',
                  fontWeight: activeProperty === prop ? 600 : 500,
                  fontSize: '0.875rem',
                  textAlign: 'left',
                  transition: 'var(--transition)'
                }}
              >
                <Folder size={16} fill={activeProperty === prop ? 'currentColor' : 'transparent'} /> 
                {prop}
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{activeProperty}</h3>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search files..." style={{ padding: '0.5rem 1rem 0.5rem 2rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: '0.875rem' }} />
              </div>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem' }}>
                <Filter size={16} /> Filter
              </button>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Property</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Added By</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Size</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600, width: '80px' }}></th>
                </tr>
              </thead>
              <tbody>
                {documents.filter(d => activeProperty === 'All Properties' || d.property === activeProperty).map(doc => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--bg-subtle)', transition: 'var(--transition)' }} className="hover-lift">
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {getFileIcon(doc.type)}
                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{doc.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{doc.property}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>{doc.author}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{doc.date}</td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{doc.size}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ color: 'var(--text-muted)', padding: '0.25rem' }} title="Download">
                          <Download size={16} />
                        </button>
                        <button style={{ color: 'var(--text-muted)', padding: '0.25rem' }}>
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {documents.filter(d => activeProperty === 'All Properties' || d.property === activeProperty).length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <Folder size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
                      <p>No documents found for this property.</p>
                      <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>Upload Document</button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
