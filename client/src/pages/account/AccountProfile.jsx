import { useState } from 'react';
import api, { getError } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AccountProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', city: user.city || '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);
    try {
      const { data } = await api.patch('/auth/me', form);
      updateUser(data.user);
      setMessage('Profile saved');
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white';

  return (
    <div>
      <h1 className="text-2xl mb-4">My Profile</h1>

      <form onSubmit={handleSubmit} className="card p-6 max-w-lg space-y-3">
        {error && <p className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</p>}
        {message && <p className="bg-green-50 text-green-700 text-sm p-2 rounded">{message}</p>}

        <label className="block text-sm text-gray-600">
          Name
          <input name="name" value={form.name} onChange={handleChange} required minLength={2} className={`${inputClass} mt-1`} />
        </label>

        <label className="block text-sm text-gray-600">
          Email (cannot be changed)
          <input value={user.email} disabled className={`${inputClass} mt-1 bg-gray-100 text-gray-500`} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm text-gray-600">
            Phone
            <input name="phone" value={form.phone} onChange={handleChange} className={`${inputClass} mt-1`} />
          </label>
          <label className="block text-sm text-gray-600">
            City
            <input name="city" value={form.city} onChange={handleChange} className={`${inputClass} mt-1`} />
          </label>
        </div>

        <p className="text-sm text-gray-500">
          Account type: <b className="capitalize">{user.role === 'user' ? 'customer' : user.role}</b>
        </p>

        <button disabled={busy} className="btn">
          {busy ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}