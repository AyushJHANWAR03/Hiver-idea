import React from 'react';

export default function EmailResultCard({ intent, summary, assigned_team }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded p-6 mt-6 max-w-lg mx-auto shadow">
      <h3 className="text-lg font-bold mb-2">AI Result</h3>
      <div className="mb-2">
        <span className="font-semibold">Intent:</span> {intent}
      </div>
      <div className="mb-2">
        <span className="font-semibold">Summary:</span> {summary}
      </div>
      <div>
        <span className="font-semibold">Assigned Team:</span> {assigned_team}
      </div>
    </div>
  );
} 