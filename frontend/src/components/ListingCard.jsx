import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiHeart } from 'react-icons/fi';
import { timeAgo } from '../utils/constants';

export default function ListingCard({ listing, onToggleWishlist, isWishlisted }) {
  const img = listing.images?.[0];

  return (
    <div className="card group flex flex-col overflow-hidden">
      <Link to={`/listings/${listing._id}`} className="relative block aspect-[4/3] overflow-hidden bg-campus-blue-50">
        {img ? (
          <img
            src={new URL(img, import.meta.env.REACT_APP_BASE_URL).href}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🛍️</div>
        )}
        <span className="absolute left-3 top-3 pill-tag bg-white/90">{listing.condition}</span>
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleWishlist(listing._id);
            }}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-campus-ink/70 hover:text-campus-orange"
          >
            <FiHeart className={isWishlisted ? 'fill-campus-orange text-campus-orange' : ''} />
          </button>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/listings/${listing._id}`}>
            <h3 className="line-clamp-1 font-semibold text-campus-ink">{listing.title}</h3>
          </Link>
          <span className="shrink-0 font-display text-lg text-campus-blue-500">₹{listing.price}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-campus-ink/50">
          <FiMapPin size={13} /> {listing.meetupLocation}
        </div>
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-campus-ink/50">
          <span className="flex items-center gap-1">
            <FiStar size={13} className="text-campus-orange" />
            {listing.seller?.rating?.toFixed(1) || 'New'}
          </span>
          <span>{timeAgo(listing.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
