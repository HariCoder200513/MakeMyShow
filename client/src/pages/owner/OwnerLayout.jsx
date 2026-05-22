import { NavLink, Outlet } from 'react-router-dom';

export default function OwnerLayout() {
  const links = [
    ['/owner/theaters', 'Theaters'],
    ['/owner/add-theater', 'Add Theater'],
    ['/owner/add-screen', 'Add Screen'],
    ['/owner/add-movie', 'Add Movie'],
    ['/owner/create-show', 'Create Show']
  ];

  return (
    <div className="container-page grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-3">
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">{label}</NavLink>
        ))}
      </aside>
      <Outlet />
    </div>
  );
}
