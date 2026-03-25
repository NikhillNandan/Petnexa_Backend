export const ROOT_URL = 'http://14.139.187.229:8081/jan2026/spic741/petnexa/';

export const API_ENDPOINTS = {
    // Auth
    AUTH: ROOT_URL + 'auth.php',
    LOGIN: ROOT_URL + 'auth.php?action=login',
    SIGNUP_BUYER: ROOT_URL + 'auth.php?action=signup&role=buyer',
    SIGNUP_SELLER: ROOT_URL + 'auth.php?action=signup&role=seller',
    SIGNUP_DOCTOR: ROOT_URL + 'auth.php?action=signup&role=doctor',
    SIGNUP_SPA: ROOT_URL + 'auth.php?action=signup&role=SPA_OWNER',

    // Seller
    SELLER_DASHBOARD: ROOT_URL + 'get_seller_dashboard.php',
    PET_LISTING_DATA: ROOT_URL + 'pet_listing_data.php',
    PET_LISTING_MANAGEMENT: ROOT_URL + 'pet_listing_management.php',
    PET_ORDER: ROOT_URL + 'pet_order.php',

    // Doctor
    DOCTOR_DASHBOARD: ROOT_URL + 'get_doctor_dashboard.php',
    TODAY_APPOINTMENTS: ROOT_URL + 'get_today_appointments.php',
    APPOINTMENT_DATA: ROOT_URL + 'appointment_data.php',
    CERTIFICATE_MANAGEMENT: ROOT_URL + 'certificate_management.php',

    // Spa
    SPA_DASHBOARD: ROOT_URL + 'get_spa_dashboard_stats.php',
    SPA_SERVICE_MANAGEMENT: ROOT_URL + 'spa_service_management.php',
    GET_BOOKING_REQUESTS: ROOT_URL + 'get_booking_requests.php',

    // Buyer
    BUYER_DASHBOARD: ROOT_URL + 'get_buyer_dashboard.php',
    GET_PETS: ROOT_URL + 'get_all_pet_listings.php',
    GET_DOCTORS: ROOT_URL + 'doctor.php?action=get_list',
    GET_SPAS: ROOT_URL + 'get_spas.php',
    BOOK_DOCTOR: ROOT_URL + 'book_doctor_appointment.php',
    BOOK_SPA: ROOT_URL + 'book_spa.php',
    SAVE_PET: ROOT_URL + 'save_pet.php',
    GET_SAVED_PETS: ROOT_URL + 'get_saved_pets.php',
    GET_PURCHASES: ROOT_URL + 'pet_order.php?action=get_buyer_orders',
    GET_APPOINTMENTS: ROOT_URL + 'get_appointments.php',
    GET_BUYER_PETS: ROOT_URL + 'get_buyer_pets.php',
    BUYER_PET_MANAGEMENT: ROOT_URL + 'buyer_pet_management.php',

    // Shared
    USER_PROFILE: ROOT_URL + 'user_profile.php',
    REVIEW: ROOT_URL + 'review.php',
    CHAT: ROOT_URL + 'chat_management.php',
    NOTIFICATIONS: ROOT_URL + 'notification_management.php',
    GET_LISTING_DETAILS: ROOT_URL + 'get_listing_details.php',
    GET_TRANSACTIONS: ROOT_URL + 'transaction.php?action=get_transactions',
    FORGOT_PASSWORD: ROOT_URL + 'forgot_password.php',
    AI_PREDICT: 'http://180.235.121.253:8077/predict'
};
