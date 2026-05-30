import { useEffect, useState } from 'react';
import { generateReport } from '../services/api/ai';
import { purgeComponentState } from '../utils/purge';

const AIReport = ({ loc }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    if (!loc) return;

    const loadReport = async () => {
      setLoading(true);
      setError(false);
      try {
        const result = await generateReport(loc);
        if (isMounted) {
          setReport(result);
        }
      } catch (e) {
        if (isMounted) {
          setError(true);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadReport();
    
    return () => {
      isMounted = false;
      purgeComponentState(setReport, setLoading, setError);
    };
  }, [loc]);

  if (loading) return <div className="p-3 mt-3 bg-gray-50 rounded-lg text-sm text-gray-500 animate-pulse border border-gray-100">Generating AI field report...</div>;
  
  if (error) return (
    <div className="p-3 mt-3 border border-red-200 rounded-lg bg-red-50 text-red-800 text-sm">
      AI reporting service is currently unavailable.
    </div>
  );

  return (
    <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg p-3">
      <h3 className="text-xs text-indigo-800 uppercase font-semibold tracking-wider mb-2 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>
          AI Field Report
      </h3>
      <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto pr-2 custom-scrollbar">
        {report}
      </div>
    </div>
  );
};

export default AIReport;
