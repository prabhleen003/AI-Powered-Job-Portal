import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPlus, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './PostJob.css';

const EditJob = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingJob, setFetchingJob] = useState(true);
  const [requirements, setRequirements] = useState(['']);
  const [responsibilities, setResponsibilities] = useState(['']);
  const [skills, setSkills] = useState(['']);

  const [formData, setFormData] = useState({
    title: '',
    company: user?.company || '',
    description: '',
    employmentType: 'Full-time',
    experienceLevel: 'Mid Level',
    category: 'Technology',
    location: {
      city: '',
      state: '',
      country: '',
      remote: false,
      hybrid: false
    },
    salary: {
      min: '',
      max: '',
      currency: 'USD',
      period: 'yearly'
    },
    applicationDeadline: '',
    questions: []
  });

  const categories = [
    'Technology', 'Marketing', 'Sales', 'Design', 'Finance',
    'Healthcare', 'Education', 'Engineering', 'Customer Service', 'Other'
  ];

  const employmentTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
  const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    setFetchingJob(true);
    try {
      const { data } = await axios.get(`/jobs/${jobId}`);
      const job = data.job;

      // Check if user is the owner of this job
      if (job.employer._id !== user._id) {
        toast.error('You are not authorized to edit this job');
        navigate('/my-jobs');
        return;
      }

      // Set form data with existing job data
      setFormData({
        title: job.title || '',
        company: job.company || user?.company || '',
        description: job.description || '',
        employmentType: job.employmentType || 'Full-time',
        experienceLevel: job.experienceLevel || 'Mid Level',
        category: job.category || 'Technology',
        location: {
          city: job.location?.city || '',
          state: job.location?.state || '',
          country: job.location?.country || '',
          remote: job.location?.remote || false,
          hybrid: job.location?.hybrid || false
        },
        salary: {
          min: job.salary?.min || '',
          max: job.salary?.max || '',
          currency: job.salary?.currency || 'USD',
          period: job.salary?.period || 'yearly'
        },
        applicationDeadline: job.applicationDeadline ? job.applicationDeadline.split('T')[0] : '',
        questions: job.questions || []
      });

      setRequirements(job.requirements?.length > 0 ? job.requirements : ['']);
      setResponsibilities(job.responsibilities?.length > 0 ? job.responsibilities : ['']);
      setSkills(job.skills?.length > 0 ? job.skills : ['']);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
      navigate('/my-jobs');
    } finally {
      setFetchingJob(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('location.')) {
      const locKey = name.split('.')[1];
      setFormData({
        ...formData,
        location: { ...formData.location, [locKey]: value }
      });
    } else if (name.includes('salary.')) {
      const salKey = name.split('.')[1];
      setFormData({
        ...formData,
        salary: { ...formData.salary, [salKey]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLocationCheckbox = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      location: { ...formData.location, [name]: checked }
    });
  };

  const addItem = (type) => {
    if (type === 'requirement') setRequirements([...requirements, '']);
    else if (type === 'responsibility') setResponsibilities([...responsibilities, '']);
    else if (type === 'skill') setSkills([...skills, '']);
  };

  const updateItem = (type, index, value) => {
    if (type === 'requirement') {
      const updated = [...requirements];
      updated[index] = value;
      setRequirements(updated);
    } else if (type === 'responsibility') {
      const updated = [...responsibilities];
      updated[index] = value;
      setResponsibilities(updated);
    } else if (type === 'skill') {
      const updated = [...skills];
      updated[index] = value;
      setSkills(updated);
    }
  };

  const removeItem = (type, index) => {
    if (type === 'requirement') {
      setRequirements(requirements.filter((_, i) => i !== index));
    } else if (type === 'responsibility') {
      setResponsibilities(responsibilities.filter((_, i) => i !== index));
    } else if (type === 'skill') {
      setSkills(skills.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.description) {
      toast.error('Please fill in required fields');
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        ...formData,
        requirements: requirements.filter(r => r.trim()),
        responsibilities: responsibilities.filter(r => r.trim()),
        skills: skills.filter(s => s.trim())
      };

      await axios.put(`/jobs/${jobId}`, jobData);
      toast.success('Job updated successfully!');
      navigate('/my-jobs');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating job');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingJob) {
    return (
      <div className="post-job-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="post-job-page">
      <div className="container">
        <button
          className="back-btn"
          onClick={() => navigate('/my-jobs')}
        >
          <FiArrowLeft /> Back to My Jobs
        </button>

        <motion.div
          className="post-job-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Edit Job Posting</h1>
          <p className="subtitle">Update your job posting details</p>

          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="form-section">
              <h2>Basic Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Your company name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Employment Type *</label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    required
                  >
                    {employmentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Experience Level *</label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    required
                  >
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    name="applicationDeadline"
                    value={formData.applicationDeadline}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Job Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="8"
                  placeholder="Describe the role, what the candidate will do, and what makes this opportunity great..."
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div className="form-section">
              <h2>Location</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleInputChange}
                    placeholder="e.g., San Francisco"
                  />
                </div>

                <div className="form-group">
                  <label>State/Province</label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    placeholder="e.g., California"
                  />
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleInputChange}
                    placeholder="e.g., USA"
                  />
                </div>
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="remote"
                    checked={formData.location.remote}
                    onChange={handleLocationCheckbox}
                  />
                  <span>Remote Position</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="hybrid"
                    checked={formData.location.hybrid}
                    onChange={handleLocationCheckbox}
                  />
                  <span>Hybrid Work</span>
                </label>
              </div>
            </div>

            {/* Salary */}
            <div className="form-section">
              <h2>Salary Range</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Minimum Salary</label>
                  <input
                    type="number"
                    name="salary.min"
                    value={formData.salary.min}
                    onChange={handleInputChange}
                    placeholder="e.g., 80000"
                  />
                </div>

                <div className="form-group">
                  <label>Maximum Salary</label>
                  <input
                    type="number"
                    name="salary.max"
                    value={formData.salary.max}
                    onChange={handleInputChange}
                    placeholder="e.g., 120000"
                  />
                </div>

                <div className="form-group">
                  <label>Currency</label>
                  <select
                    name="salary.currency"
                    value={formData.salary.currency}
                    onChange={handleInputChange}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="INR">INR</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Period</label>
                  <select
                    name="salary.period"
                    value={formData.salary.period}
                    onChange={handleInputChange}
                  >
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="form-section">
              <div className="section-header">
                <h2>Requirements</h2>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => addItem('requirement')}
                >
                  <FiPlus /> Add Requirement
                </button>
              </div>
              <div className="list-items">
                {requirements.map((req, index) => (
                  <div key={index} className="list-item">
                    <input
                      type="text"
                      value={req}
                      onChange={(e) => updateItem('requirement', index, e.target.value)}
                      placeholder="e.g., 5+ years of React experience"
                    />
                    {requirements.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeItem('requirement', index)}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Responsibilities */}
            <div className="form-section">
              <div className="section-header">
                <h2>Responsibilities</h2>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => addItem('responsibility')}
                >
                  <FiPlus /> Add Responsibility
                </button>
              </div>
              <div className="list-items">
                {responsibilities.map((resp, index) => (
                  <div key={index} className="list-item">
                    <input
                      type="text"
                      value={resp}
                      onChange={(e) => updateItem('responsibility', index, e.target.value)}
                      placeholder="e.g., Lead frontend development initiatives"
                    />
                    {responsibilities.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeItem('responsibility', index)}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="form-section">
              <div className="section-header">
                <h2>Required Skills</h2>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => addItem('skill')}
                >
                  <FiPlus /> Add Skill
                </button>
              </div>
              <div className="list-items">
                {skills.map((skill, index) => (
                  <div key={index} className="list-item">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => updateItem('skill', index, e.target.value)}
                      placeholder="e.g., React, Node.js, TypeScript"
                    />
                    {skills.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeItem('skill', index)}
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/my-jobs')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Job'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditJob;
