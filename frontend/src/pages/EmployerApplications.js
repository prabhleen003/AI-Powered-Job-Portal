import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  FiArrowLeft, FiCheckCircle, FiXCircle, FiMessageSquare,
  FiDownload, FiClock, FiUser, FiMail, FiFilter
} from 'react-icons/fi';
import './EmployerApplications.css';

const EmployerApplications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    let filtered = applications;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Filter by job
    if (jobFilter !== 'all') {
      filtered = filtered.filter(app => app.job?._id === jobFilter);
    }

    setFilteredApplications(filtered);
  }, [statusFilter, jobFilter, applications]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/applications');
      setApplications(data.applications || []);
    } catch (error) {
      toast.error('Error fetching applications');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const { data } = await axios.put(`applications/${applicationId}`, {
        status: newStatus
      });
      
      setApplications(applications.map(app => 
        app._id === applicationId ? data.application : app
      ));
      
      toast.success(`Application ${newStatus}!`);
    } catch (error) {
      toast.error('Error updating application status');
      console.error(error);
    }
  };

  const handleMessage = async (applicationId, applicantId) => {
    if (!messageText.trim()) {
      toast.error('Please write a message');
      return;
    }

    setSendingMessage(true);
    try {
      await axios.post('/messages', {
        receiver: applicantId,
        subject: 'Regarding your job application',
        content: messageText,
        application: applicationId
      });

      toast.success('Message sent!');
      setMessageText('');
      setSelectedApp(null);
      navigate('/messages');
    } catch (error) {
      toast.error('Error sending message');
      console.error(error);
    } finally {
      setSendingMessage(false);
    }
  };

  const downloadResume = (resumeData, applicantName) => {
    try {
      const link = document.createElement('a');
      link.href = resumeData;
      link.download = `${applicantName}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Error downloading resume');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'applied':
        return '#F59E0B'; // Orange
      case 'under_review':
        return '#3B82F6'; // Blue
      case 'waitlist':
        return '#8B5CF6'; // Purple
      case 'accepted':
        return '#10B981'; // Green
      case 'rejected':
        return '#EF4444'; // Red
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'applied': 'Applied',
      'under_review': 'Under Review',
      'waitlist': 'Waitlist',
      'accepted': 'Accepted',
      'rejected': 'Rejected',
      'withdrawn': 'Withdrawn'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="employer-applications-page">
      <div className="container">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft /> Back
          </button>
          <h1>Job Applications</h1>
          <p>{filteredApplications.length} applications</p>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-group">
            <FiFilter />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="all">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="under_review">Under Review</option>
              <option value="waitlist">Waitlist</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <FiFilter />
            <select
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
              className="job-filter"
            >
              <option value="all">All Jobs</option>
              {[...new Map(applications.map(app => [app.job?._id, app.job])).values()]
                .filter(job => job)
                .map(job => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Applications List */}
        <div className="applications-list">
          {filteredApplications.length === 0 ? (
            <div className="no-applications">
              <FiMessageSquare />
              <p>No applications yet</p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <motion.div
                key={app._id}
                className="application-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="application-header">
                  <div className="applicant-info">
                    <img 
                      src={app.applicant?.avatar || 'https://via.placeholder.com/48'} 
                      alt={app.applicant?.name}
                      className="applicant-avatar"
                    />
                    <div className="applicant-details">
                      <h3>{app.applicant?.name}</h3>
                      <p className="email">
                        <FiMail /> {app.applicant?.email}
                      </p>
                      <p className="job-title">
                        Applied for: <strong>{app.job?.title}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="application-meta">
                    <div className="status-badge" style={{ borderColor: getStatusColor(app.status) }}>
                      <span className="status-dot" style={{ backgroundColor: getStatusColor(app.status) }}></span>
                      {getStatusLabel(app.status)}
                    </div>
                    <div className="apply-date">
                      <FiClock />
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="application-content">
                  <div className="cover-letter-section">
                    <h4>Cover Letter</h4>
                    <p className="cover-letter-text">{app.coverLetter}</p>
                  </div>
                </div>

                <div className="application-actions">
                  <button
                    className="action-btn resume-btn"
                    onClick={() => downloadResume(app.resume, app.applicant?.name)}
                    title="Download Resume"
                  >
                    <FiDownload /> Resume
                  </button>

                  {/* Status-based action buttons */}
                  {app.status === 'applied' && (
                    <button
                      className="action-btn review-btn"
                      onClick={() => handleStatusChange(app._id, 'under_review')}
                    >
                      <FiCheckCircle /> Move to Review
                    </button>
                  )}

                  {app.status === 'under_review' && (
                    <>
                      <button
                        className="action-btn waitlist-btn"
                        onClick={() => handleStatusChange(app._id, 'waitlist')}
                      >
                        <FiClock /> Waitlist
                      </button>
                      <button
                        className="action-btn accept-btn"
                        onClick={() => handleStatusChange(app._id, 'accepted')}
                      >
                        <FiCheckCircle /> Accept
                      </button>
                    </>
                  )}

                  {app.status === 'waitlist' && (
                    <>
                      <button
                        className="action-btn review-btn"
                        onClick={() => handleStatusChange(app._id, 'under_review')}
                      >
                        <FiCheckCircle /> Move to Review
                      </button>
                      <button
                        className="action-btn accept-btn"
                        onClick={() => handleStatusChange(app._id, 'accepted')}
                      >
                        <FiCheckCircle /> Accept
                      </button>
                    </>
                  )}

                  {app.status !== 'rejected' && app.status !== 'accepted' && (
                    <button
                      className="action-btn reject-btn"
                      onClick={() => handleStatusChange(app._id, 'rejected')}
                    >
                      <FiXCircle /> Reject
                    </button>
                  )}

                  <button
                    className="action-btn message-btn"
                    onClick={() => setSelectedApp(app)}
                  >
                    <FiMessageSquare /> Message
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Message Modal */}
      {selectedApp && (
        <div className="message-modal-overlay" onClick={() => setSelectedApp(null)}>
          <motion.div
            className="message-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Message {selectedApp.applicant?.name}</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedApp(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <p className="message-hint">
                Send a message to {selectedApp.applicant?.name} about their application for{' '}
                <strong>{selectedApp.job?.title}</strong>
              </p>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here... (e.g., 'We'd like to invite you for an interview')"
                rows="6"
                className="message-input"
              />

              <div className="modal-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleMessage(selectedApp._id, selectedApp.applicant?._id)}
                  disabled={sendingMessage}
                >
                  {sendingMessage ? 'Sending...' : 'Send Message'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelectedApp(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EmployerApplications;
