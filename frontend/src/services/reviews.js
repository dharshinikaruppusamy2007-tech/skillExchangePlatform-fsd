import api from './api'

// These reuse the existing Axios instance from services/api.js (JWT auto).

export const createReview = (data) => api.post('/reviews', data)

export const getReviewsForUser = (userId) => api.get(`/reviews/user/${userId}`)

export const getReviewsForSkill = (skillId) => api.get(`/reviews/skill/${skillId}`)

export const getReviewsForSession = (sessionId) => api.get(`/reviews/session/${sessionId}`)

export const getMyReviews = () => api.get('/reviews/my')

export const deleteReview = (id) => api.delete(`/reviews/${id}`)