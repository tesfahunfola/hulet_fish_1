import axios from 'axios';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  (import.meta.env.PROD ? 'https://hulet-fish-tourism-1.onrender.com/api/v1' : 'http://localhost:3000/api/v1');
// API origin (used for static asset URLs returned by the backend, e.g. /img/...)
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? '';
      const isLoginRequest = requestUrl.includes('/users/login');
      const isAlreadyOnLoginPage = window.location.pathname === '/login';

      if (!isLoginRequest && !isAlreadyOnLoginPage) {
        // Token expired or invalid; clear stored auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/users/login', { email, password });
    return response.data;
  },
  signup: async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    const response = await api.post('/users/signup', {
      name,
      email,
      password,
      passwordConfirm
    });
    return response.data;
  },
  verifyEmail: async (token: string) => {
    const response = await api.get(`/users/verifyEmail/${token}`);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Tours API
export const toursAPI = {
  getAll: async (paramsObj?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (paramsObj) {
      Object.entries(paramsObj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '')
          params.append(k, String(v));
      });
    }
    const url = params.toString() ? `/tours?${params.toString()}` : '/tours';
    const response = await api.get(url);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/tours/${id}`);
    return response.data;
  },
  create: async (tourData: any) => {
    const response = await api.post('/tours', tourData);
    return response.data;
  },
  update: async (id: string, tourData: any) => {
    const response = await api.patch(`/tours/${id}`, tourData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/tours/${id}`);
    return response.data;
  },
  getTopCheap: async () => {
    const response = await api.get('/tours/top-5-cheap');
    return response.data;
  },
  getTourStats: async () => {
    const response = await api.get('/tours/tour-stats');
    return response.data;
  },
  getMonthlyPlan: async (year: number) => {
    const response = await api.get(`/tours/monthly-plan/${year}`);
    return response.data;
  },
  getToursWithin: async (
    distance: number,
    latlng: string,
    unit: string = 'mi'
  ) => {
    const response = await api.get(
      `/tours/tours-within/${distance}/center/${latlng}/unit/${unit}`
    );
    return response.data;
  },
  getDistances: async (latlng: string, unit: string = 'mi') => {
    const response = await api.get(`/tours/distances/${latlng}/unit/${unit}`);
    return response.data;
  }
};

// Users API
export const usersAPI = {
  getAll: async (filters?: { role?: string }) => {
    const params = new URLSearchParams();
    if (filters?.role) {
      params.append('role', filters.role);
    }
    const url = params.toString() ? `/users?${params.toString()}` : '/users';
    const response = await api.get(url);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  update: async (id: string, userData: any) => {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
  updateMe: async (userData: { name?: string; email?: string }) => {
    const response = await api.patch('/users/updateMe', userData);
    return response.data;
  },
  deleteMe: async () => {
    const response = await api.delete('/users/deleteMe');
    return response.data;
  },
  updateMyPassword: async (
    passwordCurrent: string,
    password: string,
    passwordConfirm: string
  ) => {
    const response = await api.patch('/users/updateMyPassword', {
      passwordCurrent,
      password,
      passwordConfirm
    });
    return response.data;
  },
  createUser: async (userData: {
    name: string;
    email: string;
    password: string;
    passwordConfirm: string;
    role?: string;
  }) => {
    const response = await api.post('/users', userData);
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/users/forgotPassword', { email });
    return response.data;
  },
  resetPassword: async (
    token: string,
    password: string,
    passwordConfirm: string
  ) => {
    const response = await api.patch(`/users/resetPassword/${token}`, {
      password,
      passwordConfirm
    });
    return response.data;
  }
};

// Reviews API
export const reviewsAPI = {
  getAll: async (paramsObj?: Record<string, any>) => {
    const params = new URLSearchParams();
    if (paramsObj) {
      Object.entries(paramsObj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '')
          params.append(k, String(v));
      });
    }
    const url = params.toString()
      ? `/reviews?${params.toString()}`
      : '/reviews';
    const response = await api.get(url);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },
  create: async (reviewData: {
    review: string;
    rating: number;
    tour: string;
  }) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },
  update: async (
    id: string,
    reviewData: { review?: string; rating?: number }
  ) => {
    const response = await api.patch(`/reviews/${id}`, reviewData);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },
  getReviewsForTour: async (
    tourId: string,
    paramsObj?: Record<string, any>
  ) => {
    const params = new URLSearchParams();
    if (paramsObj) {
      Object.entries(paramsObj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '')
          params.append(k, String(v));
      });
    }
    const url = params.toString()
      ? `/tours/${tourId}/reviews?${params.toString()}`
      : `/tours/${tourId}/reviews`;
    const response = await api.get(url);
    return response.data;
  },
  createReviewForTour: async (
    tourId: string,
    reviewData: { review: string; rating: number }
  ) => {
    const response = await api.post(`/tours/${tourId}/reviews`, reviewData);
    return response.data;
  }
};

// Bookings API
export const bookingsAPI = {
  getAll: async () => {
    // Placeholder - would need backend booking endpoints
    throw new Error('Booking functionality not yet implemented in backend');
  },
  getById: async (id: string) => {
    // Placeholder - would need backend booking endpoints
    throw new Error('Booking functionality not yet implemented in backend');
  },
  create: async (tourId: string) => {
    // Calls backend to create a checkout session (Chapa)
    // backend route: GET /api/v1/bookings/checkout-session/:tourId
    const response = await api.get(`/bookings/checkout-session/${tourId}`);
    return response.data;
  },
  createTestBooking: async (tourId: string) => {
    // Development only - creates a test booking without payment
    const response = await api.post(`/bookings/test-booking/${tourId}`);
    return response.data;
  },
  verify: async (txRef: string) => {
    const response = await api.get(`/bookings/verify/${txRef}`);
    return response.data;
  },
  getMyBookings: async () => {
    const response = await api.get('/bookings/me');
    return response.data;
  }
};

// Community Metrics API
export const communityMetricsAPI = {
  getAll: async () => {
    const response = await api.get('/community-metrics');
    return response.data;
  },
  getIncomeByRegion: async () => {
    const response = await api.get('/community-metrics/income-by-region');
    return response.data;
  },
  getGenderParticipation: async () => {
    const response = await api.get('/community-metrics/gender-participation');
    return response.data;
  }
};

// Emissions API
export const emissionsAPI = {
  getEmissionFactors: async () => {
    const response = await api.get('/emissions/factors');
    return response.data;
  },
  calculateEmissions: async (data: {
    transportType: string;
    distance: number;
    travelers?: number;
    tourId?: string;
  }) => {
    const response = await api.post('/emissions/calculate', data);
    return response.data;
  },
  getUserEcoScores: async (userId?: string) => {
    const url = userId ? `/emissions/eco-scores/${userId}` : '/emissions/eco-scores';
    const response = await api.get(url);
    return response.data;
  },
  createEcoScore: async (data: {
    bookingId: string;
    transportType: string;
    distance: number;
    travelers?: number;
    origin?: string;
    destination?: string;
  }) => {
    const response = await api.post('/emissions/eco-scores', data);
    return response.data;
  },
  getCarbonOffsets: async () => {
    const response = await api.get('/emissions/carbon-offsets');
    return response.data;
  },
  purchaseCarbonOffset: async (data: {
    bookingId: string;
    projectId: string;
    amount: number;
  }) => {
    const response = await api.post('/emissions/carbon-offsets/purchase', data);
    return response.data;
  }
};

export default api;
