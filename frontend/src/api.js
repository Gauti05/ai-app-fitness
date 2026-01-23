// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'http://localhost:5000/api',
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Add a request interceptor
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers['x-auth-token'] = token; // This header key must match your backend middleware!
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// export default api;



import axios from 'axios';

// LOGIC: If we are in production (Render), use the relative path '/api'.
// If we are developing locally, use the full localhost URL.
const BASE_URL = import.meta.env.MODE === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;