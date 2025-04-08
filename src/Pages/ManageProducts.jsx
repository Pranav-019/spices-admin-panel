import React, { useState, useEffect } from 'react';
import { Spin, Button, message } from 'antd';
import './css/ManageProducts.css'; 

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: '',
    customCategory: '',
    name: '',
    price: '',
    description: '',
    image: null
  });

  // Fetch products and categories on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProducts(), fetchCategories()]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://spices-backend-2jr1.vercel.app/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      message.error('Failed to fetch products');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://spices-backend-2jr1.vercel.app/api/products/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err.message);
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const finalCategory = formData.category === 'other' 
        ? formData.customCategory 
        : formData.category;

      if (!finalCategory) {
        throw new Error('Category is required');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('category', finalCategory);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch('https://spices-backend-2jr1.vercel.app/api/products/add', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      const newProduct = await response.json();
      setProducts(prev => [...prev, newProduct.product]);
      
      setFormData({
        category: '',
        customCategory: '',
        name: '',
        price: '',
        description: '',
        image: null
      });
      
      if (formData.category === 'other') {
        await fetchCategories();
      }

      message.success('Product added successfully!');
    } catch (err) {
      setError(err.message);
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-products-container">
      <h1 className="title">Manage Products</h1>

      <div className="content-card">
        {/* Add Product Form */}
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <div className="category-selection">
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a category</option>
                {Array.isArray(categories) && categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
                <option value="other">Other (specify below)</option>
              </select>
              
              {formData.category === 'other' && (
                <input
                  type="text"
                  name="customCategory"
                  value={formData.customCategory}
                  onChange={handleInputChange}
                  placeholder="Enter new category"
                  required
                />
              )}
            </div>
            
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Product Name"
              required
            />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Price"
              required
              min="0"
              step="0.01"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
              required
            />
            <div className="file-input-container">
              <label>
                Product Image:
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  accept="image/*"
                  required
                />
              </label>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && <div className="error-message">{error}</div>}

        {/* Products Grid */}
        {loading ? (
          <div className="loading-spinner">
            <Spin size="large" tip="Loading products..." />
          </div>
        ) : (
          <div className="products-grid">
            {Array.isArray(products) && products.length > 0 ? (
              products.map(product => (
                <div key={product._id} className="product-card">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="product-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <div className="product-details">
                    <h3>{product.name}</h3>
                    <p className="category">{product.category}</p>
                    <p className="price">₹{product.price.toFixed(2)}</p>
                    <p className="description">{product.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-products">No products found</div>
            )}
          </div>
        )}

        <div className="refresh-button-container">
          <Button 
            type="primary" 
            style={{ backgroundColor: '#FF4C24', borderColor: '#FF4C24' }}
            onClick={fetchAllData}
            loading={loading}
          >
            Refresh Products
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;