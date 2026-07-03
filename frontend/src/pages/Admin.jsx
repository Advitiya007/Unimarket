import { useEffect, useState } from 'react';
import { FiTrash2, FiSlash, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';

const TABS = ['Users', 'Listings', 'Transactions'];

export default function Admin() {
  const [tab, setTab] = useState('Users');
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [u, l, t] = await Promise.all([
      api.get('/admin/users'),
      api.get('/admin/listings'),
      api.get('/admin/transactions'),
    ]);
    setUsers(u.data);
    setListings(l.data);
    setTransactions(t.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleSuspend = async (u) => {
    await api.put(`/admin/users/${u._id}/${u.isSuspended ? 'unsuspend' : 'suspend'}`);
    toast.success(u.isSuspended ? 'User unsuspended' : 'User suspended');
    load();
  };

  const removeListing = async (id) => {
    if (!confirm('Remove this listing?')) return;
    await api.delete(`/admin/listings/${id}`);
    toast.success('Listing removed');
    load();
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl px-5 py-14">
        <p className="eyebrow">Admin</p>
        <h1 className="h-display mt-2 text-3xl text-campus-ink">Platform control</h1>

        <div className="mt-8 flex gap-2 border-b border-campus-ink/10">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium ${tab === t ? 'border-b-2 border-campus-blue-500 text-campus-blue-500' : 'text-campus-ink/50'}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 h-40 animate-pulse rounded-2xl bg-campus-ink/5" />
        ) : (
          <div className="mt-8 overflow-x-auto">
            {tab === 'Users' && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-campus-ink/40">
                    <th className="pb-3">Name</th><th className="pb-3">Email</th><th className="pb-3">Roll No.</th>
                    <th className="pb-3">Status</th><th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="border-t border-campus-ink/5">
                      <td className="py-3">{u.name}</td>
                      <td className="py-3 text-campus-ink/60">{u.email}</td>
                      <td className="py-3 text-campus-ink/60">{u.rollNumber}</td>
                      <td className="py-3">
                        <span className={`pill-tag ${u.isSuspended ? 'text-campus-orange-600' : 'text-campus-emerald-600'}`}>
                          {u.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => toggleSuspend(u)} className="btn-secondary text-xs">
                          {u.isSuspended ? <FiCheckCircle /> : <FiSlash />}
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'Listings' && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-campus-ink/40">
                    <th className="pb-3">Title</th><th className="pb-3">Seller</th><th className="pb-3">Price</th>
                    <th className="pb-3">Status</th><th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => (
                    <tr key={l._id} className="border-t border-campus-ink/5">
                      <td className="py-3">{l.title}</td>
                      <td className="py-3 text-campus-ink/60">{l.seller?.name}</td>
                      <td className="py-3">₹{l.price}</td>
                      <td className="py-3"><span className="pill-tag">{l.status}</span></td>
                      <td className="py-3 text-right">
                        <button onClick={() => removeListing(l._id)} className="badge-icon bg-white border border-campus-ink/10 text-campus-orange">
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'Transactions' && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-campus-ink/40">
                    <th className="pb-3">Listing</th><th className="pb-3">Seller</th><th className="pb-3">Buyer</th><th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t._id} className="border-t border-campus-ink/5">
                      <td className="py-3">{t.listing?.title}</td>
                      <td className="py-3 text-campus-ink/60">{t.seller?.name}</td>
                      <td className="py-3 text-campus-ink/60">{t.buyer?.name}</td>
                      <td className="py-3"><span className="pill-tag">{t.completed ? 'Completed' : 'In progress'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
