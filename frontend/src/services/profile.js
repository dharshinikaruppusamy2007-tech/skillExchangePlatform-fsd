import api from './api'

// These use the existing Axios instance from services/api.js, which already
// attaches the Authorization: Bearer <token> header when a token exists.

export const getProfile = () => api.get('/profile')

export const updateProfile = (data) => api.put('/profile', data)

export const getPublicProfile = (userId) => api.get(`/profile/${userId}`)