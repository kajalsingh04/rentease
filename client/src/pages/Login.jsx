import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { getError } from '../api/axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const goBackTo = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate(goBackTo, { replace: true });
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl border border-gray-200">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      {error && <p className="bg-red-50 text-red-600 text-sm p-2 rounded mb-3">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        <button
          disabled={busy}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? 'Please wait...' : 'Login'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        New here?{' '}
        <Link to="/register" className="text-indigo-600 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}