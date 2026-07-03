# UniMarket — Institutional Peer-to-Peer Marketplace

A campus marketplace for verified NIT Jalandhar students (`@nitj.ac.in` emails only).
Buy, sell, chat only after seller approval, meet at predefined campus locations, and
rate each other after a completed trade.

## What's implemented

**Backend (Node/Express/MongoDB/Socket.io)**
- JWT auth restricted to `@nitj.ac.in` emails, bcrypt password hashing
- Listings: create (with up to 5 images via Multer), browse/search/filter/sort, edit, delete
- Conditional chat: buyer sends interest → seller accepts/rejects → chat room created only on
  acceptance → chat auto-locks (read-only) when the listing is sold/expired
- Real-time messaging, typing indicators, and read receipts over Socket.io (JWT-authenticated sockets)
- Transaction flow: seller starts transaction → both sides confirm → listing marked Sold,
  chat locked, trade counts incremented
- Ratings: 1–5 stars + optional review, unlocked only after a completed transaction,
  one rating per reviewer per transaction, auto-recomputed average on the profile
- Auto-expiry engine: listings expire 7 days after posting, move to "Expired" and stay
  visible only in the seller's own dashboard
- Notifications persisted to MongoDB and pushed live over Socket.io
- Wishlist, public profiles, and an admin API (suspend/unsuspend users, remove listings,
  view all transactions)

**Frontend (React + Vite + Tailwind)**
- Auth pages (login/register), protected routes, persisted session
- Home page: hero, category grid, filters (price/category/condition/location), sort, search
- Listing detail: image gallery, seller card, "I'm Interested" flow, owner's accept/reject panel
- Real-time chat UI: message bubbles, typing indicator, auto-scroll, read-only lock state
- Dashboard: Selling / Buying / Analytics tabs, transaction confirmation, rating modal
- Wishlist, public profile pages, and an admin panel (users / listings / transactions)
- Design system: serif display headlines (Fraunces) + Inter body text, pill buttons,
  icon-prefixed inputs, soft-shadow rounded cards — in the blue/emerald/orange campus palette

## Not yet wired up (natural next steps)
- Image compression/lazy-loading and infinite scroll (pagination API exists; UI currently
  loads one page)
- Toast-driven "listing liked" notifications, push notifications outside the app
- Reporting a listing (button exists in the UI, backend endpoint not yet built)
- Dark mode toggle (Tailwind `darkMode: 'class'` is configured, no toggle UI yet)

## Running it locally

### Backend
```bash
cd backend
cp .env.example .env   # set MONGO_URI and JWT_SECRET
npm install
npm run dev             # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173, proxies /api and /uploads to :5000
```

You'll need a running MongoDB instance (local `mongod` or a MongoDB Atlas connection string)
for `MONGO_URI`.

## Folder structure

```
backend/
  controllers/   route handlers (auth, listings, chats, transactions, ratings, users, admin)
  models/        Mongoose schemas (User, Listing, Chat, Transaction, Rating, Notification)
  routes/        Express routers
  middleware/    JWT auth guard, admin guard, Multer image upload
  socket/        Socket.io connection + chat event handlers
  config/        MongoDB connection
  utils/         notification helper, auto-expiry engine
  uploads/       uploaded listing images (served statically)

frontend/
  src/
    components/  Navbar, Footer, ListingCard, StarRating, RatingModal, loaders
    pages/       Home, Login, Register, ListingDetail, CreateListing, Dashboard,
                 ChatsList, ChatRoom, Profile, Wishlist, Admin, NotFound
    layouts/     MainLayout (navbar + footer wrapper)
    context/     AuthContext, SocketContext
    services/    axios instance with JWT interceptor
    utils/       shared constants (categories, meetup locations, time formatting)
```
