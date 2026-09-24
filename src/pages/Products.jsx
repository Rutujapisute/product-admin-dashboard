import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllProducts, getCategories, deleteProduct } from "../api/products";
import ProductTable from "../components/ProductTable";
import Pagination from "../components/Pagination";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

const LOCAL_KEY = "localProducts";
const DELETED_KEY = "deletedProductIds";

function readLocalProducts() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); }
  catch { return []; }
}

function readDeletedIds() {
  try { return JSON.parse(localStorage.getItem(DELETED_KEY) || "[]"); }
  catch { return []; }
}

function saveLocalProducts(items) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
}

function saveDeletedIds(items) {
  localStorage.setItem(DELETED_KEY, JSON.stringify(items));
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [apiProducts, setApiProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [localProducts, setLocalProducts] = useState(readLocalProducts);
  const [deletedIds, setDeletedIds] = useState(readDeletedIds);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const page = Math.max(1, Number(params.get("page")) || 1);
  const limit = [10, 20, 50].includes(Number(params.get("limit")))
    ? Number(params.get("limit"))
    : 10;
  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const sort = params.get("sort") || "";
  const order = params.get("order") === "desc" ? "desc" : "asc";

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllProducts({ search, category });
      setApiProducts(data);
    } catch {
      setError("Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const allProducts = useMemo(() => {
    const deleted = new Set(deletedIds);
    const localMap = new Map(localProducts.map((p) => [Number(p.id), p]));

    let list = apiProducts
      .filter((p) => !deleted.has(Number(p.id)))
      .map((p) => localMap.get(Number(p.id)) || p);

    const apiIds = new Set(apiProducts.map((p) => Number(p.id)));
    list = list.concat(
      localProducts.filter(
        (p) => !apiIds.has(Number(p.id)) && !deleted.has(Number(p.id))
      )
    );

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }

    if (category) {
      list = list.filter((p) => p.category === category);
    }

    if (sort) {
      list.sort((a, b) => {
        if (sort === "title") {
          const result = String(a.title).localeCompare(String(b.title));
          return order === "asc" ? result : -result;
        }

        const result = Number(a[sort] || 0) - Number(b[sort] || 0);
        return order === "asc" ? result : -result;
      });
    }

    return list;
  }, [apiProducts, localProducts, deletedIds, search, category, sort, order]);

  const totalPages = Math.max(1, Math.ceil(allProducts.length / limit));
  const safePage = Math.min(page, totalPages);
  const visible = allProducts.slice((safePage - 1) * limit, safePage * limit);

  function update(values) {
    const next = new URLSearchParams(params);
    Object.entries(values).forEach(([key, value]) => {
      if (value === "" || value == null) next.delete(key);
      else next.set(key, String(value));
    });
    setParams(next);
  }

  function clearFilters() {
    setParams({ page: "1", limit: String(limit) });
  }

  function remove(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const nextDeleted = [...new Set([...deletedIds, Number(id)])];
    const nextLocal = localProducts.filter((p) => Number(p.id) !== Number(id));

    setDeletedIds(nextDeleted);
    setLocalProducts(nextLocal);
    saveDeletedIds(nextDeleted);
    saveLocalProducts(nextLocal);

    deleteProduct(id).catch(() => {});
  }

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Products</h1>
          <p>Search, filter, sort and manage products.</p>
        </div>
        <Link to="/products/new" className="primary">+ Add Product</Link>
      </div>

      <div className="filters">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => update({ search: e.target.value, page: 1 })}
        />

        <select value={category} onChange={(e) => update({ category: e.target.value, page: 1 })}>
          <option value="">All Categories</option>
          {categories.filter(Boolean).map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>

        <select
          value={sort ? `${sort}-${order}` : ""}
          onChange={(e) => {
            const [field, direction] = e.target.value.split("-");
            update({
              sort: field || "",
              order: direction || "",
              page: 1,
            });
          }}
        >
          <option value="">Sort</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Rating: High to Low</option>
          <option value="rating-asc">Rating: Low to High</option>
          <option value="title-asc">Title: A to Z</option>
          <option value="title-desc">Title: Z to A</option>
        </select>

        <button className="secondary" onClick={clearFilters}>Clear</button>
      </div>

      {loading && <Loading text="Loading products..." />}
      {error && <ErrorMessage message={error} onRetry={loadProducts} />}

      {!loading && !error && allProducts.length === 0 && (
        <div className="message">No products found.</div>
      )}

      {!loading && !error && visible.length > 0 && (
        <>
          <ProductTable products={visible} onDelete={remove} />
          <Pagination
            page={safePage}
            limit={limit}
            total={allProducts.length}
            onPageChange={(newPage) => update({ page: newPage })}
            onLimitChange={(newLimit) => update({ limit: newLimit, page: 1 })}
          />
        </>
      )}
    </>
  );
}
