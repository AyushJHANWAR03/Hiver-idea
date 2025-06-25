import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailForm from '../components/EmailForm';
import EmailResultCard from '../components/EmailResultCard';
import { ingestEmail } from '../api/emailService';

export default function IngestEmail() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        ...formData,
        timestamp: new Date().toISOString(),
      };
      const res = await ingestEmail(payload);
      setResult(res.data);
      // Navigate to dashboard after successful submission
      navigate('/dashboard');
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(Array.isArray(detail) ? detail : (detail || 'Failed to ingest email.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EmailForm onSubmit={handleSubmit} loading={loading} />
      {error && (
        <div className="text-red-600 text-center mt-4">
          {Array.isArray(error)
            ? error.map((e, i) => <div key={i}>{e.msg}</div>)
            : error}
        </div>
      )}
      {result && (
        <EmailResultCard
          intent={result.intent}
          summary={result.summary}
          assigned_team={result.assigned_team}
        />
      )}
    </div>
  );
} 