import axios from 'axios'

const api = axios.create({
    // in production the browser talks to the same domain, and Vercel forwards /api to the server
    baseURL: import.meta.env.PROD ? "" : (import.meta.env.VITE_BASE_URL || 'http://localhost:3000'),
    withCredentials: true
})

export default api