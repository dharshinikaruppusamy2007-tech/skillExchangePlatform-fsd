import api from './api'

// Reuses the existing Axios instance (JWT attached automatically).
// Refer to /api/skills/discover?skill=&category=&proficiency=&type=
export const discoverSkills = (params = {}) => api.get('/skills/discover', { params })