import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import RoleSelection from './pages/RoleSelection';
import Login from './pages/Login';
import RoleSignup from './pages/RoleSignup';
import ForgotPassword from './pages/ForgotPassword';
import Landing from './pages/Landing';

// Dashboards
import BuyerDashboard from './pages/buyer/Dashboard';
import SellerDashboard from './pages/seller/Dashboard';
import DoctorDashboard from './pages/doctor/Dashboard';
import SpaDashboard from './pages/spa/Dashboard';

import BreedDetection from './pages/BreedDetection';

// Buyer Pages
import Marketplace, { SavedPets } from './pages/buyer/Marketplace';
import Doctors from './pages/buyer/Doctors';
import BuyerAppointments from './pages/buyer/Appointments';
import Spas from './pages/buyer/Spas';
import PetDetails from './pages/buyer/PetDetails';
import DoctorDetails from './pages/buyer/DoctorDetails';
import SpaDetails from './pages/buyer/SpaDetails';
import BookAppointment from './pages/buyer/BookAppointment';
import OrderConfirmation from './pages/buyer/OrderConfirmation';

// Seller Pages
import SellerListings from './pages/seller/Listings';
import AddListing from './pages/seller/AddListing';
import EditListing from './pages/seller/EditListing';
import MyPets from './pages/MyPets';
import BuyerOrders from './pages/buyer/Orders';

// Shared
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Reviews from './pages/Reviews';
import Transactions from './pages/Transactions';
import About from './pages/support/About';
import PrivacyPolicy from './pages/support/PrivacyPolicy';
import TermsOfService from './pages/support/TermsOfService';
import DoctorAvailability from './pages/doctor/Availability';
import SpaAvailability from './pages/spa/Availability';

// Placeholder wrappers for sub-pages to fulfill 'connection' requirements
const SellerOrders = () => <SellerDashboard view="orders" />;
const DoctorAppointments = () => <DoctorDashboard view="appointments" />;
const SpaServices = () => <SpaDashboard view="services" />;
const SpaBookings = () => <SpaDashboard view="bookings" />;

