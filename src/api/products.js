import api from "./axios";

export async function getCategories() {
  const response = await api.get("/products/categories");
  return response.data.map((item) =>
    typeof item === "string" ? item : item.slug || item.name
  );
}

export async function getProduct(id) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}

export async function getAllProducts({ search = "", category = "" } = {}) {
  let response;

  if (search.trim()) {
    response = await api.get("/products/search", {
      params: { q: search.trim(), limit: 0 },
    });
  } else if (category) {
    response = await api.get(`/products/category/${category}`, {
      params: { limit: 0 },
    });
  } else {
    response = await api.get("/products", {
      params: { limit: 0 },
    });
  }

  return response.data.products || [];
}

export async function addProduct(product) {
  const response = await api.post("/products/add", product);
  return response.data;
}

export async function updateProduct(id, product) {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
}

export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}
