import api from './api'

// These reuse the existing Axios instance from services/api.js (JWT auto).

export const getRequests = () => api.get('/requests')

export const createRequest = (data) => api.post('/requests', data)

export const updateRequest = (id, data) => api.put(`/requests/${id}`, data)

export const cancelRequest = (id) => api.put(`/requests/${id}/cancel`)