import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import api, { getError } from '../../api/axios';

const emptyForm = {
  name: '',
  description: '',
  category: 'furniture',
  subCategory: '',
  imageUrl: '',
  securityDeposit: '',
  stock: '',
  isActive: true,
  tenureOptions: [{ months: '', monthlyRent: '' }],
};

// This one form is used for both "Add product" and "Edit product"
export default function ProductForm() {
  const { id } = useParams(); // there is an id only in edit mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Edit mode: load the product and fill the form
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/products/${id}`)
      .then((res) => {
        const p = res.data;
        setForm({
          name: p.name,
          description: p.description || '',
          category: p.category,
          subCategory: p.subCategory || '',
          imageUrl: p.images?.[0] || '',
          securityDeposit: p.securityDeposit,
          stock: p.stock,
          isActive: p.isActive,
          tenureOptions: p.tenureOptions.map((o) => ({ months: o.months, monthlyRent: o.monthlyRent })),
        });
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const changeTenure = (index, field, value) => {
    setForm({
      ...form,
      tenureOptions: form.tenureOptions.map((o, i) => (i === index ? { ...o, [field]: value } : o)),
    });
  };

  const addTenure = () =>
    setForm({ ...form, tenureOptions: [...form.tenureOptions, { months: '', monthlyRent: '' }] });

  const removeTenure = (index) => {
    if (form.tenureOptions.length === 1) return; // keep at least one option
    setForm({ ...form, tenureOptions: form.tenureOptions.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    // Inputs give text, so numbers must be converted
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      subCategory: form.subCategory,
      images: form.imageUrl ? [form.imageUrl] : [],
      securityDeposit: Number(form.securityDeposit),
      stock: Number(form.stock),
      isActive: form.isActive,
      tenureOptions: form.tenureOptions.map((o) => ({
        months: Number(o.months),
        monthlyRent: Number(o.monthlyRent),
      })),
    };

    try {
      if (isEdit) await api.put(`/products/${id}`, payload);
      else await api.post('/products', payload);
      navigate('/vendor/products');
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2';

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <h2 className="text-xl font-semibold">{isEdit ? 'Edit product' : 'Add product'}</h2>

      {error && <p className="bg-red-50 text-red-600 text-sm p-2 rounded">{error}</p>}

      <input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required minLength={2} className={inputClass} />
      <textarea name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} rows={3} className={inputClass} />

      <div className="grid grid-cols-2 gap-3">
        <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
          <option value="furniture">Furniture</option>
          <option value="appliance">Appliance</option>
        </select>
        <input name="subCategory" placeholder="Type (bed, sofa, fridge...)" value={form.subCategory} onChange={handleChange} className={inputClass} />
      </div>

      <input name="imageUrl" placeholder="Image link (optional)" value={form.imageUrl} onChange={handleChange} className={inputClass} />

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm text-gray-600">
          Security deposit (₹)
          <input name="securityDeposit" type="number" min="0" value={form.securityDeposit} onChange={handleChange} required className={`${inputClass} mt-1`} />
        </label>
        <label className="text-sm text-gray-600">
          Stock (how many items)
          <input name="stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} required className={`${inputClass} mt-1`} />
        </label>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Rental plans</p>
        <div className="space-y-2">
          {form.tenureOptions.map((o, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <input type="number" min="1" step="1" placeholder="Months" value={o.months} onChange={(e) => changeTenure(index, 'months', e.target.value)} required className={inputClass} />
              <input type="number" min="0" placeholder="Rent per month (₹)" value={o.monthlyRent} onChange={(e) => changeTenure(index, 'monthlyRent', e.target.value)} required className={inputClass} />
              <button type="button" onClick={() => removeTenure(index)} className="text-red-600 text-sm px-2">
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addTenure} className="text-indigo-600 text-sm mt-2 hover:underline">
          + Add another plan
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
        Show this product in the shop
      </label>

      <div className="flex gap-3">
        <button disabled={busy} className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {busy ? 'Saving...' : 'Save product'}
        </button>
        <button type="button" onClick={() => navigate('/vendor/products')} className="border border-gray-300 px-5 py-2 rounded-lg">
          Cancel
        </button>
      </div>
    </form>
  );
}