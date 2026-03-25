
import { API_ENDPOINTS, ROOT_URL } from './constants';

const defaultHeaders = {
    'Content-Type': 'application/json',
};

/**
 * Generic fetch wrapper for PetNexa API
 */
async function apiRequest(url: string, options: RequestInit = {}) {
    const isFormData = options.body instanceof FormData;
    const headers: any = {
        ...options.headers,
    };

    // Only add JSON content type if it's not FormData
    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Request failed: ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    // Auth
    login: (credentials: any) =>
        apiRequest(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),

    signup: (role: string, data: any) => {
        let endpoint = API_ENDPOINTS.SIGNUP_BUYER;
        if (role === 'seller') endpoint = API_ENDPOINTS.SIGNUP_SELLER;
        if (role === 'doctor') endpoint = API_ENDPOINTS.SIGNUP_DOCTOR;
        if (role === 'spa' || role === 'spa_owner' || role === 'SPA_OWNER') endpoint = API_ENDPOINTS.SIGNUP_SPA;

        return apiRequest(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    verifySignup: (email: string, otp: string) =>
        apiRequest(`${API_ENDPOINTS.AUTH}?action=verify_signup`, {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        }),

    uploadProfileImage: (userId: number, role: string, base64Image: string) =>
        apiRequest(ROOT_URL + 'upload_profile_image.php', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId, role, profile_image: base64Image }),
        }),

    forgotPassword: {
        sendOtp: (email: string) =>
            apiRequest(`${API_ENDPOINTS.FORGOT_PASSWORD}?action=send_otp`, {
                method: 'POST',
                body: JSON.stringify({ email }),
            }),
        verifyOtp: (email: string, otp: string) =>
            apiRequest(`${API_ENDPOINTS.FORGOT_PASSWORD}?action=verify_otp`, {
                method: 'POST',
                body: JSON.stringify({ email, otp }),
            }),
        resetPassword: (email: string, otp: string, new_password: string) =>
            apiRequest(`${API_ENDPOINTS.FORGOT_PASSWORD}?action=reset_password`, {
                method: 'POST',
                body: JSON.stringify({ email, otp, new_password }),
            }),
    },

    // Reviews (parameters: action=get&type=[role]&target_id=[id])
    getReviews: (type: string, target_id: string) => {
        const url = `${API_ENDPOINTS.REVIEW}?action=get&type=${type}&target_id=${target_id}`;
        return apiRequest(url);
    },

    postReview: (data: any) =>
        apiRequest(API_ENDPOINTS.REVIEW, {
            method: 'POST',
            body: JSON.stringify({ ...data, action: 'add' }),
        }),

    // Seller-specific
    getSellerOrders: (sellerId: number) =>
        apiRequest(`${API_ENDPOINTS.PET_ORDER}?action=get_seller_orders&seller_id=${sellerId}`),

    getSellerListings: (sellerId: number) =>
        apiRequest(`${ROOT_URL}get_seller_listings.php?seller_id=${sellerId}`),

    addPetListing: (data: any) =>
        apiRequest(`${API_ENDPOINTS.PET_LISTING_MANAGEMENT}?action=add`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    deletePetListing: (listingId: number, sellerId: number) =>
        apiRequest(`${API_ENDPOINTS.PET_LISTING_MANAGEMENT}?action=delete`, {
            method: 'POST',
            body: JSON.stringify({ listing_id: listingId, seller_id: sellerId }),
        }),

    // Dashboard Data
    getDashboard: (role: string, id: number) => {
        let endpoint = API_ENDPOINTS.BUYER_DASHBOARD + `?buyer_id=${id}`;
        if (role === 'seller') endpoint = API_ENDPOINTS.SELLER_DASHBOARD + `?seller_id=${id}`;
        if (role === 'doctor') endpoint = API_ENDPOINTS.DOCTOR_DASHBOARD + `?doctor_id=${id}`;
        if (role === 'spa' || role === 'spa_owner' || role === 'SPA_OWNER') {
            endpoint = API_ENDPOINTS.SPA_DASHBOARD.includes('?') 
                ? `${API_ENDPOINTS.SPA_DASHBOARD}&user_id=${id}`
                : `${API_ENDPOINTS.SPA_DASHBOARD}?user_id=${id}`;
        }

        return apiRequest(endpoint);
    },

    // Breed Analysis
    getBreedAnalysis: (breed: string) => 
        apiRequest(`${ROOT_URL}get_breed_analysis.php?breed=${encodeURIComponent(breed)}`),

    // AI Predict
    aiPredict: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return apiRequest(API_ENDPOINTS.AI_PREDICT, {
            method: 'POST',
            body: formData,
        });
    },

    // Generic GET
    get: (url: string) => apiRequest(url, { method: 'GET' }),

    // Generic POST
    post: (url: string, data: any) => apiRequest(url, {
        method: 'POST',
        body: JSON.stringify(data),
    }),
};
