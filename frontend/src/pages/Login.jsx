import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-campus-ink p-12 text-white md:flex">
        <Link to="/" className="h-display text-2xl italic">UniMarket</Link>
        <div>
          <p className="eyebrow text-campus-emerald-500/80">Welcome back</p>
          <h1 className="h-display mt-3 text-5xl leading-[1.05]">
            Your campus,
            <br />
            your <span className="italic text-campus-orange">marketplace.</span>
          </h1>
          <p className="mt-6 max-w-sm text-white/50">
            Only verified NIT Jalandhar students can buy and sell here — no strangers, no spam, just
            your campus community.
          </p>
        </div>
        <p className="text-xs text-white/30">Buy · Sell · Meet safely on campus</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="h-display text-2xl italic text-campus-ink md:hidden">UniMarket</Link>
          <h2 className="h-display mt-6 text-3xl text-campus-ink">Sign in</h2>
          <p className="mt-1 text-sm text-campus-ink/50">
            New here?{' '}
            <Link to="/register" className="font-medium text-campus-blue-500">Create an account</Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Institutional Email</label>
              <div className="input-with-icon">
                <FiMail className="text-campus-ink/40" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="abc123@nitj.ac.in"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-campus-ink/30"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Password</label>
              <div className="input-with-icon">
                <FiLock className="text-campus-ink/40" />
                <input
                  type="password"
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-campus-ink/30"
                />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