// Buyer Workspace Placeholders
const OrderHistory = () => <BuyerOrders />;
const MyReviews = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return <Reviews role={user.role || 'buyer'} />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* New Landing Page */}
                <Route path="/" element={<Landing />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/login/:role" element={<Login />} />
                <Route path="/signup" element={<RoleSignup />} />
                <Route path="/signup/:role" element={<RoleSignup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/forgot-password/:role" element={<ForgotPassword />} />

                {/* Dashboards */}
                <Route path="/dashboard/buyer" element={<BuyerDashboard />} />
                <Route path="/dashboard/seller" element={<SellerDashboard />} />
                <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
                <Route path="/dashboard/spa" element={<SpaDashboard />} />
                <Route path="/dashboard/spa_owner" element={<SpaDashboard />} />

                {/* Buyer Pages */}
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/orders" element={<BuyerOrders />} />
                <Route path="/saved-pets" element={<SavedPets />} />
                <Route path="/appointments" element={<BuyerAppointments />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/spas" element={<Spas />} />
                <Route path="/order-success" element={<OrderConfirmation />} />

                {/* Buyer Workspace */}
                <Route path="/reviews" element={<MyReviews />} />
                <Route path="/my-pets" element={<MyPets role="buyer" />} />

                {/* Detail Pages */}
                <Route path="/pet/:id" element={<PetDetails />} />
                <Route path="/doctor/:id" element={<DoctorReviewWrapper />} />
                <Route path="/spa/:id" element={<SpaReviewWrapper />} />
                <Route path="/book/:type/:id" element={<BookReviewWrapper />} />

                {/* Seller Pages */}
                <Route path="/seller/listings" element={<SellerListings />} />
                <Route path="/seller/add-listing" element={<AddListing />} />
                <Route path="/seller/edit-listing/:id" element={<EditListing />} />
                <Route path="/seller/my-pets" element={<MyPets role="seller" />} />
                <Route path="/seller/orders" element={<SellerOrders />} />
                <Route path="/seller/appointments" element={<BuyerAppointments role="seller" />} />
                <Route path="/seller/doctors" element={<Doctors role="seller" />} />
                <Route path="/seller/spas" element={<Spas role="seller" />} />
                <Route path="/seller/earnings" element={<SellerDashboard view="earnings" />} />
                <Route path="/seller/reviews" element={<Reviews role="seller" />} />
                <Route path="/seller/doctor/:id" element={<DoctorDetails role="seller" />} />
                <Route path="/seller/spa/:id" element={<SpaDetails role="seller" />} />
                <Route path="/seller/book/:type/:id" element={<BookAppointment role="seller" />} />

                {/* Doctor Pages */}
                <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                <Route path="/doctor/analytics" element={<DoctorDashboard view="analytics" />} />
                <Route path="/doctor/reviews" element={<Reviews role="doctor" />} />

                {/* Spa Pages */}
                <Route path="/spa/services" element={<SpaServices />} />
                <Route path="/spa/bookings" element={<SpaBookings />} />
                <Route path="/spa/reviews" element={<Reviews role="spa" />} />

                {/* Shared Pages */}
                <Route path="/messages" element={<Messages />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/transactions/:role" element={<TransactionsWrapper />} />

                {/* Role-based Shared Pages */}
                <Route path="/profile" element={<ProfileWrapper />} />
                <Route path="/profile/:role" element={<ProfileWrapper />} />
                <Route path="/settings" element={<SettingsWrapper />} />
                <Route path="/settings/:role" element={<SettingsWrapper />} />
                
                {/* Support & Legal */}
                <Route path="/about" element={<AboutWrapper />} />
                <Route path="/about/:role" element={<AboutWrapper />} />
                <Route path="/privacy" element={<PrivacyWrapper />} />
                <Route path="/privacy/:role" element={<PrivacyWrapper />} />
                <Route path="/terms" element={<TermsWrapper />} />
                <Route path="/terms/:role" element={<TermsWrapper />} />

                {/* Availability */}
                <Route path="/doctor/availability" element={<DoctorAvailability />} />
                <Route path="/spa/availability" element={<SpaAvailability />} />

                {/* AI Features */}
                <Route path="/breed-detection" element={<BreedDetection />} />
                <Route path="/seller/breed-detection" element={<BreedDetection />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

const ProfileWrapper = () => {
    const { role } = useParams();
    const stored = localStorage.getItem('role');
    return <Profile role={role || stored || 'buyer'} />;
};

const SettingsWrapper = () => {
    const { role } = useParams();
    const stored = localStorage.getItem('role');
    return <Settings role={role || stored || 'buyer'} />;
};

const TransactionsWrapper = () => {
    const { role } = useParams();
    const stored = localStorage.getItem('role');
    return <Transactions role={role || stored || 'buyer'} />;
};

const AboutWrapper = () => {
    const { role } = useParams();
    const stored = localStorage.getItem('role');
    return <About role={role || stored || 'buyer'} />;
};

const PrivacyWrapper = () => {
    const { role } = useParams();
    const stored = localStorage.getItem('role');
    return <PrivacyPolicy role={role || stored || 'buyer'} />;
};

const TermsWrapper = () => {
    const { role } = useParams();
    const stored = localStorage.getItem('role');
    return <TermsOfService role={role || stored || 'buyer'} />;
};


const DoctorReviewWrapper = () => {
    const { role } = useParams();
    // Try to get role from path if possible, or default to buyer
    // But since the path doesn't have role usually, we might need a workaround.
    // However, for simplicity now, let's use a simpler approach.
    const currentRole = window.location.pathname.includes('/seller/') ? 'seller' : 'buyer';
    return <DoctorDetails role={currentRole} />;
};



const SpaReviewWrapper = () => {
    const currentRole = window.location.pathname.includes('/seller/') ? 'seller' : 'buyer';
    return <SpaDetails role={currentRole} />;
};

const BookReviewWrapper = () => {
    const currentRole = window.location.pathname.includes('/seller/') ? 'seller' : 'buyer';
    return <BookAppointment role={currentRole} />;
};

export default App;
