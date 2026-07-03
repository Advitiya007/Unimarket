import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import Dashboard from './pages/Dashboard';
import ChatsList from './pages/ChatsList';
import ChatRoom from './pages/ChatRoom';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/listings/:id" element={<ListingDetail />} />
      <Route path="/users/:id" element={<Profile />} />

      <Route path="/sell" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/chats" element={<ProtectedRoute><ChatsList /></ProtectedRoute>} />
      <Route path="/chats/:id" element={<ProtectedRoute><ChatRoom /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
