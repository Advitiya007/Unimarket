import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiUsers, FiStar, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import MainLayout from '../layouts/MainLayout';
import ListingCard from '../components/ListingCard';
import { EmptyState } from '../components/Loaders';
import RatingModal from '../components/RatingModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const TABS = ['Selling', 'Buying', 'Analytics'];

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Selling');
  const [myListings, setMyListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingTarget, setRatingTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    const [listingsRes, txRes] = await Promise.all([
      api.get('/listings/mine/all'),
      api.get('/transactions/mine'),
    ]);
    setMyListings(listingsRes.data);
    setTransactions(txRes.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteListing = async (id) => {
    if (!confirm('Delete this listing?')) return;
    await api.delete(`/listings/${id}`);
    toast.success('Listing deleted');
    load();
  };

  const startTransaction = async (listingId) => {
    try {
      await api.post('/transactions', { listingId });
      toast.success('Transaction started — confirm delivery once you meet up.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start transaction');
    }
  };

  const confirmTx = async (txId) => {
    try {
      const { data } = await api.post(`/transactions/${txId}/confirm`);
      toast.success(data.completed ? 'Transaction complete! You can now rate.' : 'Confirmed — waiting on the other side.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not confirm');
    }
  };

  const active = myListings.filter((l) => l.status === 'Available');
  const reserved = myListings.filter((l) => l.status === 'Reserved');
  const sold = myListings.filter((l) => l.status === 'Sold');
  const expired = myListings.filter((l) => l.status === 'Expired');

  const totalViews = myListings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalInterested = myListings.reduce((sum, l) => sum + (l.interestedBuyers?.length || 0), 0);

  const buyingTx = transactions.filter((t) => t.buyer._id === user._id);
  const sellingTx = transactions.filter((t) => t.seller._id === user._id);

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl px-5 py-14">
        <p className="eyebrow">Dashboard</p>
        <h1 className="h-display mt-2 text-3xl text-campus-ink">Welcome back, {user.name.split(' ')[0]}</h1>

        <div className="mt-8 flex gap-2 border-b border-campus-ink/10">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium ${
                tab === t ? 'border-b-2 border-campus-blue-500 text-campus-blue-500' : 'text-campus-ink/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-10 h-40 animate-pulse rounded-2xl bg-campus-ink/5" />
        ) : (
          <div className="mt-10">
            {tab === 'Selling' && (
              <div className="space-y-12">
                <ListingGroup title="Reserved — action needed" items={reserved} deleteListing={deleteListing}
                  extra={(l) => (
                    <button onClick={() => startTransaction(l._id)} className="btn-accent mt-2 w-full text-xs py-2">
                      Start Transaction
                    </button>
                  )} />
                <ListingGroup title="Active Listings" items={active} deleteListing={deleteListing} />
                <ListingGroup title="Sold" items={sold} deleteListing={deleteListing} />
                <ListingGroup title="Expired (archive)" items={expired} deleteListing={deleteListing} />

                {sellingTx.filter((t) => !t.completed).length > 0 && (
                  <div>
                    <p className="eyebrow mb-3">Pending confirmations (as seller)</p>
                    <div className="space-y-3">
                      {sellingTx.filter((t) => !t.completed).map((t) => (
                        <TxRow key={t._id} tx={t} onConfirm={confirmTx} confirmedKey="sellerConfirmed" label="Mark as Delivered" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'Buying' && (
              <div className="space-y-8">
                {transactions.filter((t) => t.buyer._id === user._id).length === 0 ? (
                  <EmptyState icon="🛒" title="No purchases yet" subtitle="Once a seller accepts your interest, your deal will show up here." />
                ) : (
                  buyingTx.map((t) => (
                    <div key={t._id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-campus-blue-50">
                        {t.listing?.images?.[0] && <img src={t.listing.images[0]} alt="" className="h-full w-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-campus-ink">{t.listing?.title}</p>
                        <p className="text-xs text-campus-ink/50">Seller: {t.seller?.name} · ₹{t.listing?.price}</p>
                      </div>
                      {!t.completed ? (
                        <button
                          disabled={t.buyerConfirmed}
                          onClick={() => confirmTx(t._id)}
                          className="btn-secondary text-xs"
                        >
                          {t.buyerConfirmed ? 'Waiting on seller' : 'Mark as Received'}
                        </button>
                      ) : (
                        <button onClick={() => setRatingTarget(t)} className="btn-accent text-xs">
                          <FiStar size={12} /> Rate seller
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'Analytics' && (
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                <StatCard icon={<FiEye />} label="Total Views" value={totalViews} />
                <StatCard icon={<FiUsers />} label="Interested Buyers" value={totalInterested} />
                <StatCard icon={<FiStar />} label="Average Rating" value={user.rating?.toFixed(1) || '—'} />
                <StatCard icon="✅" label="Completed Trades" value={user.totalTrades || 0} />
              </div>
            )}
          </div>
        )}
      </div>

      {ratingTarget && (
        <RatingModal
          transaction={ratingTarget}
          onClose={() => setRatingTarget(null)}
          onSubmitted={() => { setRatingTarget(null); load(); }}
        />
      )}
    </MainLayout>
  );
}

function ListingGroup({ title, items, deleteListing, extra }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="eyebrow mb-3">{title} ({items.length})</p>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((l) => (
          <div key={l._id} className="relative">
            <ListingCard listing={l} />
            <div className="mt-2 flex gap-2">
              <Link to={`/listings/${l._id}`} className="btn-secondary flex-1 py-2 text-xs">View</Link>
              <button onClick={() => deleteListing(l._id)} className="badge-icon bg-white border border-campus-ink/10 text-campus-orange">
                <FiTrash2 size={14} />
              </button>
            </div>
            {extra && extra(l)}
          </div>
        ))}
      </div>
    </div>
  );
}

function TxRow({ tx, onConfirm, confirmedKey, label }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-campus-blue-50">
        {tx.listing?.images?.[0] && <img src={tx.listing.images[0]} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-campus-ink">{tx.listing?.title}</p>
        <p className="text-xs text-campus-ink/50">Buyer: {tx.buyer?.name}</p>
      </div>
      <button disabled={tx[confirmedKey]} onClick={() => onConfirm(tx._id)} className="btn-secondary text-xs">
        {tx[confirmedKey] ? 'Waiting on buyer' : label}
      </button>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card p-5">
      <div className="badge-icon bg-campus-blue-50 text-campus-blue-500">{icon}</div>
      <p className="mt-3 font-display text-2xl text-campus-ink">{value}</p>
      <p className="text-xs text-campus-ink/50">{label}</p>
    </div>
  );
}
