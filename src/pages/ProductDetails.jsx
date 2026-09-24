import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProduct } from "../api/products";
import { formatINR } from "../utils/currency";
import Loading from "../components/Loading";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("localProducts") || "[]");
    const localProduct = local.find((p) => Number(p.id) === Number(id));

    if (localProduct) {
      setProduct(localProduct);
      setLoading(false);
      return;
    }

    getProduct(id)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!product) return <div className="message">Product not found.</div>;

  return (
    <div className="details">
      <button className="secondary" onClick={() => navigate(-1)}>← Back</button>

      <div className="details-grid">
        <div>
          <img
            className="hero-image"
            src={product.thumbnail || product.images?.[0]}
            alt={product.title}
          />
        </div>

        <div>
          <h1>{product.title}</h1>
          <p>{product.description}</p>
          <h2>{formatINR(product.price)}</h2>
          <p><b>Category:</b> {product.category}</p>
          <p><b>Rating:</b> ★ {product.rating ?? 0}</p>
          <p><b>Stock:</b> {product.stock}</p>

          <Link className="primary" to={`/products/${product.id}/edit`}>
            Edit Product
          </Link>
        </div>
      </div>

      {product.reviews?.length > 0 && (
        <div className="reviews">
          <h2>Reviews</h2>
          {product.reviews.map((review, index) => (
            <div className="review" key={index}>
              <b>{review.reviewerName || "Customer"}</b>
              <span> ★ {review.rating}</span>
              <p>{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
