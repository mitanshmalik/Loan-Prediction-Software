import { useState } from 'react'
import './LoanForm.css'

const LoanForm = ({ onPredictionComplete }) => {
  const [formData, setFormData] = useState({
    gender: 'Male',
    married: 'Yes',
    dependents: '0',
    education: 'Graduate',
    self_employed: 'No',
    applicant_income: '',
    coapplicant_income: '',
    loan_amount: '',
    loan_amount_term: '360',
    credit_history: '1',
    property_area: 'Urban'
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const application = {
        gender: formData.gender,
        married: formData.married,
        dependents: formData.dependents,
        education: formData.education,
        self_employed: formData.self_employed,
        applicant_income: parseFloat(formData.applicant_income),
        coapplicant_income: parseFloat(formData.coapplicant_income || 0),
        loan_amount: parseFloat(formData.loan_amount),
        loan_amount_term: parseFloat(formData.loan_amount_term),
        credit_history: parseInt(formData.credit_history),
        property_area: formData.property_area
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict-loan`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ application })
      })

      if (!response.ok) {
        throw new Error('Prediction failed')
      }

      const data = await response.json()
      setResult(data)

      if (onPredictionComplete) {
        onPredictionComplete()
      }
    } catch (err) {
      setError(err.message || 'An error occurred during prediction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="loan-form-container">
      <div className="form-card">
        <h2 className="form-title">Loan Application Details</h2>
        <p className="form-description">
          Fill in the applicant details to predict loan approval status
        </p>

        <form onSubmit={handleSubmit} className="loan-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="married">Marital Status</label>
              <select
                id="married"
                name="married"
                value={formData.married}
                onChange={handleChange}
                required
              >
                <option value="Yes">Married</option>
                <option value="No">Single</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dependents">Dependents</label>
              <select
                id="dependents"
                name="dependents"
                value={formData.dependents}
                onChange={handleChange}
                required
              >
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3+">3+</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="education">Education</label>
              <select
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                required
              >
                <option value="Graduate">Graduate</option>
                <option value="Not Graduate">Not Graduate</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="self_employed">Self Employed</label>
              <select
                id="self_employed"
                name="self_employed"
                value={formData.self_employed}
                onChange={handleChange}
                required
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="applicant_income">Applicant Income</label>
              <input
                type="number"
                id="applicant_income"
                name="applicant_income"
                value={formData.applicant_income}
                onChange={handleChange}
                placeholder="e.g., 5000"
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="coapplicant_income">Co-applicant Income</label>
              <input
                type="number"
                id="coapplicant_income"
                name="coapplicant_income"
                value={formData.coapplicant_income}
                onChange={handleChange}
                placeholder="e.g., 2000"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="loan_amount">Loan Amount (in thousands)</label>
              <input
                type="number"
                id="loan_amount"
                name="loan_amount"
                value={formData.loan_amount}
                onChange={handleChange}
                placeholder="e.g., 150"
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="loan_amount_term">Loan Term (months)</label>
              <select
                id="loan_amount_term"
                name="loan_amount_term"
                value={formData.loan_amount_term}
                onChange={handleChange}
                required
              >
                <option value="360">360 (30 years)</option>
                <option value="180">180 (15 years)</option>
                <option value="120">120 (10 years)</option>
                <option value="240">240 (20 years)</option>
                <option value="60">60 (5 years)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="credit_history">Credit History</label>
              <select
                id="credit_history"
                name="credit_history"
                value={formData.credit_history}
                onChange={handleChange}
                required
              >
                <option value="1">Good Credit History</option>
                <option value="0">No Credit History</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="property_area">Property Area</label>
              <select
                id="property_area"
                name="property_area"
                value={formData.property_area}
                onChange={handleChange}
                required
              >
                <option value="Urban">Urban</option>
                <option value="Semiurban">Semi-Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Predicting...' : 'Predict Loan Status'}
          </button>
        </form>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className={`alert ${result.prediction === 'Y' ? 'alert-success' : 'alert-warning'}`}>
            <h3 className="result-title">Prediction Result</h3>
            <div className="result-content">
              <div className="result-item">
                <span className="result-label">Status:</span>
                <span className={`result-value ${result.prediction === 'Y' ? 'approved' : 'rejected'}`}>
                  {result.prediction === 'Y' ? 'APPROVED' : 'NOT APPROVED'}
                </span>
              </div>
              <div className="result-item">
                <span className="result-label">Confidence:</span>
                <span className="result-value">
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoanForm
