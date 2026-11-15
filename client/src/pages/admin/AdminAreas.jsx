import { useEffect, useState } from 'react';
import api, { getError } from '../../api/axios';

export default function AdminAreas() {
  const [areas, setAreas] = useState([]);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    api
      .get('/service-areas/all')
      .then((res) => setAreas(res.data))
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [refresh]);

  // Run an API call and then reload the list
  const run = async (callApi) => {
    setError('');
    try {
      await callApi();
      setRefresh((n) => n + 1);
    } catch (err) {
      setError(getError(err));
    }
  };

  const addCity = async (e) => {
    e.preventDefault();
    await run(() => api.post('/service-areas', { city }));
    setCity('');
  };

  const remove = (a) => {
    if (window.confirm(`Delete ${a.city}?`)) run(() => api.delete(`/service-areas/${a._id}`));
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-xl font-semibold mb-4">Service areas</h2>

      <form onSubmit={addCity} className="flex gap-2 mb-4">
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City name"
          required
          minLength={2}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg">Add city</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600 mb-3">{error}</p>}
      {!loading && areas.length === 0 && <p className="text-gray-500">No cities added yet.</p>}

      <div className="space-y-2">
        {areas.map((a) => (
          <div key={a._id} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <span className="font-medium capitalize">{a.city}</span>
              <span className={`ml-3 text-xs ${a.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                {a.isActive ? 'Active' : 'Not active'}
              </span>
            </div>
            <div className="space-x-3 text-sm">
              <button onClick={() => run(() => api.patch(`/service-areas/${a._id}`, { isActive: !a.isActive }))} className="text-gray-600 hover:underline">
                {a.isActive ? 'Turn off' : 'Turn on'}
              </button>
              <button onClick={() => remove(a)} className="text-red-600 hover:underline">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}