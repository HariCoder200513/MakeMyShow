import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="py-8">
        <Outlet />
      </main>
    </>
  );
}
