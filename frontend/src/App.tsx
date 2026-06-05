import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MobileOnly from './components/MobileOnly';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Intro1 from './pages/Intro1';
import Intro2 from './pages/Intro2';
import Intro3 from './pages/Intro3';
import Intro4 from './pages/Intro4';
import RoleSelection from './pages/RoleSelection';
import SignUp from './pages/SignUp';
import SignUpForm from './pages/SignUpForm';
import SignUpForm2 from './pages/SignUpForm2';
import VerifyEmail from './pages/VerifyEmail';
import EmailSent from './pages/EmailSent';
import Location from './pages/Location';
import Map from './pages/Map';
import Complete from './pages/Complete';
import SignInForm from './pages/SignInForm';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Home from './pages/Home';
import MealDetails from './pages/MealDetails';
import Restaurants from './pages/Restaurants';
import RestaurantProfile from './pages/RestaurantProfile';
import Wallet from './pages/Wallet';
import WalletTransactions from './pages/WalletTransactions';
import AddCard from './pages/AddCard';
import Discover from './pages/Discover';
import Support from './pages/Support';
import SupportChat from './pages/SupportChat';
import Deposit from './pages/Deposit';
import DepositBankTransferDetails from './pages/DepositBankTransferDetails';
import DepositSuccess from './pages/DepositSuccess';
import Cart from './pages/Cart';
import Order from './pages/Order';
import Logout from './pages/Logout';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <MobileOnly>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/intro1" element={<Intro1 />} />
          <Route path="/intro2" element={<Intro2 />} />
          <Route path="/intro3" element={<Intro3 />} />
          <Route path="/intro4" element={<Intro4 />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup-form" element={<SignUpForm />} />
          <Route path="/email-sent" element={<EmailSent />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/signin-form" element={<SignInForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/logout" element={<Logout />} />

          {/* Protected Routes - require authentication */}
          <Route path="/signup-form-2" element={<ProtectedRoute><SignUpForm2 /></ProtectedRoute>} />
          <Route path="/location" element={<ProtectedRoute><Location /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
          <Route path="/complete" element={<ProtectedRoute><Complete /></ProtectedRoute>} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Order /></ProtectedRoute>} />
          <Route path="/meal/:id" element={<ProtectedRoute><MealDetails /></ProtectedRoute>} />
          <Route path="/restaurants" element={<ProtectedRoute><Restaurants /></ProtectedRoute>} />
          {/* Nested meal under restaurant — URL stays under /restaurant/... */}
          <Route
            path="/restaurant/:restaurantId/meal/:mealId"
            element={<ProtectedRoute><MealDetails /></ProtectedRoute>}
          />
          <Route path="/restaurant/:id" element={<ProtectedRoute><RestaurantProfile /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/wallet/add-card" element={<ProtectedRoute><AddCard /></ProtectedRoute>} />
          <Route path="/wallet/transactions" element={<ProtectedRoute><WalletTransactions /></ProtectedRoute>} />
          <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
          <Route path="/support/chat/:chatId" element={<ProtectedRoute><SupportChat /></ProtectedRoute>} />
          <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
          <Route
            path="/deposit/bank-transfer-details"
            element={<ProtectedRoute><DepositBankTransferDetails /></ProtectedRoute>}
          />
          <Route path="/deposit-success" element={<ProtectedRoute><DepositSuccess /></ProtectedRoute>} />
        </Routes>
      </MobileOnly>
    </BrowserRouter>
  );
}

export default App;
