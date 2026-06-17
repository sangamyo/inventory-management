import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  Users,
} from "lucide-react";
import { api } from "./api";
import "./styles.css";

// Import modular components
import { Metric } from "./components/Common";
import { ProductSection } from "./components/ProductSection";
import { CustomerSection } from "./components/CustomerSection";
import { OrderSection } from "./components/OrderSection";
import { OrderDetailsModal } from "./components/OrderDetailsModal";

const initialProduct = { name: "", sku: "", price: "", quantity_in_stock: "" };
const initialCustomer = { full_name: "", email: "", phone_number: "" };

function App() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    total_products: 0,
    total_customers: 0,
    total_orders: 0,
    low_stock_products: 0,
  });
  
  const [productForm, setProductForm] = useState(initialProduct);
  const [editingProductId, setEditingProductId] = useState(null);
  const [customerForm, setCustomerForm] = useState(initialCustomer);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Tab/View selection state
  const [activeTab, setActiveTab] = useState("products");
  // Product list filter state
  const [productFilter, setProductFilter] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [dashboard, productList, customerList, orderList] = await Promise.all([
        api.dashboard(),
        api.products.list(),
        api.customers.list(),
        api.orders.list(),
      ]);
      setSummary(dashboard);
      setProducts(productList);
      setCustomers(customerList);
      setOrders(orderList);
    } catch (error) {
      showNotice(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function showNotice(message, type = "success") {
    setNotice({ message, type });
    window.clearTimeout(showNotice.timer);
    showNotice.timer = window.setTimeout(() => setNotice(null), 4500);
  }

  function updateField(setter, field, value) {
    setter((current) => ({ ...current, [field]: value }));
  }

  function validateProduct() {
    if (!productForm.name.trim() || !productForm.sku.trim()) return "Product name and SKU are required.";
    if (Number(productForm.price) <= 0) return "Price must be greater than zero.";
    if (Number(productForm.quantity_in_stock) < 0) return "Quantity cannot be negative.";
    return null;
  }

  async function submitProduct(event) {
    event.preventDefault();
    const error = validateProduct();
    if (error) return showNotice(error, "error");
    const payload = {
      ...productForm,
      price: Number(productForm.price).toFixed(2),
      quantity_in_stock: Number(productForm.quantity_in_stock),
    };
    try {
      if (editingProductId) {
        await api.products.update(editingProductId, payload);
        showNotice("Product updated.");
      } else {
        await api.products.create(payload);
        showNotice("Product added.");
      }
      setProductForm(initialProduct);
      setEditingProductId(null);
      await loadAll();
    } catch (error) {
      showNotice(error.message, "error");
    }
  }

  function editProduct(product) {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity_in_stock: product.quantity_in_stock,
    });
    // Open products view and scroll
    setActiveTab("products");
    setProductFilter(null);
    scrollToSection("products-panel");
  }

  async function deleteProduct(productId) {
    try {
      await api.products.delete(productId);
      showNotice("Product deleted.");
      await loadAll();
    } catch (error) {
      showNotice(error.message, "error");
    }
  }

  async function submitCustomer(event) {
    event.preventDefault();
    if (!customerForm.full_name.trim() || !customerForm.email.trim() || !customerForm.phone_number.trim()) {
      return showNotice("Customer name, email, and phone are required.", "error");
    }
    try {
      await api.customers.create(customerForm);
      setCustomerForm(initialCustomer);
      showNotice("Customer added.");
      await loadAll();
    } catch (error) {
      showNotice(error.message, "error");
    }
  }

  async function deleteCustomer(customerId) {
    try {
      await api.customers.delete(customerId);
      showNotice("Customer deleted.");
      await loadAll();
    } catch (error) {
      showNotice(error.message, "error");
    }
  }

  async function handleCreateOrder(payload) {
    try {
      await api.orders.create(payload);
      showNotice("Order created and inventory updated.");
      await loadAll();
    } catch (error) {
      showNotice(error.message, "error");
      throw error;
    }
  }

  async function handleCancelOrder(orderId) {
    try {
      await api.orders.delete(orderId);
      showNotice("Order canceled and stock restored.");
      await loadAll();
    } catch (error) {
      showNotice(error.message, "error");
    }
  }

  function scrollToSection(id) {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Inventory operations</p>
          <h1>Inventory & Order Management</h1>
        </div>
        <button className="icon-button" onClick={loadAll} title="Refresh data" type="button">
          <RefreshCw size={18} />
        </button>
      </header>

      {notice && (
        <div className={`notice ${notice.type}`}>
          {notice.type === "error" ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notice.message}</span>
        </div>
      )}

      <section className="summary-grid" aria-label="Dashboard summary">
        <Metric 
          icon={<Boxes />} 
          label="Products" 
          value={summary.total_products} 
          onClick={() => { setActiveTab("products"); setProductFilter(null); scrollToSection("products-panel"); }}
          active={activeTab === "products" && productFilter === null}
        />
        <Metric 
          icon={<Users />} 
          label="Customers" 
          value={summary.total_customers} 
          onClick={() => { setActiveTab("customers"); scrollToSection("customers-panel"); }}
          active={activeTab === "customers"}
        />
        <Metric 
          icon={<ClipboardList />} 
          label="Orders" 
          value={summary.total_orders} 
          onClick={() => { setActiveTab("orders"); scrollToSection("orders-panel"); }}
          active={activeTab === "orders"}
        />
        <Metric 
          icon={<AlertCircle />} 
          label="Low Stock" 
          value={summary.low_stock_products} 
          onClick={() => { setActiveTab("products"); setProductFilter("low_stock"); scrollToSection("products-panel"); }}
          active={activeTab === "products" && productFilter === "low_stock"}
        />
      </section>

      <div className="workspace single-view">
        {activeTab === "products" && (
          <ProductSection
            products={products}
            productForm={productForm}
            setProductForm={setProductForm}
            editingProductId={editingProductId}
            setEditingProductId={setEditingProductId}
            submitProduct={submitProduct}
            editProduct={editProduct}
            deleteProduct={deleteProduct}
            loading={loading}
            initialProduct={initialProduct}
            updateField={updateField}
            productFilter={productFilter}
            setProductFilter={setProductFilter}
          />
        )}

        {activeTab === "customers" && (
          <CustomerSection
            customers={customers}
            customerForm={customerForm}
            setCustomerForm={setCustomerForm}
            submitCustomer={submitCustomer}
            deleteCustomer={deleteCustomer}
            loading={loading}
            updateField={updateField}
          />
        )}

        {activeTab === "orders" && (
          <OrderSection
            customers={customers}
            products={products}
            orders={orders}
            onCreateOrder={handleCreateOrder}
            onCancelOrder={handleCancelOrder}
            onViewDetails={setSelectedOrder}
            loading={loading}
          />
        )}
      </div>

      <OrderDetailsModal
        selectedOrder={selectedOrder}
        setSelectedOrder={setSelectedOrder}
      />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
