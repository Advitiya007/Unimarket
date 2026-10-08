import { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import ListingCard from '../components/ListingCard';
import { EmptyState } from '../components/Loaders';

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    axios
      .get(`${import.meta.env.REACT_APP_BASE_URL}/users/wishlist`, {
        withCredentials: true,
      })
      .then(({ data }) => setItems(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (id) => {
    await axios.post(
      `${import.meta.env.REACT_APP_BASE_URL}/users/wishlist/${id}`,
      {},
      {
        withCredentials: true,
      }
    );

    setItems((prev) => prev.filter((l) => l._id !== id));
  };

  return (
    <>
      <div>hey</div>

      <MainLayout>
        <div className="mx-auto max-w-6xl px-5 py-14">
          <p className="eyebrow">Saved</p>
          <h1 className="h-display mt-2 text-3xl text-campus-ink">
            Your wishlist
          </h1>

          {loading ? (
            <div className="mt-8 h-40 animate-pulse rounded-2xl bg-campus-ink/5" />
          ) : items.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                icon="ðŸ¤"
                title="Nothing saved yet"
                subtitle="Tap the heart on any listing to save it for later."
              />
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((l) => (
                <ListingCard
                  key={l._id}
                  listing={l}
                  onToggleWishlist={toggle}
                  isWishlisted
                />
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}
