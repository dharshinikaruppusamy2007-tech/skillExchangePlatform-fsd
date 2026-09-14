import api from './api'

// These reuse the existing Axios instance from services/api.js, which already
// attaches the Authorization: Bearer <token> header when a token exists.

// Get available skills with optional filters: { search, category, level, type }
export const getSkills = (params) => api.get('/skills', { params })

// Get the currently logged-in user's own skills
export const getMySkills = () => api.get('/skills', { params: { owner: 'me' } })

export const getSkillById = (id) => api.get(`/skills/${id}`)

export const createSkill = (data) => api.post('/skills', data)

export const updateSkill = (id, data) => api.put(`/skills/${id}`, data)

export const deleteSkill = (id) => api.delete(`/skills/${id}`)