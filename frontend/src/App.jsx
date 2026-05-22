import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InspectionView from './pages/InspectionView';
import MetricsPage from './pages/MetricsPage';
import './App.css';

/* ===================================================================
   Error Boundary
   =================================================================== */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="panel error-panel" style={{ margin: '24px' }}>
          <p className="error-text">
            COMPONENT ERROR — {this.state.error?.message || 'UNEXPECTED FAILURE'}
          </p>
          <button
            className="btn btn-ghost"
            style={{ marginTop: '12px' }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ===================================================================
   App Root
   =================================================================== */
function App() {
  return (
    <>
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <InspectionView />
              </ErrorBoundary>
            }
          />
          <Route
            path="/metrics"
            element={
              <ErrorBoundary>
                <MetricsPage />
              </ErrorBoundary>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
