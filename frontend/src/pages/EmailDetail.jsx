import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEmailById, generateReply, saveReply, generateFeedback } from '../api/emailService';

export default function EmailDetail() {
    const { id } = useParams();
    const [email, setEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reply, setReply] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [saveSuccess, setSaveSuccess] = useState('');

    useEffect(() => {
        const fetchEmail = async () => {
            setLoading(true);
            try {
                const res = await getEmailById(id);
                setEmail(res.data);
                // Pre-fill reply if it already exists
                if (res.data.agent_reply) {
                    setReply(res.data.agent_reply);
                }
            } catch (err) {
                setError('Failed to fetch email details.');
            } finally {
                setLoading(false);
            }
        };
        fetchEmail();
    }, [id]);

    const handleAction = async (actionFn, actionName) => {
        setActionLoading(prev => ({ ...prev, [actionName]: true }));
        setError('');
        setSaveSuccess('');
        try {
            const res = await actionFn();
            if (actionName === 'generateReply') {
                setReply(res.data.generated_reply);
            } else if (actionName === 'generateFeedback') {
                setFeedback(res.data);
            } else if (actionName === 'saveReply') {
                setSaveSuccess('Reply saved successfully!');
            }
        } catch (err) {
            setError(`Failed to ${actionName}.`);
        } finally {
            setActionLoading(prev => ({ ...prev, [actionName]: false }));
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
    if (!email) return null;

    const buttonBaseStyles = "px-4 py-2 rounded font-semibold transition-colors duration-200 disabled:opacity-50";

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800">{email.subject}</h1>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-6 text-sm text-gray-600 border-t border-b border-gray-200 py-4">
                    <div><span className="font-semibold text-gray-800">From:</span> {email.from}</div>
                    <div><span className="font-semibold text-gray-800">Assigned Team:</span> {email.assigned_team}</div>
                    <div><span className="font-semibold text-gray-800">Intent:</span> {email.intent}</div>
                    <div><span className="font-semibold text-gray-800">Summary:</span> {email.summary}</div>
                </div>

                <div className="prose prose-sm sm:prose-base max-w-none mb-8 text-gray-700">
                    <p>{email.body}</p>
                </div>

                <div className="space-y-6">
                    {!reply && (
                        <button 
                            onClick={() => handleAction(() => generateReply(id), 'generateReply')} 
                            disabled={actionLoading.generateReply} 
                            className={`${buttonBaseStyles} bg-blue-600 text-white hover:bg-blue-700`}
                        >
                            {actionLoading.generateReply ? 'Generating...' : 'Generate AI Reply'}
                        </button>
                    )}

                    {reply && (
                        <div className="space-y-4">
                            <textarea 
                                value={reply} 
                                onChange={e => setReply(e.target.value)} 
                                className="w-full border rounded p-3 text-sm text-gray-800 shadow-inner" 
                                rows="8" 
                                placeholder="AI-generated reply will appear here..."
                            ></textarea>

                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => handleAction(() => saveReply(id, reply), 'saveReply')} 
                                    disabled={actionLoading.saveReply || !reply} 
                                    className={`${buttonBaseStyles} bg-green-600 text-white hover:bg-green-700`}
                                >
                                    {actionLoading.saveReply ? 'Saving...' : 'Save Reply'}
                                </button>

                                <button 
                                    onClick={() => handleAction(() => generateFeedback(id), 'generateFeedback')} 
                                    disabled={actionLoading.generateFeedback} 
                                    className={`${buttonBaseStyles} bg-purple-600 text-white hover:bg-purple-700`}
                                >
                                    {actionLoading.generateFeedback ? 'Getting Feedback...' : 'Get Feedback'}
                                </button>
                            </div>
                            {saveSuccess && <div className="text-green-600 text-sm font-medium">{saveSuccess}</div>}
                        </div>
                    )}

                    {feedback && (
                        <div className={`p-4 rounded-lg border ${feedback.tone === 'Polite' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'} shadow-sm`}>
                            <h3 className="font-bold mb-2">AI Feedback</h3>
                            <div className="text-sm"><span className="font-semibold">Tone:</span> {feedback.tone}</div>
                            <div className="text-sm"><span className="font-semibold">Clarity:</span> {feedback.clarity}</div>
                            <div className="text-sm"><span className="font-semibold">Helpfulness:</span> {feedback.helpfulness}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 