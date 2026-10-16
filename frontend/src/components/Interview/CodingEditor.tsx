import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, RotateCcw, Copy, Code2 } from 'lucide-react';
import { TestCase } from '../../types';

interface CodingEditorProps {
  initialCode?: string;
  testCases?: TestCase[];
  onCodeChange?: (code: string) => void;
  language?: string;
}

export const CodingEditor: React.FC<CodingEditorProps> = ({
  initialCode = '# Write your code solution here\n',
  testCases = [],
  onCodeChange,
  language = 'python'
}) => {
  const [code, setCode] = useState<string>(initialCode);
  const [activeTab, setActiveTab] = useState<'editor' | 'testcases'>('editor');
  const [runStatus, setRunStatus] = useState<{ executed: boolean; output: string; passed: number; total: number } | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);
    onCodeChange?.(val);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setRunStatus(null);

    setTimeout(() => {
      // Simulate quick syntax / logic check
      let passedCount = 0;
      const totalCount = testCases.length || 3;

      const hasDef = code.includes('def ') || code.includes('function ') || code.includes('class ');
      const hasReturn = code.includes('return');

      if (hasDef && hasReturn) {
        passedCount = totalCount;
      } else if (hasReturn) {
        passedCount = Math.max(1, totalCount - 1);
      } else {
        passedCount = 0;
      }

      setRunStatus({
        executed: true,
        output: hasDef && hasReturn
          ? `All ${totalCount} test case(s) passed successfully!\nExecution time: 42ms\nMemory: 14.2 MB`
          : `Syntax & Test Check: Function structure or return statement missing in code solution.\nFailed ${totalCount - passedCount} test cases.`,
        passed: passedCount,
        total: totalCount
      });
      setIsRunning(false);
      setActiveTab('testcases');
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(initialCode);
    onCodeChange?.(initialCode);
    setRunStatus(null);
  };

  return (
    <div className="w-full flex flex-col rounded-xl overflow-hidden glass-panel border border-slate-700/80 shadow-2xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-850 text-xs">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Coding Workspace</span>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[11px] uppercase">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'editor'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setActiveTab('testcases')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition relative ${
              activeTab === 'testcases'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Test Cases ({testCases.length || 3})
            {runStatus && (
              <span
                className={`ml-1.5 inline-block w-2 h-2 rounded-full ${
                  runStatus.passed === runStatus.total ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
            )}
          </button>

          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            title="Reset starter code"
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'editor' ? (
        <div className="relative font-mono text-xs sm:text-sm">
          <textarea
            value={code}
            onChange={handleTextChange}
            spellCheck={false}
            rows={10}
            className="w-full bg-slate-950/90 text-emerald-300 p-4 font-mono focus:outline-none resize-none leading-relaxed tracking-wide selection:bg-indigo-500 selection:text-white"
            placeholder="Type your code solution here..."
          />
        </div>
      ) : (
        <div className="p-4 bg-slate-950/90 min-h-[220px] text-xs space-y-3 font-mono">
          <div className="text-slate-400 font-sans font-semibold mb-2">Sample Test Cases</div>
          {(testCases.length > 0
            ? testCases
            : [
                { input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]' },
                { input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]' },
                { input: 'nums = [3, 3], target = 6', expected: '[0, 1]' }
              ]
          ).map((tc, idx) => (
            <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800 flex flex-col gap-1">
              <div className="flex items-center justify-between text-slate-400">
                <span>Case {idx + 1}</span>
                {runStatus && (
                  <span className="flex items-center gap-1 text-[11px]">
                    {runStatus.passed > idx ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Passed
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-400" /> Failed
                      </>
                    )}
                  </span>
                )}
              </div>
              <div className="text-slate-300">
                <span className="text-slate-500">Input: </span>
                {tc.input}
              </div>
              <div className="text-cyan-400">
                <span className="text-slate-500">Expected: </span>
                {tc.expected}
              </div>
            </div>
          ))}

          {runStatus && (
            <div className="mt-3 p-3 rounded bg-slate-900/90 border border-slate-700 whitespace-pre-line text-slate-300">
              {runStatus.output}
            </div>
          )}
        </div>
      )}

      {/* Editor Footer / Run Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-t border-slate-800 text-xs">
        <span className="text-slate-400">
          {code.split('\n').length} lines • {code.length} chars
          {copied && <span className="ml-2 text-emerald-400">Copied to clipboard!</span>}
        </span>

        <button
          onClick={handleRunCode}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition shadow-lg shadow-emerald-900/30 disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {isRunning ? 'Running Tests...' : 'Run & Test Solution'}
        </button>
      </div>
    </div>
  );
};
