import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import './ApplicationHistory.css'

const ApplicationHistory = ({ refresh }) => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchApplications()
  }, [refresh])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setApplications(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="error-state">
          <h3>Error Loading Applications</h3>
          <p>{error}</p>
          <button onClick={fetchApplications} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h2 className="history-title">Application History</h2>
        <p className="history-description">
          View all loan applications and their predictions
        </p>
        <button onClick={fetchApplications} className="refresh-button">
          Refresh
        </button>
      </div>

      {applications.length === 0 ? (
        <div className="empty-state">
          <h3>No Applications Yet</h3>
          <p>Submit a new loan prediction to see it here</p>
        </div>
      ) : (
        <div className="applications-grid">
          {applications.map((app) => (
            <div key={app.id} className="application-card">
              <div className="card-header">
                <span className="loan-id">{app.loan_id}</span>
                <span className={`status-badge ${app.predicted_status === 'Y' ? 'approved' : 'rejected'}`}>
                  {app.predicted_status === 'Y' ? 'APPROVED' : 'NOT APPROVED'}
                </span>
              </div>

              <div className="card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{app.gender}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Married</span>
                    <span className="info-value">{app.married}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Dependents</span>
                    <span className="info-value">{app.dependents}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Education</span>
                    <span className="info-value">{app.education}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Self Employed</span>
                    <span className="info-value">{app.self_employed}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Property Area</span>
                    <span className="info-value">{app.property_area}</span>
                  </div>
                </div>

                <div className="financial-info">
                  <div className="financial-item">
                    <span className="financial-label">Applicant Income</span>
                    <span className="financial-value">${app.applicant_income?.toLocaleString()}</span>
                  </div>
                  <div className="financial-item">
                    <span className="financial-label">Co-applicant Income</span>
                    <span className="financial-value">${app.coapplicant_income?.toLocaleString()}</span>
                  </div>
                  <div className="financial-item">
                    <span className="financial-label">Loan Amount</span>
                    <span className="financial-value">${(app.loan_amount * 1000)?.toLocaleString()}</span>
                  </div>
                  <div className="financial-item">
                    <span className="financial-label">Loan Term</span>
                    <span className="financial-value">{app.loan_amount_term} months</span>
                  </div>
                </div>

                <div className="prediction-info">
                  <div className="prediction-item">
                    <span className="prediction-label">Credit History</span>
                    <span className={`prediction-value ${app.credit_history === 1 ? 'good' : 'poor'}`}>
                      {app.credit_history === 1 ? 'Good' : 'No History'}
                    </span>
                  </div>
                  <div className="prediction-item">
                    <span className="prediction-label">Confidence</span>
                    <span className="prediction-value">
                      {(app.prediction_confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <span className="timestamp">{formatDate(app.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ApplicationHistory
