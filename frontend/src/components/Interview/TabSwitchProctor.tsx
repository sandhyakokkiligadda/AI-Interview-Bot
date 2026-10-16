import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, ShieldAlert, XCircle, ArrowRight } from 'lucide-react';

interface TabSwitchProctorProps {
  isActive: boolean;
  onViolation: (count: number) => void;
  onTerminate: (reason: string) => void;
  onPauseTimer: (paused: boolean) => void;
}

export const TabSwitchProctor: React.FC<TabSwitchProctorProps> = ({
  isActive,
  onViolation,
  onTerminate,
  onPauseTimer
}) => {
  const [violations, setViolations] = useState<number>(0);
  const [activeWarning, setActiveWarning] = useState<number | null>(null);

  const lastSwitchTimeRef = useRef<number>(0);
  const violationsRef = useRef<number>(0);

  useEffect(() => {
    violationsRef.current = violations;
  }, [violations]);

  useEffect(() => {
    if (!isActive) return;

    const handleSwitchAway = () => {
      const now = Date.now();
      // Debounce duplicate events within 1.8 seconds
      if (now - lastSwitchTimeRef.current < 1800) {
        return;
      }
      lastSwitchTimeRef.current = now;

      const newCount = violationsRef.current + 1;
      setViolations(newCount);
      onViolation(newCount);
      onPauseTimer(true);

      if (newCount === 1) {
        setActiveWarning(1);
      } else if (newCount === 2) {
        setActiveWarning(2);
      } else if (newCount === 3) {
        setActiveWarning(3);
      } else if (newCount === 4) {
        setActiveWarning(4);
      } else if (newCount >= 5) {
        setActiveWarning(5);
        // Immediate termination on 5th violation
        setTimeout(() => {
          onTerminate('Terminated due to repeated tab switching (5 violations)');
        }, 800);
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        handleSwitchAway();
      }
    };

    const onWindowBlur = () => {
      handleSwitchAway();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [isActive, onViolation, onTerminate, onPauseTimer]);

  const handleDismissWarning = () => {
    setActiveWarning(null);
    onPauseTimer(false);
  };

  if (!activeWarning) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-rose-500/50 p-6 sm:p-7 shadow-2xl space-y-5 text-center">
        {/* Warning Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
          {activeWarning >= 5 ? (
            <XCircle className="w-9 h-9 text-rose-500 animate-pulse" />
          ) : (
            <AlertTriangle className="w-9 h-9 text-rose-400 animate-bounce" />
          )}
        </div>

        {/* Warning Title & Counter */}
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-rose-950 border border-rose-800 text-rose-300 text-xs font-mono font-bold tracking-wider uppercase">
            Proctoring Strike {activeWarning} of 5
          </span>
          <h3 className="text-xl font-extrabold text-slate-100 pt-2">
            {activeWarning === 1 && 'Tab Switch Detected'}
            {activeWarning === 2 && 'Second Tab Switch Warning'}
            {activeWarning === 3 && 'Third Tab Switch Warning'}
            {activeWarning === 4 && 'Final Warning: Stay in Interview'}
            {activeWarning >= 5 && 'Interview Terminated'}
          </h3>
        </div>

        {/* Explanation Message */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {activeWarning === 1 && (
            <>
              <strong>Warning 1/5:</strong> You switched away from the interview screen. Please remain focused on the interview tab. 4 warnings remaining before disqualification.
            </>
          )}
          {activeWarning === 2 && (
            <>
              <strong>Warning 2/5:</strong> Another tab switch detected. Please stay on the interview screen. 3 warnings remaining.
            </>
          )}
          {activeWarning === 3 && (
            <>
              <strong>Warning 3/5:</strong> Multiple tab switches detected. Please avoid switching applications. 2 warnings remaining.
            </>
          )}
          {activeWarning === 4 && (
            <>
              <strong>Warning 4/5 (Final Warning):</strong> One more tab switch violation will permanently disqualify and terminate your mock interview session.
            </>
          )}
          {activeWarning >= 5 && (
            <>
              <strong>Interview Disqualified:</strong> 5 tab switch violations occurred. The session has been halted, camera access stopped, and your partial answers saved for review.
            </>
          )}
        </p>

        {/* Action Button */}
        {activeWarning < 5 ? (
          <button
            onClick={handleDismissWarning}
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>I Understand, Return to Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-xs text-rose-400 font-mono flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Compiling partial evaluation scorecard...</span>
          </div>
        )}
      </div>
    </div>
  );
};
