import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { InterviewSetup } from './components/Setup/InterviewSetup';
import { LiveInterviewRoom } from './components/Interview/LiveInterviewRoom';
import { ResultsReport } from './components/Feedback/ResultsReport';
import { CandidateDashboard } from './components/Dashboard/CandidateDashboard';
import { CameraCheckModal } from './components/Interview/CameraCheckModal';
import {
  InterviewConfig,
  InterviewSession,
  ReportData
} from './types';
import { api } from './services/api';

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'setup' | 'interview' | 'report' | 'dashboard'>('landing');
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [activeReport, setActiveReport] = useState<ReportData | null>(null);
  const [candidateStream, setCandidateStream] = useState<MediaStream | null>(null);
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [pendingConfig, setPendingConfig] = useState<InterviewConfig | null>(null);
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [presetToLoad, setPresetToLoad] = useState<string | undefined>(undefined);
  const [isStartingInterview, setIsStartingInterview] = useState<boolean>(false);

  // Check backend connectivity on mount
  useEffect(() => {
    api.healthCheck().then((healthy) => {
      if (!healthy) {
        console.warn('Backend server not detected at localhost:8001; ensure FastAPI server is running.');
      }
    });
  }, []);

  const handleStartInterviewConfig = (config: InterviewConfig) => {
    setPendingConfig(config);
    setVoiceSpeed(config.voiceSpeed);
    setShowCameraModal(true);
  };

  const handleCameraConfirm = async (stream: MediaStream | null) => {
    setCandidateStream(stream);
    setShowCameraModal(false);
    if (!pendingConfig) return;

    setIsStartingInterview(true);
    try {
      const session = await api.createInterview(pendingConfig);
      setActiveSession(session);
      setCurrentView('interview');
    } catch (err: any) {
      console.error('Error starting interview session:', err);
      alert(`Could not start interview: ${err.message || 'Please check that the backend server is running on port 8001.'}`);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setCandidateStream(null);
      }
    } finally {
      setIsStartingInterview(false);
    }
  };

  const handleCameraCancel = () => {
    setShowCameraModal(false);
    setPendingConfig(null);
  };

  const handleFinishInterview = (report: ReportData) => {
    if (candidateStream) {
      candidateStream.getTracks().forEach((t) => t.stop());
      setCandidateStream(null);
    }
    setActiveReport(report);
    setCurrentView('report');
  };

  const handleExitInterview = () => {
    if (candidateStream) {
      candidateStream.getTracks().forEach((t) => t.stop());
      setCandidateStream(null);
    }
    setCurrentView('dashboard');
  };

  const handleViewReportFromId = async (interviewId: string) => {
    try {
      const report = await api.getReport(interviewId);
      setActiveReport(report);
      setCurrentView('report');
    } catch (err) {
      console.error('Failed to load report:', err);
    }
  };

  const handleQuickLaunchFromDashboard = (preset?: string) => {
    setPresetToLoad(preset);
    setCurrentView('setup');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Hide Navbar during active live interview for maximum focus */}
      {currentView !== 'interview' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => {
            if (view === 'setup') setPresetToLoad(undefined);
            setCurrentView(view);
          }}
        />
      )}

      {/* Main Content View Switcher */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingPage
            onStartInterview={() => {
              setPresetToLoad(undefined);
              setCurrentView('setup');
            }}
            onExploreFeatures={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            onViewDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'setup' && (
          <InterviewSetup
            initialPreset={presetToLoad}
            onStartInterview={handleStartInterviewConfig}
            onCancel={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'interview' && activeSession && (
          <LiveInterviewRoom
            session={activeSession}
            candidateStream={candidateStream}
            voiceSpeed={voiceSpeed}
            onFinishInterview={handleFinishInterview}
            onExitInterview={handleExitInterview}
          />
        )}

        {currentView === 'report' && activeReport && (
          <ResultsReport
            report={activeReport}
            onPracticeAgain={() => {
              setPresetToLoad(undefined);
              setCurrentView('setup');
            }}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'dashboard' && (
          <CandidateDashboard
            onStartNewInterview={handleQuickLaunchFromDashboard}
            onViewReport={handleViewReportFromId}
          />
        )}
      </main>

      {/* Footer */}
      {currentView !== 'interview' && <Footer />}

      {/* Pre-Interview Camera & Microphone Proctoring Check Modal */}
      {showCameraModal && pendingConfig && (
        <CameraCheckModal
          candidateName={pendingConfig.candidateName || 'Candidate'}
          jobRole={pendingConfig.jobRole}
          onConfirm={handleCameraConfirm}
          onCancel={handleCameraCancel}
        />
      )}
    </div>
  );
}

export default App;
