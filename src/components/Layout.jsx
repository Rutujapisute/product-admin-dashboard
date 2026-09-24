import { Link, useNavigate } from "react-router-dom";

export default function Layout({ children, onLogout }) {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
    navigate("/login");
  }

  return (
    <>
      <header className="header">
        <Link to="/products" className="brand">Product Admin</Link>
        <nav>
          <Link to="/products">Products</Link>
          <Link to="/products/new" className="primary small">+ Add Product</Link>
          <button className="logout" onClick={logout}>Logout</button>
        </nav>
      </header>
      <main className="container">{children}</main>
    </>
  );
}
