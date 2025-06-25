import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'https://hiver-idea.onrender.com';

export const ingestEmail = async (payload) => {
  return axios.post(`${API_BASE}/ingest-email`, payload);
};

export const getRecentEmails = async () => {
  return axios.get(`${API_BASE}/emails`);
};

export const getEmailById = async (id) => {
    return axios.get(`${API_BASE}/emails/${id}`);
};

export const reassignEmail = async (emailId, newTeam) => {
  return axios.post(`${API_BASE}/reassign-email/${emailId}`, { new_team: newTeam });
};

export const generateReply = async (emailId) => {
    return axios.post(`${API_BASE}/generate-reply`, { email_id: emailId });
};

export const saveReply = async (emailId, reply) => {
    return axios.post(`${API_BASE}/save-reply/${emailId}`, { reply });
};

export const generateFeedback = async (emailId) => {
    return axios.post(`${API_BASE}/generate-feedback/${emailId}`);
}; 