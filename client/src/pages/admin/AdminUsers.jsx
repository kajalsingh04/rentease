import { useEffect, useState } from 'react';
import api, { getError } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [role, setRole] = useState('');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api
      .get('/admin/users', { params: { role, search, page, limit: 15 } })
      .then((res) => {
        setUsers(res.data.items);
        setPages(res.data.pages);
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [role, search, page, refresh]);

  const changeRole = async (u, newRole) => {
    if (!window.confirm(`Change ${u.name} to ${newRole}?`)) return;
    setError('');
    try {
      await api.patch(`/admin/users/${u._id}/role`, { role: newRole });
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(getError(err));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchText);
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 justify-between mb-4">
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="">All roles</option>
          <option value="user">Customers</option>
          <option value="vendor">Vendors</option>
          <option value="admin">Admins</option>
        </select>

        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search name or email..."
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
          <button className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm">Search</button>
        </form>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">City</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-gray-100">
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.city || '-'}</td>
                <td className="p-3">{formatDate(u.createdAt)}</td>
                <td className="p-3">
                  <select
                    value={u.role}
                    disabled={u._id === me.id} // you cannot change your own role
                    onChange={(e) => changeRole(u, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1 disabled:opacity-50"
                  >
                    <option value="user">user</option>
                    <option value="vendor">vendor</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && users.length === 0 && <p className="text-gray-500 mt-3">No users found.</p>}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">
            Previous
          </button>
          <span className="text-sm">
            Page {page} of {pages}
          </span>
          <button disabled={page === pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 border rounded-lg disabled:opacity-40">
            Next
          </button>
        </div>
      )}
    </div>
  );
}