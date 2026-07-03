import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiStar, FiMapPin, FiBook } from 'react-icons/fi';
import MainLayout from '../layouts/MainLayout';
import ListingCard from '../components/ListingCard';
import { EmptyState } from '../components/Loaders';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const params = useParams();
  const { user: authUser } = useAuth();
  const userId = params.id || authUser?._id;
  const isOwn = !params.id || params.id === authUser?._id;

  const [data, setData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      api.get(`/users/${userId}`),
      api.get(`/ratings/user/${userId}`),
    ]).then(([profileRes, ratingsRes]) => {
      setData(profileRes.data);
      setRatings(ratingsRes.data);
    }).finally(() => setLoading(false));
  }, [userId]);

  if (loading || !data) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-campus-blue-500 border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  const { user, activeListings, soldListings } = data;

  return (
    <MainLayout>
      <div className="bg-campus-ink text-white">
        <div className="mx-auto max-w-6xl px-5 py-14">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-campus-blue-500 text-2xl font-semibold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="h-display text-3xl">{user.name}</h1>
              <p className="mt-1 text-sm text-white/50">
                {user.department} {user.hostel && `· ${user.hostel}`} · Joined {new Date(user.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-2 flex items-center justify-center gap-4 text-sm sm:justify-start">
                <span className="flex items-center gap-1"><FiStar className="text-campus-orange" />{user.rating?.toFixed(1) || 'New'} ({user.ratingCount || 0})</span>
                <span className="flex items-center gap-1"><FiBook />{user.totalTrades || 0} trades</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-14">
        <p className="eyebrow mb-3">Active listings</p>
        {activeListings.length === 0 ? (
          <EmptyState icon="🛍️" title="No active listings" />
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {activeListings.map((l) => <ListingCard key={l._id} listing={l} />)}
          </div>
        )}

        <p className="eyebrow mb-3 mt-12">Ratings received</p>
        {ratings.length === 0 ? (
          <EmptyState icon="⭐" title="No ratings yet" />
        ) : (
          <div className="space-y-3">
            {ratings.map((r) => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-campus-ink">{r.reviewer?.name}</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar key={i} size={13} className={i < r.stars ? 'fill-campus-orange text-campus-orange' : 'text-campus-ink/15'} />
                    ))}
                  </div>
                </div>
                {r.review && <p className="mt-1 text-sm text-campus-ink/60">{r.review}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
