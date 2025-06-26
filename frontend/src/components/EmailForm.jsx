import React, { useState } from 'react';
import axios from 'axios';

export default function EmailForm({ onSubmit, loading }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [from, setFrom] = useState('');
  const [error, setError] = useState('');
  const [genLoading, setGenLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!subject || !body || !from) {
      setError('All fields are required.');
      return;
    }
    onSubmit({ subject, body, from });
  };

  const handleGenerateEmail = async () => {
    setGenLoading(true);
    setError('');
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE || 'https://65-0-71-204.nip.io'}/generate-random-email`);
      setSubject(res.data.subject);
      setBody(res.data.body);
      setFrom(res.data.from);
    } catch (e) {
      setError('Failed to generate random email.');
    } finally {
      setGenLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-lg mx-auto mt-8 space-y-4">
      <h2 className="text-xl font-bold mb-2">Ingest Email</h2>
      <div>
        <label className="block font-medium mb-1">Subject</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Body</label>
        <textarea
          className="w-full border rounded px-3 py-2"
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={5}
          disabled={loading}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">From (email)</label>
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          value={from}
          onChange={e => setFrom(e.target.value)}
          disabled={loading}
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
        <button
          type="button"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
          onClick={handleGenerateEmail}
          disabled={loading || genLoading}
        >
          {genLoading ? 'Generating...' : 'Generate Email'}
        </button>
      </div>
    </form>
  );
} 