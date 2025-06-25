import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecentEmails, reassignEmail } from '../api/emailService';

const INTENT_TEAM_MAP = {
  "Refund": "refunds_team",
  "Complaint": "support_team",
  "Order Status": "ops_team",
  "Product Query": "product_team",
  "Partnership": "bizdev_team",
  "Other": "general_queue",
};

export default function Dashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reassigning, setReassigning] = useState({});
  const [newTeams, setNewTeams] = useState({});
  const [messages, setMessages] = useState({});

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await getRecentEmails();
      setEmails(res.data);
      const initialTeams = res.data.reduce((acc, email) => {
        acc[email._id] = email.assigned_team;
        return acc;
      }, {});
      setNewTeams(initialTeams);
    } catch (err) {
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReassign = async (emailId) => {
    const newTeam = newTeams[emailId];
    setReassigning((prev) => ({ ...prev, [emailId]: true }));
    setMessages((prev) => ({ ...prev, [emailId]: null }));
    try {
      await reassignEmail(emailId, newTeam);
      setMessages((prev) => ({ ...prev, [emailId]: { type: 'success', text: 'Reassigned successfully!' } }));
      // Optimistically update the local state
      setEmails(prev => prev.map(e => e._id === emailId ? { ...e, assigned_team: newTeam } : e));
    } catch (err) {
      setMessages((prev) => ({ ...prev, [emailId]: { type: 'error', text: err?.response?.data?.detail || 'Failed to reassign.' } }));
    } finally {
      setReassigning((prev) => ({ ...prev, [emailId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-6">Email Dashboard</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Body</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reassign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
            ) : emails.map((email, index) => (
              <tr key={email._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs">
                  <Link to={`/email/${email._id}`} className="text-blue-600 hover:underline">
                    {email.subject}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{email.body}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.intent}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{email.summary}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{email.assigned_team}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={newTeams[email._id] || ''}
                    onChange={(e) => setNewTeams(prev => ({ ...prev, [email._id]: e.target.value }))}
                    className="border rounded px-2 py-1 text-sm"
                    disabled={reassigning[email._id]}
                  >
                    {Object.values(INTENT_TEAM_MAP).map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    onClick={() => handleReassign(email._id)}
                    disabled={reassigning[email._id]}
                  >
                    {reassigning[email._id] ? 'Saving...' : 'Reassign'}
                  </button>
                  {messages[email._id] && (
                    <div className={`mt-1 text-xs ${messages[email._id].type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {messages[email._id].text}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 