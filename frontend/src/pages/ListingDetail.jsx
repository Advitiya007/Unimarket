import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiFlag, FiShare2, FiStar, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import MainLayout from '../layouts/MainLayout';
import { timeAgo } from '../utils/constants';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const fetchListing = async () => {
    try {
      const { data } = await api.get(`/listings/${id}`);
      setListing(data);
    } catch {
      toast.error('Listing not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-campus-blue-500 border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  if (!listing) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="h-display text-3xl">Listing not found</h1>
          <Link to="/" className="btn-primary mt-6 inline-flex">Back to marketplace</Link>
        </div>
      </MainLayout>
    );
  }

  const isOwner = user && listing.seller?._id === user._id;
  const myInterest = user && listing.interestedBuyers?.find((b) => b.buyer?._id === user._id);

  const expressInterest = async () => {
    setBusy(true);
    try {
      await api.post(`/listings/${id}/interest`);
      toast.success('Interest sent to the seller!');
      fetchListing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send interest');
    } finally {
      setBusy(false);
    }
  };

  const respond = async (buyerId, decision) => {
    setBusy(true);
    try {
      const { data } = await api.post(`/listings/${id}/respond`, { buyerId, decision });
      toast.success(decision === 'accepted' ? 'Buyer accepted — chat unlocked!' : 'Request declined');
      if (decision === 'accepted' && data.chat) {
        navigate(`/chats/${data.chat._id}`);
      } else {
        fetchListing();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Could not copy link');
    }
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl bg-campus-blue-50">
              {listing.images?.length > 0 ? (
                <img src={listing.images[activeImg]} alt={listing.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-6xl">🛍️</div>
              )}
            </div>
            {listing.images?.length > 1 && (
              <div className="mt-3 flex gap-2">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${
                      activeImg === i ? 'border-campus-blue-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-center justify-between">
              <span className="pill-tag">{listing.category}</span>
              <div className="flex gap-2">
                <button onClick={share} className="badge-icon bg-campus-paper border border-campus-ink/10">
                  <FiShare2 size={16} />
                </button>
                <button className="badge-icon bg-campus-paper border border-campus-ink/10">
                  <FiFlag size={16} />
                </button>
              </div>
            </div>

            <h1 className="h-display mt-4 text-3xl text-campus-ink">{listing.title}</h1>
            <p className="mt-2 font-display text-3xl text-campus-blue-500">₹{listing.price}</p>

            <div className="mt-4 flex flex-wrap gap-2 text-sm text-campus-ink/60">
              <span className="pill-tag">{listing.condition}</span>
              {listing.brand && <span className="pill-tag">{listing.brand}</span>}
              <span className="pill-tag"><FiMapPin className="mr-1 inline" size={12} />{listing.meetupLocation}</span>
              <span className="pill-tag">{listing.status}</span>
            </div>

            {listing.meetupNotes && (
              <p className="mt-2 text-sm italic text-campus-ink/50">"{listing.meetupNotes}"</p>
            )}

            <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-campus-ink/70">
              {listing.description}
            </p>

            <p className="mt-4 text-xs text-campus-ink/40">
              Posted {timeAgo(listing.createdAt)} · {listing.views} views
            </p>

            {/* Seller card */}
            <Link to={`/users/${listing.seller?._id}`} className="card mt-6 flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-campus-emerald-500 text-sm font-semibold text-white">
                {listing.seller?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-campus-ink">{listing.seller?.name}</p>
                <p className="text-xs text-campus-ink/50">
                  {listing.seller?.department} {listing.seller?.hostel && `· ${listing.seller.hostel}`}
                </p>
              </div>
              <div className="flex items-center gap-1 text-sm text-campus-ink/60">
                <FiStar className="text-campus-orange" size={14} />
                {listing.seller?.rating?.toFixed(1) || 'New'}
              </div>
            </Link>

            {/* Action button */}
            {!isOwner && listing.status === 'Available' && (
              <button onClick={expressInterest} disabled={busy || !!myInterest} className="btn-accent mt-6 w-full">
                {myInterest ? `Interest ${myInterest.status}` : "I'm Interested"}
              </button>
            )}
            {!user && (
              <p className="mt-3 text-center text-sm text-campus-ink/50">
                <Link to="/login" className="font-medium text-campus-blue-500">Sign in</Link> to express interest
              </p>
            )}

            {/* Owner: manage interested buyers */}
            {isOwner && listing.status === 'Available' && (
              <div className="mt-8">
                <p className="eyebrow">Interested buyers ({listing.interestedBuyers?.length || 0})</p>
                <div className="mt-3 space-y-3">
                  {(listing.interestedBuyers || []).length === 0 && (
                    <p className="text-sm text-campus-ink/40">No interest yet — check back soon.</p>
                  )}
                  {listing.interestedBuyers?.map((b) => (
                    <div key={b.buyer?._id} className="card flex items-center gap-3 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-campus-blue-500 text-xs font-semibold text-white">
                        {b.buyer?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-campus-ink">{b.buyer?.name}</p>
                        <p className="text-xs text-campus-ink/40 capitalize">{b.status}</p>
                      </div>
                      {b.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => respond(b.buyer._id, 'accepted')}
                            disabled={busy}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-campus-emerald-500 text-white"
                          >
                            <FiCheck size={14} />
                          </button>
                          <button
                            onClick={() => respond(b.buyer._id, 'rejected')}
                            disabled={busy}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-campus-ink/10 text-campus-ink/60"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
