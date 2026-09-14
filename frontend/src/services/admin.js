import api from './api'

// Admin APIs — backend enforces the admin role; these simply reuse the
// existing Axios instance from services/api.js (JWT auto).

export const getAdminStats = () => api.get('/admin/stats')

export const getAdminAnalytics = () => api.get('/admin/analytics')

export const getAdminUsers = (params) => api.get('/admin/users', { params })

export const getAdminUser = (id) => api.get(`/admin/users/${id}`)

export const updateAdminUser = (id, data) => api.put(`/admin/users/${id}`, data)

export const getAdminSkills = (params) => api.get('/admin/skills', { params })

export const deleteAdminSkill = (id) => api.delete(`/admin/skills/${id}`)

export const getAdminExchanges = (params) => api.get('/admin/exchanges', { params })

export const getAdminSessions = (params) => api.get('/admin/sessions', { params })

export const getAdminReviews = (params) => api.get('/admin/reviews', { params })

export const deleteAdminReview = (id) => api.delete(`/admin/reviews/${id}`)