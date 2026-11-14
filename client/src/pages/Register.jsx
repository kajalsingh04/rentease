import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { getError } from '../api/axios';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/', { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2';

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl border border-gray-200">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>

      {error && <p className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required className={inputClass} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required className={inputClass} />
        <input name="password" type="password" placeholder="Password (min 6 letters)" value={form.password} onChange={handleChange} required minLength={6} className={inputClass} />
        <input name="phone" placeholder="Phone (optional)" value={form.phone} onChange={handleChange} className={inputClass} />
        <input name="city" placeholder="City (optional)" value={form.city} onChange={handleChange} className={inputClass} />

        <select name="role" value={form.role} onChange={handleChange} className={inputClass}>
          <option value="user">I want to rent products</option>
          <option value="vendor">I am a vendor (I give products on rent)</option>
        </select>

        <button
          disabled={busy}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? 'Please wait...' : 'Register'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}