import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiSend, FiArrowLeft, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import MainLayout from '../layouts/MainLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { timeAgo } from '../utils/constants';

export default function ChatRoom() {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [chat, setChat] = useState(null);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  const fetchChat = useCallback(async () => {
    console.log(`Fetching chat with id: ${id}`);
    try {
      const { data } = await api.get(`/chats/${id}`);
      console.log(`Fetched chat data:`, data);
      setChat(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not open chat');
      navigate('/chats');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages?.length]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('chat:join', { chatId: id });

    const onMessage = ({ chatId, message }) => {
      if (chatId !== id) return;
      setChat((prev) => (prev ? { ...prev, messages: [...prev.messages, message] } : prev));
    };
    const onTypingStart = ({ chatId }) => { if (chatId === id) setTyping(true); };
    const onTypingStop = ({ chatId }) => { if (chatId === id) setTyping(false); };

    socket.on('message:new', onMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);

    return () => {
      socket.emit('chat:leave', { chatId: id });
      socket.off('message:new', onMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [socket, id]);

  const handleTyping = () => {
    if (!socket) return;
    socket.emit('typing:start', { chatId: id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('typing:stop', { chatId: id }), 1500);
  };

  const sendMessage = (e) => {
    console.log(`Sending message in chat ${id}:`, text);
    e.preventDefault();
    if (!text.trim() || !chat?.active) return;
    socket?.emit('message:send', { chatId: id, text: text.trim() });
    setText('');
  };

  if (loading || !chat) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-campus-blue-500 border-t-transparent" />
        </div>
      </MainLayout>
    );
  }

  const other = chat.participants.find((p) => p._id !== user._id);

  return (
    <MainLayout>
      <div className="mx-auto flex h-[calc(100vh-160px)] max-w-3xl flex-col px-5 py-6">
        <div className="flex items-center gap-3 border-b border-campus-ink/10 pb-4">
          <Link to="/chats" className="badge-icon bg-campus-paper border border-campus-ink/10">
            <FiArrowLeft size={16} />
          </Link>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-campus-blue-50">
            {chat.listing?.images?.[0] ? (
              <img src={chat.listing.images[0]} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">🛍️</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-campus-ink">{other?.name}</p>
            <Link to={`/listings/${chat.listing?._id}`} className="truncate text-xs text-campus-blue-500 hover:underline">
              {chat.listing?.title}
            </Link>
          </div>
          {!chat.active && (
            <span className="flex items-center gap-1 pill-tag">
              <FiLock size={11} /> Read-only
            </span>
          )}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto py-4">
          {chat.messages.map((m) => {
            const isMine = m.sender._id === user._id;
            return (
              <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine ? 'bg-campus-blue-500 text-white' : 'bg-white border border-campus-ink/10 text-campus-ink'
                  }`}
                >
                  {m.image && <img src={m.image} alt="" className="mb-1 max-h-48 rounded-xl" />}
                  {m.text && <p>{m.text}</p>}
                  <p className={`mt-1 text-[10px] ${isMine ? 'text-white/60' : 'text-campus-ink/40'}`}>
                    {timeAgo(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          {typing && <p className="text-xs italic text-campus-ink/40">{other?.name} is typing…</p>}
          <div ref={bottomRef} />
        </div>

        {chat.active ? (
          <form onSubmit={sendMessage} className="flex items-center gap-3 border-t border-campus-ink/10 pt-4">
            <div className="input-with-icon flex-1">
              <input
                value={text}
                onChange={(e) => { setText(e.target.value); handleTyping(); }}
                placeholder="Type a message…"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button type="submit" className="btn-accent px-4 py-3">
              <FiSend />
            </button>
          </form>
        ) : (
          <p className="border-t border-campus-ink/10 pt-4 text-center text-sm text-campus-ink/40">
            This chat is locked because the listing is no longer active.
          </p>
        )}
      </div>
    </MainLayout>
  );
}
