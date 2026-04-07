import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from './store';

export interface EventMasterRecord {
  id: number;
  maximumCount: number;
  appliedCount: number;
  balanceCount: number;
  applyByStudent: boolean;
  eventCode: string;
  eventName: string;
  eventOrganizer: string | null;
  webLink: string | null;
  eventCategory: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  durationDays: number | null;
  eventLocation: string | null;
  eventLevel: string | null;
  state: string | null;
  country: string | null;
  withinBit: boolean;
  relatedToSpecialLab: boolean;
  department: string | null;
  competitionName: string | null;
  totalLevelOfCompetition: string | null;
  eligibleForRewards: boolean;
  winnerRewards: string | null;
  createdDate: string;
  updatedDate: string;
}

export interface CreateEventPayload {
  maximumCount: number;
  appliedCount: number;
  balanceCount: number;
  applyByStudent: boolean;
  eventCode: string;
  eventName: string;
  eventOrganizer?: string | null;
  webLink?: string | null;
  eventCategory?: string | null;
  status: string;
  startDate?: string | null;
  endDate?: string | null;
  durationDays?: number | null;
  eventLocation?: string | null;
  eventLevel?: string | null;
  state?: string | null;
  country?: string | null;
  withinBit: boolean;
  relatedToSpecialLab: boolean;
  department?: string | null;
  competitionName?: string | null;
  totalLevelOfCompetition?: string | null;
  eligibleForRewards: boolean;
  winnerRewards?: string | null;
}

export interface EventRegistrationRecord {
  id: number;
  eventId: number;
  studentId: number | null;
  studentName: string;
  studentEmail: string | null;
  studentDepartment: string | null;
  eventCategory: string | null;
  activityEvent: string | null;
  fromDate: string | null;
  toDate: string | null;
  modeOfParticipation: string | null;
  iqacVerification: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  verifiedBy: number | null;
  verifiedAt: string | null;
  createdDate: string;
  updatedDate: string;
  eventName: string;
  eventCode: string;
  eventOrganizer: string | null;
  eventLevel: string | null;
}

export interface CreateRegistrationPayload {
  eventId: number;
  studentName: string;
  studentDepartment?: string | null;
  eventCategory?: string | null;
  activityEvent?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  modeOfParticipation?: string | null;
  iqacVerification?: string | null;
}

const apiBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const client: AxiosInstance = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = useAuthStore.getState().token;
      // Don't auto-logout for demo tokens — they don't hit a real backend
      if (token && !token.startsWith('demo-')) {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  // Auth endpoints
  register: async (data: {
    email: string;
    password: string;
    name: string;
    employeeId: string;
  }) => {
    const response = await client.post('/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await client.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  verify: async () => {
    const response = await client.post('/auth/verify');
    return response.data;
  },

  getMe: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  },

  // Activity endpoints
  getMyActivities: async () => {
    const response = await client.get('/activities/my-activities');
    return response.data;
  },

  submitActivity: async (data: {
    activityTypeId: number;
    title: string;
    description: string;
    activityDate: string;
    proofDocumentPath?: string;
    additionalData?: Record<string, any>;
  }) => {
    const response = await client.post('/activities/submit', data);
    return response.data;
  },

  getPendingActivities: async (departmentId?: number) => {
    const response = await client.get('/activities/pending', {
      params: { departmentId },
    });
    return response.data;
  },

  approveActivity: async (activityId: number, pointsEarned: number) => {
    const response = await client.post(`/activities/${activityId}/approve`, {
      pointsEarned,
    });
    return response.data;
  },

  rejectActivity: async (activityId: number, rejectionReason: string) => {
    const response = await client.post(`/activities/${activityId}/reject`, {
      rejectionReason,
    });
    return response.data;
  },

  getDepartmentActivities: async (departmentId: number, academicYear?: string) => {
    const response = await client.get(`/activities/department/${departmentId}`, {
      params: { academicYear },
    });
    return response.data;
  },

  getActivityStats: async (departmentId: number, academicYear?: string) => {
    const response = await client.get(`/activities/stats/department/${departmentId}`, {
      params: { academicYear },
    });
    return response.data;
  },

  importEventsAttendedCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await client.post('/import/events-attended/csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getEvents: async (params?: { sort?: 'asc' | 'desc' }): Promise<{ events: EventMasterRecord[] }> => {
    const searchParams = new URLSearchParams();
    const token = useAuthStore.getState().token;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (params?.sort) {
      searchParams.set('sort', params.sort);
    }

    const response = await fetch(`/api/events${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      throw new Error(errorPayload?.error || `Failed to load events (${response.status})`);
    }

    return response.json();
  },

  createEvent: async (data: CreateEventPayload): Promise<{ message: string; event: EventMasterRecord }> => {
    const token = useAuthStore.getState().token;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch('/api/events', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      throw new Error(errorPayload?.error || `Failed to create event (${response.status})`);
    }

    return response.json();
  },

  registerForEvent: async (data: CreateRegistrationPayload): Promise<{ message: string; registration: EventRegistrationRecord }> => {
    const response = await client.post('/registrations', data);
    return response.data;
  },

  getVerificationRegistrations: async (status?: 'pending' | 'approved' | 'rejected'): Promise<{ registrations: EventRegistrationRecord[] }> => {
    const response = await client.get('/registrations/verification', {
      params: { status },
    });
    return response.data;
  },

  approveRegistration: async (registrationId: number): Promise<{ message: string; registration: EventRegistrationRecord }> => {
    const response = await client.post(`/registrations/${registrationId}/approve`);
    return response.data;
  },

  rejectRegistration: async (registrationId: number, reason: string): Promise<{ message: string; registration: EventRegistrationRecord }> => {
    const response = await client.post(`/registrations/${registrationId}/reject`, { reason });
    return response.data;
  },
};

export default client;
