import { useState } from 'react';
import api, { getError } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AccountProfile() {
  const { user, updateUser } = useAuth();
  const isVendor = user.role === 'vendor';

  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || '',
    city: user.city || '',
    businessName: user.businessName || '',
    servicesOffered: user.servicesOffered || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);
    try {
      const body = { name: form.name, phone: form.phone, city: form.city };
      if (isVendor) {
        body.businessName = form.businessName;
        body.servicesOffered = form.servicesOffered;
      }
      const { data } = await api.patch('/auth/me', body);
      updateUser(data.user);
      setMessage('Profile saved');
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('The new passwords do not match');
      return;
    }

    setPasswordBusy(true);
    try {
      await api.patch('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordMessage('Password changed');
    } catch (err) {
      setPasswordError(getError(err));
    } finally {
      setPasswordBusy(false);
    }
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 bg-white';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl">My Profile</h1>

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

        {isVendor && (
          <>
            <label className="block text-sm text-gray-600">
              Business name (customers see this on your products)
              <input name="businessName" value={form.businessName} onChange={handleChange} maxLength={80} className={`${inputClass} mt-1`} />
            </label>
            <label className="block text-sm text-gray-600">
              Services offered
              <textarea name="servicesOffered" value={form.servicesOffered} onChange={handleChange} maxLength={300} rows={3} placeholder="For example: free delivery, repair in 48 hours" className={`${inputClass} mt-1`} />
            </label>
          </>
        )}

        <p className="text-sm text-gray-500">
          Account type: <b className="capitalize">{user.role === 'user' ? 'customer' : user.role}</b>
        </p>

        <button disabled={busy} className="btn">
          {busy ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <form onSubmit={handlePassword} className="card p-6 max-w-lg space-y-3">
        <h2 className="text-lg">Change password</h2>

        {passwordError && <p className="bg-red-50 text-red-600 text-sm p-2 rounded">{passwordError}</p>}
        {passwordMessage && <p className="bg-green-50 text-green-700 text-sm p-2 rounded">{passwordMessage}</p>}

        <label className="block text-sm text-gray-600">
          Current password
          <input name="currentPassword" type="password" value={passwords.currentPassword} onChange={handlePasswordChange} required autoComplete="current-password" className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-sm text-gray-600">
          New password (at least 6 letters)
          <input name="newPassword" type="password" value={passwords.newPassword} onChange={handlePasswordChange} required minLength={6} autoComplete="new-password" className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-sm text-gray-600">
          Confirm new password
          <input name="confirmPassword" type="password" value={passwords.confirmPassword} onChange={handlePasswordChange} required minLength={6} autoComplete="new-password" className={`${inputClass} mt-1`} />
        </label>

        <button disabled={passwordBusy} className="btn">
          {passwordBusy ? 'Saving...' : 'Change password'}
        </button>
      </form>
    </div>
  );
}