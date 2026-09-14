import api from './api'

// These reuse the existing Axios instance from services/api.js (JWT auto).

export const getConversations = () => api.get('/messages')

export const getMessages = (userId) => api.get(`/messages/${userId}`)

export const sendMessage = (data) => api.post('/messages', data)