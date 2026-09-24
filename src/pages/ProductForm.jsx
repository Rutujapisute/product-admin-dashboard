import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addProduct, getProduct, updateProduct } from "../api/products";
import { apiPriceToInr, inrToApiPrice } from "../utils/currency";

const LOCAL_KEY = "localProducts";

function readLocal() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); }
  catch { return []; }
}

function saveLocal(items) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

export default function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "beauty",
    price: "",
    stock: "",
    brand: "",
    thumbnail: "",
  });
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editing) return;

    const local = readLocal();
    const localProduct = local.find((p) => Number(p.id) === Number(id));

    const fill = (p) => {
      setForm({
        title: p.title || "",
        description: p.description || "",
        category: p.category || "beauty",
        price: String(apiPriceToInr(p.price)),
        stock: String(p.stock ?? ""),
        brand: p.brand || "",
        thumbnail: p.thumbnail || p.images?.[0] || "",
      });
      setLoading(false);
    };

    if (localProduct) {
      fill(localProduct);
      return;
    }

    getProduct(id)
      .then(fill)
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id, editing]);

  function change(event) {
    setForm((old) => ({
      ...old,
      [event.target.name]: event.target.value,
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (saving) return;

    if (!form.title.trim()) {
      setError("Product name is required.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Enter a valid INR price.");
      return;
    }

    if (form.stock === "" || Number(form.stock) < 0) {
      setError("Enter a valid stock value.");
      return;
    }

    setSaving(true);
    setError("");

    const product = {
      id: editing ? Number(id) : Date.now(),
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim() || "beauty",
      price: inrToApiPrice(form.price),
      stock: Number(form.stock),
      brand: form.brand.trim(),
      thumbnail:
        form.thumbnail.trim() ||
        "https://cdn.dummyjson.com/product-images/beauty/essence-mascara-lash-princess/thumbnail.webp",
      rating: editing ? 4.5 : 0,
      reviews: [],
    };

    try {
      if (editing) {
        await updateProduct(id, product);
      } else {
        await addProduct(product);
      }

      const local = readLocal();
      const next = editing
        ? (local.some((p) => Number(p.id) === Number(id))
            ? local.map((p) => Number(p.id) === Number(id) ? product : p)
            : [...local, product])
        : [...local, product];

      saveLocal(next);
      navigate("/products");
    } catch (error) {
      setError(error.response?.data?.message || "Unable to save product.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="message">Loading product...</div>;

  return (
    <form className="form" onSubmit={submit}>
      <h1>{editing ? "Edit Product" : "Add Product"}</h1>
      <p className="muted">Price is entered in Indian Rupees (₹).</p>

      <label>Product Name *</label>
      <input name="title" value={form.title} onChange={change} />

      <label>Description</label>
      <textarea name="description" rows="4" value={form.description} onChange={change} />

      <label>Category *</label>
      <input name="category" value={form.category} onChange={change} />

      <label>Price (INR ₹) *</label>
      <input name="price" type="number" min="0" value={form.price} onChange={change} />

      <label>Stock *</label>
      <input name="stock" type="number" min="0" value={form.stock} onChange={change} />

      <label>Brand</label>
      <input name="brand" value={form.brand} onChange={change} />

      <label>Image URL</label>
      <input name="thumbnail" value={form.thumbnail} onChange={change} />

      {error && <div className="error">{error}</div>}

      <div className="form-actions">
        <button type="button" className="secondary" onClick={() => navigate("/products")}>
          Cancel
        </button>
        <button className="primary" disabled={saving}>
          {saving ? "Saving..." : editing ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
