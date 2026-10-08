import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-24 bg-campus-ink text-campus-paper/80">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <span className="h-display text-2xl italic text-white">UniMarket</span>
            <p className="mt-3 max-w-xs text-sm text-campus-paper/50">
              {/* The trusted, verified marketplace built for NIT Jalandhar students. Buy, sell, and meet
              safely on campus. */}
              A trusted marketplace for NIT Jalandhar students. Buy, sell, and connect with your campus community.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-campus-paper/40">Marketplace</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white">Browse listings</Link></li>
              <li><Link to="/sell" className="hover:text-white">Sell an item</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">My dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-campus-paper/40">Trust & Safety</p>
            <ul className="space-y-2 text-sm">
              <li className="text-campus-paper/60">Institutional email verification</li>
              <li className="text-campus-paper/60">Predefined campus meetup spots</li>
              <li className="text-campus-paper/60">Ratings after every completed trade</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-campus-paper/40">Campus</p>
            <p className="text-sm text-campus-paper/60">NIT Jalandhar, Punjab</p>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-campus-paper/40">
          © {new Date().getFullYear()} UniMarket — built for students, by students.
        </div>
      </div>
      
    </footer>
  );
}
