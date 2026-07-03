import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiBell, FiMessageCircle, FiPlus, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    api.get('/users/notifications').then(({ data }) => setNotifications(data)).catch(() => {});
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(search)}`);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 border-b border-campus-ink/5 bg-campus-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-4">
        <Link to="/" className="shrink-0">
          <span className="h-display text-2xl italic text-campus-ink">UniMarket</span>
        </Link>

        <form onSubmit={submitSearch} className="hidden flex-1 md:flex">
          <div className="input-with-icon w-full max-w-md">
            <FiSearch className="text-campus-ink/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search books, cycles, electronics…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-campus-ink/40"
            />
          </div>
        </form>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {user && (
            <>
              <Link to="/sell" className="btn-accent">
                <FiPlus /> Sell Item
              </Link>
              <Link to="/chats" className="badge-icon bg-white border border-campus-ink/10 hover:border-campus-ink/30">
                <FiMessageCircle className="text-campus-ink/70" />
              </Link>
              <div className="relative">
                <button
                  onClick={() => setNotifOpen((v) => !v)}
                  className="badge-icon relative bg-white border border-campus-ink/10 hover:border-campus-ink/30"
                >
                  <FiBell className="text-campus-ink/70" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-campus-orange text-[10px] font-semibold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-campus-ink/10 bg-white p-2 shadow-cardHover">
                    <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-campus-ink/40">
                      Notifications
                    </p>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 && (
                        <p className="px-3 py-6 text-center text-sm text-campus-ink/40">Nothing yet</p>
                      )}
                      {notifications.map((n) => (
                        <Link
                          key={n._id}
                          to={n.link || '#'}
                          onClick={() => setNotifOpen(false)}
                          className={`block rounded-xl px-3 py-2 text-sm hover:bg-campus-paper ${
                            !n.read ? 'bg-campus-blue-50/60 font-medium' : ''
                          }`}
                        >
                          {n.message}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full bg-campus-blue-500 text-sm font-semibold text-white"
                >
                  {user.name?.charAt(0).toUpperCase()}
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-campus-ink/10 bg-white p-2 shadow-cardHover">
                    <Link to="/profile" className="block rounded-xl px-3 py-2 text-sm hover:bg-campus-paper">
                      My Profile
                    </Link>
                    <Link to="/dashboard" className="block rounded-xl px-3 py-2 text-sm hover:bg-campus-paper">
                      Dashboard
                    </Link>
                    <Link to="/wishlist" className="block rounded-xl px-3 py-2 text-sm hover:bg-campus-paper">
                      Wishlist
                    </Link>
                    {user.isAdmin && (
                      <Link to="/admin" className="block rounded-xl px-3 py-2 text-sm hover:bg-campus-paper">
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-campus-orange-600 hover:bg-campus-orange-50"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {!user && (
            <>
              <Link to="/login" className="btn-secondary">Log in</Link>
              <Link to="/register" className="btn-primary">Join UniMarket</Link>
            </>
          )}
        </nav>

        <button className="ml-auto md:hidden" onClick={() => setMenuOpen((v) => !v)}>
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-campus-ink/5 px-5 py-4 md:hidden">
          <form onSubmit={submitSearch} className="mb-3">
            <div className="input-with-icon">
              <FiSearch className="text-campus-ink/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search listings…"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </form>
          <div className="flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/sell" className="btn-accent w-full">Sell Item</Link>
                <Link to="/chats" className="btn-secondary w-full">Messages</Link>
                <Link to="/dashboard" className="btn-secondary w-full">Dashboard</Link>
                <Link to="/profile" className="btn-secondary w-full">Profile</Link>
                <button onClick={() => { logout(); navigate('/login'); }} className="btn-secondary w-full text-campus-orange-600">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary w-full">Log in</Link>
                <Link to="/register" className="btn-primary w-full">Join UniMarket</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
