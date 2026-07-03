import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { EmptyState } from '../components/Loaders';
import { timeAgo } from '../utils/constants';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChatsList() {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/chats').then(({ data }) => setChats(data)).finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-5 py-14">
        <p className="eyebrow">Messages</p>
        <h1 className="h-display mt-2 text-3xl text-campus-ink">Your conversations</h1>

        {loading ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-campus-ink/5" />
            ))}
          </div>
        ) : chats.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon="💬"
              title="No conversations yet"
              subtitle="Chats unlock once a seller accepts your interest, or once you accept a buyer's request."
            />
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {chats.map((chat) => {
              const other = chat.participants.find((p) => p._id !== user._id);
              const lastMsg = chat.messages[chat.messages.length - 1];
              return (
                <Link key={chat._id} to={`/chats/${chat._id}`} className="card flex items-center gap-4 p-4">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-campus-blue-50">
                    {chat.listing?.images?.[0] ? (
                      <img src={chat.listing.images[0]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl">🛍️</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-campus-ink">{other?.name}</p>
                      {lastMsg && <span className="shrink-0 text-xs text-campus-ink/40">{timeAgo(lastMsg.createdAt)}</span>}
                    </div>
                    <p className="truncate text-xs text-campus-ink/50">{chat.listing?.title}</p>
                    <p className="mt-0.5 truncate text-sm text-campus-ink/60">
                      {lastMsg ? (lastMsg.text || 'Sent a photo') : 'Say hello 👋'}
                    </p>
                  </div>
                  {!chat.active && <span className="pill-tag shrink-0">Locked</span>}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
