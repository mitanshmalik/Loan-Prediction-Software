import { useState } from 'react'
import LoanForm from './components/LoanForm'
import ApplicationHistory from './components/ApplicationHistory'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('predict')
  const [refreshHistory, setRefreshHistory] = useState(0)

  const handlePredictionComplete = () => {
    setRefreshHistory(prev => prev + 1)
    setActiveTab('history')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="title">Loan Prediction System</h1>
          <p className="subtitle">AI-powered loan approval prediction</p>
        </div>
      </header>

      <nav className="nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'predict' ? 'active' : ''}`}
          onClick={() => setActiveTab('predict')}
        >
          New Prediction
        </button>
        <button
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Application History
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'predict' && (
          <LoanForm onPredictionComplete={handlePredictionComplete} />
        )}
        {activeTab === 'history' && (
          <ApplicationHistory refresh={refreshHistory} />
        )}
      </main>

      <footer className="footer">
        <p>Loan Prediction Classification System</p>
        <p className="footer-note">Built with React and Supabase</p>
      </footer>
    </div>
  )
}

export default App
