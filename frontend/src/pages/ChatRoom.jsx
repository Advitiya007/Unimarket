import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiSend, FiArrowLeft, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import MainLayout from '../layouts/MainLayout';
import axios from 'axios';
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
  const messagesRef = useRef(null);
  const typingTimeout = useRef(null);

  const scrollToBottom = () => {
    const messagesElement = messagesRef.current;
    if (messagesElement) {
      messagesElement.scrollTop = messagesElement.scrollHeight;
    }
  };

  const fetchChat = useCallback(async () => {
    console.log(`Fetching chat with id: ${id}`);
    try {
      const { data } = await axios.get(`${import.meta.env.REACT_APP_BASE_URL}/chats/${id}`, { withCredentials: true });
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
  }, [chat?.messages?.length, typing]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('chat:join', { chatId: id });

    const onMessage = ({ chatId, message }) => {
      if (chatId !== id) return;
      setTyping(false);
      setChat((prev) => {
        if (!prev || prev.messages.some((item) => item._id === message._id)) return prev;
        return { ...prev, messages: [...prev.messages, message] };
      });
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

  const handleTyping = (value) => {
    if (!socket) return;

    if (!value.trim()) {
      clearTimeout(typingTimeout.current);
      socket.emit('typing:stop', { chatId: id });
      return;
    }

    socket.emit('typing:start', { chatId: id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('typing:stop', { chatId: id }), 1500);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !chat?.active) return;

    clearTimeout(typingTimeout.current);
    socket?.emit('typing:stop', { chatId: id });
    setTyping(false);

    try {
      const { data: message } = await axios.post(
        `${import.meta.env.REACT_APP_BASE_URL}/chats/${id}/messages`,
        { text: text.trim() },
        { withCredentials: true }
      );

      setChat((prev) => {
        if (!prev || prev.messages.some((item) => item._id === message._id)) return prev;
        return { ...prev, messages: [...prev.messages, message] };
      });
      setText('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send message');
    }
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
      <div className="mx-auto flex h-[calc(100dvh-130px)] max-w-3xl flex-col px-3 py-4 sm:px-5 sm:py-6">
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-campus-ink/10 bg-white shadow-card">
        <div className="flex shrink-0 items-center gap-3 border-b border-campus-ink/10 px-4 py-3 sm:px-5">
          <Link to="/chats" className="badge-icon shrink-0 border border-campus-ink/10 bg-campus-paper">
            <FiArrowLeft size={16} />
          </Link>
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-campus-blue-50">
            {chat.listing?.images?.[0] ? (
              <img src={new URL(chat.listing.images[0], import.meta.env.REACT_APP_BASE_URL).href} alt="" className="h-full w-full object-cover" />
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

        <div ref={messagesRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-campus-paper/50 px-4 py-4 sm:px-5" aria-live="polite">
          {chat.messages.map((m) => {
            const isMine = m.sender._id === user._id;
            return (
              <div key={m._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                    isMine ? 'bg-campus-blue-500 text-white' : 'bg-white border border-campus-ink/10 text-campus-ink'
                  }`}
                >
                  {m.image && <img src={new URL(m.image, import.meta.env.REACT_APP_BASE_URL).href} alt="" className="mb-1 max-h-48 rounded-xl" />}
                  {m.text && <p>{m.text}</p>}
                  <p className={`mt-1 text-[10px] ${isMine ? 'text-white/60' : 'text-campus-ink/40'}`}>
                    {timeAgo(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="flex justify-start" aria-label={`${other?.name || 'The other person'} is typing`}>
              <p className="rounded-2xl rounded-bl-md border border-campus-ink/5 bg-white px-4 py-2 text-xs text-campus-ink/50 shadow-sm">
                <span className="mr-2 inline-block animate-pulse">•••</span>
                {other?.name} is typing…
              </p>
            </div>
          )}
        </div>

        {chat.active ? (
          <form onSubmit={sendMessage} className="flex shrink-0 items-center gap-3 border-t border-campus-ink/10 bg-white p-3 sm:p-4">
            <div className="input-with-icon min-w-0 flex-1 rounded-full px-4">
              <input
                value={text}
                onChange={(e) => { setText(e.target.value); handleTyping(e.target.value); }}
                placeholder="Type a message…"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <button type="submit" disabled={!text.trim()} className="btn-accent shrink-0 rounded-full px-4 py-3 disabled:cursor-not-allowed disabled:opacity-50">
              <FiSend />
            </button>
          </form>
        ) : (
          <p className="shrink-0 border-t border-campus-ink/10 bg-white px-4 py-4 text-center text-sm text-campus-ink/40">
            This chat is locked because the listing is no longer active.
          </p>
        )}
        </section>
      </div>
    </MainLayout>
  );
}
