import { Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { api } from './api/client.js';
import { useAuthStore } from './store/authStore.js';
import MainLayout from './layouts/MainLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import MovieDetails from './pages/MovieDetails.jsx';
import TheaterSelection from './pages/TheaterSelection.jsx';
import SeatSelection from './pages/SeatSelection.jsx';
import Checkout from './pages/Checkout.jsx';
import BookingSuccess from './pages/BookingSuccess.jsx';
import MyBookings from './pages/MyBookings.jsx';
import OwnerLayout from './pages/owner/OwnerLayout.jsx';
import ManageOwnedTheaters from './pages/owner/ManageOwnedTheaters.jsx';
import AddTheater from './pages/owner/AddTheater.jsx';
import AddScreen from './pages/owner/AddScreen.jsx';
import AddMovie from './pages/owner/AddMovie.jsx';
import CreateShow from './pages/owner/CreateShow.jsx';

export default function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const finishHydration = useAuthStore((state) => state.finishHydration);

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => finishHydration());
  }, [setUser, finishHydration]);

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/theaters" element={<TheaterSelection />} />

          <Route element={<ProtectedRoute roles={['USER']} />}>
            <Route path="/shows/:showId/seats" element={<SeatSelection />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>

          <Route element={<ProtectedRoute roles={['OWNER']} />}>
            <Route path="/owner" element={<OwnerLayout />}>
              <Route path="theaters" element={<ManageOwnedTheaters />} />
              <Route path="add-theater" element={<AddTheater />} />
              <Route path="add-screen" element={<AddScreen />} />
              <Route path="add-movie" element={<AddMovie />} />
              <Route path="create-show" element={<CreateShow />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}
