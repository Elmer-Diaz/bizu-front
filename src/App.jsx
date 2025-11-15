import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import GuestRoute from "./components/GuestRoute";

import './App.css';

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import AccountsList from './pages/AccountsList';
import Terms from "./pages/Terms";
import AccountEdit from "./pages/AccountEdit";
import AdminEditAccount from "./pages/AdminEditAccount";
import ContactPQR from "./pages/ContactPQR";
import AdminPQR from "./pages/AdminPQR";
import AdminContactMessages from "./pages/AdminContactMessages";
import ChatThreadPage from "./pages/ChatThreadPage";
import ChatThreadsList from "./pages/ChatThreadsList";



function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />

       <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<GuestRoute> <Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/profile/:uuid" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/accounts-list" element={<AccountsList />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/account/edit" element={<AccountEdit />} />
            <Route path="/admin/edit-account/:uuid" element={<AdminEditAccount />} />
            <Route path="/contacto" element={<ContactPQR />} />
            <Route path="/admin/pqr" element={<AdminPQR />} />
            <Route path="/admin/contact-messages" element={<AdminContactMessages />} />
            <Route path="/chats" element={<ChatThreadsList />} />
            <Route path="/chat/:threadUuid" element={<ChatThreadPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
