import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiHash, FiMail, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';


export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', rollNumber: '', email: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

 
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created — welcome to UniMarket!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="h-display text-2xl italic text-campus-ink">UniMarket</Link>
          <h2 className="h-display mt-6 text-3xl text-campus-ink">Create account</h2>
          <p className="mt-1 text-sm text-campus-ink/50">
            Already a member?{' '}
            <Link to="/login" className="font-medium text-campus-blue-500">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Full Name</label>
              <div className="input-with-icon">
                <FiUser className="text-campus-ink/40" />
                <input name="name" required value={form.name} onChange={handleChange} placeholder="abc123"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-campus-ink/30" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Roll Number</label>
              <div className="input-with-icon">
                <FiHash className="text-campus-ink/40" />
                <input name="rollNumber" required value={form.rollNumber} onChange={handleChange} placeholder="21103042"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-campus-ink/30" />
              </div>
            </div>
            
            <div>
              <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Institutional Email</label>
              <div className="input-with-icon">
                <FiMail className="text-campus-ink/40" />
                <input type="email" name="email" required value={form.email} onChange={handleChange}
                  placeholder="abc123@nitj.ac.in"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-campus-ink/30" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Password</label>
                <div className="input-with-icon">
                  <FiLock className="text-campus-ink/40" />
                  <input type="password" name="password" required value={form.password} onChange={handleChange}
                    placeholder="Min 6 chars"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-campus-ink/30" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-campus-ink/60">Confirm</label>
                <div className="input-with-icon">
                  <FiLock className="text-campus-ink/40" />
                  <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-campus-ink/30" />
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating account…' : 'Create My Account →'}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden flex-col justify-between bg-campus-ink p-12 text-white md:flex">
        <span />
        <div>
          <p className="eyebrow text-campus-emerald-500/80">Join the community</p>
          <h1 className="h-display mt-3 text-5xl leading-[1.05]">
            Trade with
            <br />
            people you can <span className="italic text-campus-orange">trust.</span>
          </h1>
          <ul className="mt-8 space-y-3 text-sm text-white/60">
            <li>✓ Verified with your @nitj.ac.in email</li>
            <li>✓ Meet only at predefined campus locations</li>
            <li>✓ Rate and review after every trade</li>
          </ul>
        </div>
        <p className="text-xs text-white/30">Built exclusively for NIT Jalandhar</p>
      </div>
    </div>
  );
}
