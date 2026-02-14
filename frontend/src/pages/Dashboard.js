import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiClock, FiCheckCircle, FiXCircle, FiBriefcase } from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await axios.get('applications');
      setApplications(data.applications);

      // #region agent log
      if (typeof fetch !== 'undefined') {
        fetch('http://127.0.0.1:7242/ingest/0e7bbb6d-51ac-4f13-911d-de5f9a6bdf29', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `log_${Date.now()}_DASHBOARD_FETCH_SUCCESS`,
            runId: 'pre-fix-1',
            hypothesisId: 'H4',
            location: 'frontend/src/pages/Dashboard.js:17',
            message: 'Dashboard fetched applications',
            data: {
              userId: user?._id,
              role: user?.role,
              count: data?.applications?.length || 0
            },
            timestamp: Date.now()
          })
        }).catch(() => {});
      }
      // #endregion
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock />;
      case 'reviewing': return <FiClock />;
      case 'shortlisted': return <FiCheckCircle />;
      case 'interview': return <FiCheckCircle />;
      case 'offered': return <FiCheckCircle />;
      case 'rejected': return <FiXCircle />;
      default: return <FiBriefcase />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'reviewing': return '#3B82F6';
      case 'shortlisted': return '#8B5CF6';
      case 'interview': return '#10B981';
      case 'offered': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const filteredApplications = filter === 'all'
    ? applications
    : applications.filter(app => app.status === filter);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page container" style={{ padding: '80px 24px' }}>
      <h1>My Applications</h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: '32px' }}>
        Track your job applications
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'reviewing', 'interview', 'offered', 'rejected'].map(status => (
          <button
            key={status}
            className={`btn ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filteredApplications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h3>No applications found</h3>
          <p>Start applying to jobs to see them here</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredApplications.map((app, index) => (
            <motion.div
              key={app._id}
              className="card"
              style={{ padding: '24px' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
                <div>
                  <h3>{app.job?.title}</h3>
                  <p style={{ color: 'var(--gray-600)', marginTop: '4px' }}>
                    {app.job?.company}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', marginTop: '8px' }}>
                    Applied on {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: `${getStatusColor(app.status)}20`,
                  color: getStatusColor(app.status),
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}>
                  {getStatusIcon(app.status)}
                  {app.status}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
