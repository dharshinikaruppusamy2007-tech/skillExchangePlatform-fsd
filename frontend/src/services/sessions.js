import api from './api'

// These reuse the existing Axios instance from services/api.js (JWT auto).

export const createSession = (data) => api.post('/sessions', data)

export const getSessions = () => api.get('/sessions')

export const getUpcomingSessions = () => api.get('/sessions/upcoming')

export const getPastSessions = () => api.get('/sessions/past')

export const getSessionById = (id) => api.get(`/sessions/${id}`)

export const updateSession = (id, data) => api.put(`/sessions/${id}`, data)

export const completeSession = (id) => api.put(`/sessions/${id}/complete`)

export const cancelSession = (id) => api.put(`/sessions/${id}/cancel`)