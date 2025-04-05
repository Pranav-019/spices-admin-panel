import React, { useState, useEffect } from 'react';
import { Table, Select, Button, message, Tabs, Card, Spin, Tag, Space, Descriptions } from 'antd';
import axios from 'axios';
import './css/UserOrderManagement.css';

const { TabPane } = Tabs;
const { Option } = Select;

const UserOrderManagement = () => {
  const [productOrders, setProductOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('product');

  const statusOptions = ['Order Placed', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
  const statusColors = {
    'Order Placed': 'blue',
    'Processing': 'orange',
    'Confirmed': 'green',
    'Shipped': 'cyan',
    'Delivered': 'purple',
    'Cancelled': 'red'
  };

  // Fetch all orders
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      
      // Fetch product orders
      const productResponse = await axios.get(
        'https://spices-backend.vercel.app/api/productorder'
      );
      
      // Fetch custom orders
      const customResponse = await axios.get(
        'https://spices-backend.vercel.app/api/orders'
      );

      setProductOrders(productResponse.data);
      setCustomOrders(customResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch orders');
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus, isProductOrder) => {
    try {
      const endpoint = isProductOrder 
        ? `/api/productorder/${orderId}`
        : `/api/orders/${orderId}`;

      await axios.put(
        `https://spices-backend.vercel.app${endpoint}`,
        { orderStatus: newStatus }
      );

      message.success('Order status updated successfully!');
      fetchAllOrders(); // Refresh data
    } catch (error) {
      console.error('Status update error:', error);
      message.error('Failed to update status');
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const renderProductOrderDetails = (record) => {
    return (
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Order ID">{record._id}</Descriptions.Item>
        <Descriptions.Item label="Category">{record.product?.category || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Product Name">{record.product?.name || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Quantity">{record.quantity}</Descriptions.Item>
        {record.grindLevel && <Descriptions.Item label="Grind Level">{record.grindLevel}</Descriptions.Item>}
        {record.specialInstructions && (
          <Descriptions.Item label="Special Instructions">{record.specialInstructions}</Descriptions.Item>
        )}
        <Descriptions.Item label="Price per unit">₹{record.product?.price?.toFixed(2) || '0.00'}</Descriptions.Item>
        <Descriptions.Item label="Total Amount">₹{(record.product?.price * record.quantity)?.toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label="Order Date">
          {new Date(record.createdAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const renderCustomOrderDetails = (record) => {
    return (
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Order ID">{record._id}</Descriptions.Item>
        <Descriptions.Item label="Category">{record.category}</Descriptions.Item>
        <Descriptions.Item label="Product Name">{record.productName}</Descriptions.Item>
        <Descriptions.Item label="Quantity">{record.quantity}</Descriptions.Item>
        {record.grindLevel && <Descriptions.Item label="Grind Level">{record.grindLevel}</Descriptions.Item>}
        {record.specialInstructions && (
          <Descriptions.Item label="Special Instructions">{record.specialInstructions}</Descriptions.Item>
        )}
        <Descriptions.Item label="Amount">₹{record.tokenAmount?.toFixed(2)}</Descriptions.Item>
        <Descriptions.Item label="Order Date">
          {new Date(record.createdAt).toLocaleString()}
        </Descriptions.Item>
      </Descriptions>
    );
  };

  const productOrderColumns = [
    {
      title: 'Product',
      dataIndex: ['product', 'name'],
      key: 'productName',
      render: (text, record) => (
        <div className="product-info">
          <h4>{text || 'N/A'}</h4>
          <Tag color={statusColors[record.orderStatus]}>{record.orderStatus}</Tag>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: ['product', 'category'],
      key: 'category',
      render: (category) => category || 'N/A'
    },
    {
      title: 'Price',
      key: 'price',
      render: (_, record) => `₹${record.product?.price?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Total',
      key: 'total',
      render: (_, record) => `₹${(record.product?.price * record.quantity)?.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'orderStatus',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 160 }}
          onChange={(value) => updateOrderStatus(record._id, value, true)}
        >
          {statusOptions.map(option => (
            <Option key={option} value={option}>
              <Tag color={statusColors[option]}>{option}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            danger 
            onClick={() => updateOrderStatus(record._id, 'Cancelled', true)}
          >
            Cancel Order
          </Button>
        </Space>
      ),
    },
  ];

  const customOrderColumns = [
    {
      title: 'Product',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => (
        <div className="product-info">
          <h4>{text}</h4>
          <Tag color={statusColors[record.orderStatus]}>{record.orderStatus}</Tag>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Amount',
      dataIndex: 'tokenAmount',
      key: 'amount',
      render: (amount) => `₹${amount?.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'orderStatus',
      key: 'status',
      render: (status, record) => (
        <Select
          value={status}
          style={{ width: 160 }}
          onChange={(value) => updateOrderStatus(record._id, value, false)}
        >
          {statusOptions.map(option => (
            <Option key={option} value={option}>
              <Tag color={statusColors[option]}>{option}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            danger 
            onClick={() => updateOrderStatus(record._id, 'Cancelled', false)}
          >
            Cancel Order
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-order-management">
      <div className="admin-header">
        <h1></h1>
        <Button 
          type="primary" 
          style={{ backgroundColor: '#FF4C24', borderColor: '#FF4C24' }}
          onClick={fetchAllOrders}
        >
          Refresh Orders
        </Button>
      </div>
      
      <Card className="order-management-card">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          tabBarStyle={{ color: '#FF4C24' }}
        >
          <TabPane tab={`Product Orders (${productOrders.length})`} key="product">
            {loading ? (
              <div className="loading-spinner">
                <Spin size="large" tip="Loading product orders..." />
              </div>
            ) : (
              <Table
                columns={productOrderColumns}
                dataSource={productOrders}
                rowKey="_id"
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 1500 }}
                bordered
                expandable={{
                  expandedRowRender: record => renderProductOrderDetails(record),
                  rowExpandable: record => true,
                }}
              />
            )}
          </TabPane>
          <TabPane tab={`Custom Orders (${customOrders.length})`} key="custom">
            {loading ? (
              <div className="loading-spinner">
                <Spin size="large" tip="Loading custom orders..." />
              </div>
            ) : (
              <Table
                columns={customOrderColumns}
                dataSource={customOrders}
                rowKey="_id"
                pagination={{ pageSize: 10, showSizeChanger: true }}
                scroll={{ x: 1000 }}
                bordered
                expandable={{
                  expandedRowRender: record => renderCustomOrderDetails(record),
                  rowExpandable: record => true,
                }}
              />
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default UserOrderManagement;