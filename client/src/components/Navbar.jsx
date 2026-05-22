import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Ticket } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';

export default function Navbar() {
  const { user, hydrated, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-rose-700">
          <Ticket size={22} />
          MakeMyShow
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <NavLink to="/" className="text-slate-700 hover:text-rose-700">Movies</NavLink>
          {user?.role === 'USER' && <NavLink to="/my-bookings" className="text-slate-700 hover:text-rose-700">My Bookings</NavLink>}
          {user?.role === 'OWNER' && <NavLink to="/owner/theaters" className="text-slate-700 hover:text-rose-700">Owner</NavLink>}
          {!hydrated ? null : !user ? (
            <>
              <Link to="/login" className="rounded-md border border-slate-300 px-3 py-2">Login</Link>
              <Link to="/signup" className="rounded-md bg-rose-700 px-3 py-2 text-white">Signup</Link>
            </>
          ) : (
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300"
              title="Logout"
              onClick={() => {
                logout();
                navigate('/');
              }}
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}
