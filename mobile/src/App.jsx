/* eslint-disable react/prop-types */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import HouseDetail from './pages/HouseDetail';
import Login from './pages/Login';
import Publish from './pages/Publish';
import My from './pages/My';
import EditProfile from './pages/EditProfile';
import EditHouse from './pages/EditHouse';

function PrivateRoute({ children = null }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/house/:id" element={<HouseDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/publish" element={<PrivateRoute><Publish /></PrivateRoute>} />
        <Route path="/my" element={<PrivateRoute><My /></PrivateRoute>} />
        <Route path="/edit-profile" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
        <Route path="/edit-house/:id" element={<PrivateRoute><EditHouse /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
