import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiFilter, FiChevronDown } from 'react-icons/fi';
import MainLayout from '../layouts/MainLayout';
import ListingCard from '../components/ListingCard';
import { ListingCardSkeleton, EmptyState } from '../components/Loaders';
import { CATEGORIES, CONDITIONS, MEETUP_LOCATIONS } from '../utils/constants';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiPackage, FiSearch, FiInbox, FiBox } from 'react-icons/fi';


export default function Home() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    condition: '',
    meetupLocation: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });

  const search = searchParams.get('search') || '';

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { search, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/listings`, { params, withCredentials: true });
      setListings(data.listings || data);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    if (user) {
      axios.get(`${import.meta.env.REACT_APP_BASE_URL}/users/wishlist`, { withCredentials: true }).then(({ data }) => setWishlist(data.map((l) => l._id))).catch(() => {});
    }
  }, [user]);

  const toggleWishlist = async (listingId) => {
    if (!user) return;
    await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/users/wishlist/${listingId}`, {}, { withCredentials: true });
    setWishlist((prev) => (prev.includes(listingId) ? prev.filter((id) => id !== listingId) : [...prev, listingId]));
  };

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-campus-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 md:grid-cols-2 md:py-28">
          <div>
            <p className="eyebrow text-campus-emerald-500/80">NIT Jalandhar · Verified students only</p>
            <h1 className="h-display mt-4 text-5xl leading-[1.05] md:text-6xl">
              Buy, sell, and trade
              <br />
              right on <span className="italic text-campus-orange">campus.</span>
            </h1>
            <p className="mt-6 max-w-md text-white/50">
              UniMarket replaces the boring WhatsApp group to a proper marketplace — verified students,
              predefined meetup spots, and ratings you can trust.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? '/sell' : '/register'} className="btn-accent">
                {user ? 'Sell an item' : 'Get started'}
              </Link>
              <a href="#listings" className="btn-secondary bg-transparent text-white border-white/20 hover:border-white/50">
                Browse listings
              </a>
            </div>
          </div>
         <div className="hidden items-center justify-center md:flex">
  <div className="grid w-full max-w-sm grid-cols-2 gap-4">
    {CATEGORIES.slice(0, 4).map((c) => (
      <div key={c.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white">
          <c.icon className="w-6 h-6 stroke-[2]" />
        </div>
        <p className="mt-3 text-sm text-white/70">{c.name}</p>
      </div>
    ))}
  </div>
</div>
        </div>
      </section>

      {/* Category grid */}
      <section className="mx-auto max-w-7xl px-5 py-14">
        <p className="eyebrow">Browse by category</p>
        <h2 className="h-display mt-2 mb-2 text-3xl text-campus-ink">What are you looking for?</h2>
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
  {CATEGORIES.map((c) => (
    <button
      key={c.name}
      onClick={() => setFilters((f) => ({ ...f, category: f.category === c.name ? '' : c.name }))}
      className={`card flex flex-col items-center gap-3 px-4 py-6 text-center transition-transform hover:-translate-y-0.5 ${
        filters.category === c.name ? 'ring-2 ring-campus-blue-400' : ''
      }`}
    >
      <span className={`badge-icon ${c.bg} ${c.color} p-3 rounded-xl flex items-center justify-center`}>
        <c.icon className="w-6 h-6 stroke-[2]" />
      </span>
      <span className="text-sm font-medium text-campus-ink">{c.name}</span>
    </button>
  ))}
</div>      </section>

      {/* Listings + filters */}
      <section id="listings" className="mx-auto max-w-7xl px-5 pb-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">{search ? `Results for "${search}"` : 'Fresh on campus'}</p>
            <h2 className="h-display mt-1 text-2xl text-campus-ink">
              {filters.category || 'All listings'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="input-with-icon w-44">
              <FiChevronDown className="text-campus-ink/40" />
              <select
                value={filters.sort}
                onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
                className="w-full bg-transparent text-sm outline-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
            </div>
            <button onClick={() => setShowFilters((v) => !v)} className="btn-secondary">
              <FiFilter /> Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="card mb-8 grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => setFilters((f) => ({ ...f, condition: e.target.value }))}
                className="input-field"
              >
                <option value="">Any</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Meetup Location</label>
              <select
                value={filters.meetupLocation}
                onChange={(e) => setFilters((f) => ({ ...f, meetupLocation: e.target.value }))}
                className="input-field"
              >
                <option value="">Any</option>
                {MEETUP_LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Min Price (₹)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                className="input-field"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Max Price (₹)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                className="input-field"
                placeholder="10000"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
        icon={<FiPackage />}
            title="No listings found"
            subtitle="Try adjusting your filters, or be the first to list something in this category."
            action={user && <Link to="/sell" className="btn-primary">Create a listing</Link>}
          />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard
                key={listing._id}
                listing={listing}
                onToggleWishlist={user ? toggleWishlist : null}
                isWishlisted={wishlist.includes(listing._id)}
              />
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
}
