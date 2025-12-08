import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MobileOnly from './components/MobileOnly';
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
import Location from './pages/Location';
import Map from './pages/Map';
import Complete from './pages/Complete';
import SignInForm from './pages/SignInForm';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
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
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/signup-form-2" element={<SignUpForm2 />} />
          <Route path="/location" element={<Location />} />
          <Route path="/map" element={<Map />} />
          <Route path="/complete" element={<Complete />} />
          <Route path="/signin-form" element={<SignInForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </MobileOnly>
    </BrowserRouter>
  );
}

export default App;
