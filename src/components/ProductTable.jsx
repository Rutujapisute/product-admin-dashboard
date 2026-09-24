import { Link } from "react-router-dom";
import { formatINR } from "../utils/currency";

export default function ProductTable({ products, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Rating</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <Link to={`/products/${product.id}`} className="product-name">
                  <img src={product.thumbnail || product.images?.[0]} alt="" />
                  {product.title}
                </Link>
              </td>
              <td>{product.category}</td>
              <td>{formatINR(product.price)}</td>
              <td>★ {product.rating ?? 0}</td>
              <td>{product.stock}</td>
              <td>
                <Link to={`/products/${product.id}`} className="action">View</Link>
                <Link to={`/products/${product.id}/edit`} className="action">Edit</Link>
                <button className="danger-link" onClick={() => onDelete(product.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
