import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import ShowImage from './ShowImage';
import moment from 'moment';
import { addItem, updateItem, removeItem } from './cartHelpers';
import StarRating from './StarRating';
import { getProductReviews } from './apiCore';

const Card = ({
  product,
  showViewProductButton = true,
  showAddToCartButton = true,
  cartUpdate = false,
  showRemoveProductButton = false,
  setRun = f => f,
  run = undefined
}) => {
  const [redirect, setRedirect] = useState(false);
  const [count, setCount] = useState(product.count);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getProductReviews(product._id);
        if (data && !data.error) {
          const avgRating = data.reduce((acc, review) => acc + review.rating, 0) / data.length;
          setAverageRating(parseFloat(avgRating.toFixed(1)));
        } else {
          console.error('Failed to fetch reviews:', data.error || 'No data returned');
        }
      } catch (err) {
        console.error('Error fetching reviews:', err.message);
      }
    };

    fetchReviews();
  }, [product._id]);

  const showViewButton = showViewProductButton => {
    return (
      showViewProductButton && (
        <Link to={`/product/${product._id}`} className="mr-2">
          <button className="btn btn-outline-primary mt-2 mb-2 card-btn-1">View Product</button>
        </Link>
      )
    );
  };

  const addToCart = () => {
    addItem(product, setRedirect(true));
  };

  const shouldRedirect = redirect => {
    if (redirect) {
      return <Navigate to="/cart" />;
    }
  };

  const showAddToCartBtn = showAddToCartButton => {
    return (
      showAddToCartButton && (
        <button onClick={addToCart} className="btn btn-outline-warning mt-2 mb-2 card-btn-1">
          Add to cart
        </button>
      )
    );
  };

  const showStock = quantity => {
    return quantity > 0 ? (
      <span className="badge badge-primary badge-pill" style={{ marginLeft: '5px' }}>In Stock</span>
    ) : (
      <span className="badge badge-primary badge-pill" style={{ marginLeft: '5px' }}>Out of Stock</span>
    );
  };

  const handleChange = productId => event => {
    setRun(!run);
    setCount(event.target.value < 1 ? 1 : event.target.value);
    if (event.target.value >= 1) {
      updateItem(productId, event.target.value);
    }
  };

  const showCartUpdateOptions = cartUpdate => {
    return (
      cartUpdate && (
        <div>
          <div className="input-group mb-3">
            <div className="input-group-prepend">
              <span className="input-group-text">Adjust Quantity</span>
            </div>
            <input type="number" className="form-control" value={count} onChange={handleChange(product._id)} />
          </div>
        </div>
      )
    );
  };

  const showRemoveButton = showRemoveProductButton => {
    return (
      showRemoveProductButton && (
        <button
          onClick={() => {
            removeItem(product._id);
            setRun(!run);
          }}
          className="btn btn-outline-danger mt-2 mb-2"
        >
          Remove Product
        </button>
      )
    );
  };

  return (
    <div className="card">
      <div className="card-header card-header-1">{product.name}</div>
      <div className="card-body">
        {shouldRedirect(redirect)}
        <ShowImage item={product} url="product" />
        <p className="card-p mt-2">{product.description ? product.description.substring(0, 100) : ''}</p>
        <p className="card-p black-10">$ {product.price}</p>
        <p className="black-9">Category: {product.category && product.category.name}</p>
        <p className="black-8">Author: {product.author}</p>
        <div style={{ margin: '10px 0' }}>
          <StarRating
            count={5}
            value={averageRating}
            size={24}
            edit={false}
          />
        </div><br />
        <p className="black-8">Added on {moment(product.createdAt).fromNow()}</p>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
          {showStock(product.quantity)}
        </div>
        {showViewButton(showViewProductButton)}
        {showAddToCartBtn(showAddToCartButton)}
        {showRemoveButton(showRemoveProductButton)}
        {showCartUpdateOptions(cartUpdate)}
      </div>
    </div>
  );
};

export default Card;
