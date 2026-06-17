import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  ClipboardList,
  PackagePlus,
  Pencil,
  RefreshCw,
  ShoppingCart,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { api } from "./api";
import "./styles.css";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

const initialProduct = { name: "", sku: "", price: "", quantity_in_stock: "" };
const initialCustomer = { full_name: "", email: "", phone_number: "" };
const initialOrder = { customer_id: "", product_id: "", quantity: "" };

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
  const [orderForm, setOrderForm] = useState(initialOrder);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === Number(orderForm.product_id)),
    [orderForm.product_id, products],
  );
  const orderEstimate = selectedProduct && orderForm.quantity ? selectedProduct.price * Number(orderForm.quantity) : 0;

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

  async function submitOrder(event) {
    event.preventDefault();
    if (!orderForm.customer_id || !orderForm.product_id || Number(orderForm.quantity) <= 0) {
      return showNotice("Choose a customer, product, and positive quantity.", "error");
    }
    try {
      await api.orders.create({
        customer_id: Number(orderForm.customer_id),
        items: [{ product_id: Number(orderForm.product_id), quantity: Number(orderForm.quantity) }],
      });
      setOrderForm(initialOrder);
      showNotice("Order created and inventory updated.");
      await loadAll();
    } catch (error) {
      showNotice(error.message, "error");
    }
  }

  async function deleteOrder(orderId) {
    try {
      await api.orders.delete(orderId);
      showNotice("Order canceled and stock restored.");
      await loadAll();
    } catch (error) {
      showNotice(error.message, "error");
    }
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
        <Metric icon={<Boxes />} label="Products" value={summary.total_products} />
        <Metric icon={<Users />} label="Customers" value={summary.total_customers} />
        <Metric icon={<ClipboardList />} label="Orders" value={summary.total_orders} />
        <Metric icon={<AlertCircle />} label="Low Stock" value={summary.low_stock_products} />
      </section>

      <div className="workspace">
        <section className="panel">
          <PanelTitle icon={<PackagePlus />} title={editingProductId ? "Update Product" : "Add Product"} />
          <form className="form-grid" onSubmit={submitProduct}>
            <label>
              Product name
              <input value={productForm.name} onChange={(event) => updateField(setProductForm, "name", event.target.value)} />
            </label>
            <label>
              SKU/code
              <input value={productForm.sku} onChange={(event) => updateField(setProductForm, "sku", event.target.value)} />
            </label>
            <label>
              Price
              <input
                min="0.01"
                step="0.01"
                type="number"
                value={productForm.price}
                onChange={(event) => updateField(setProductForm, "price", event.target.value)}
              />
            </label>
            <label>
              Stock quantity
              <input
                min="0"
                step="1"
                type="number"
                value={productForm.quantity_in_stock}
                onChange={(event) => updateField(setProductForm, "quantity_in_stock", event.target.value)}
              />
            </label>
            <button className="primary" type="submit">{editingProductId ? "Save Product" : "Add Product"}</button>
          </form>
          <DataTable
            emptyText={loading ? "Loading products..." : "No products yet."}
            columns={["Product", "SKU", "Price", "Stock", ""]}
            rows={products.map((product) => [
              product.name,
              product.sku,
              currency.format(product.price),
              <StockBadge key="stock" value={product.quantity_in_stock} />,
              <RowActions key="actions" onEdit={() => editProduct(product)} onDelete={() => deleteProduct(product.id)} />,
            ])}
          />
        </section>

        <section className="panel">
          <PanelTitle icon={<UserPlus />} title="Customers" />
          <form className="form-grid" onSubmit={submitCustomer}>
            <label>
              Full name
              <input value={customerForm.full_name} onChange={(event) => updateField(setCustomerForm, "full_name", event.target.value)} />
            </label>
            <label>
              Email
              <input type="email" value={customerForm.email} onChange={(event) => updateField(setCustomerForm, "email", event.target.value)} />
            </label>
            <label className="wide">
              Phone number
              <input value={customerForm.phone_number} onChange={(event) => updateField(setCustomerForm, "phone_number", event.target.value)} />
            </label>
            <button className="primary" type="submit">Add Customer</button>
          </form>
          <DataTable
            emptyText={loading ? "Loading customers..." : "No customers yet."}
            columns={["Name", "Email", "Phone", ""]}
            rows={customers.map((customer) => [
              customer.full_name,
              customer.email,
              customer.phone_number,
              <IconOnly key="delete" title="Delete customer" onClick={() => deleteCustomer(customer.id)} icon={<Trash2 size={16} />} />,
            ])}
          />
        </section>

        <section className="panel panel-wide">
          <PanelTitle icon={<ShoppingCart />} title="Orders" />
          <form className="form-grid order-form" onSubmit={submitOrder}>
            <label>
              Customer
              <select value={orderForm.customer_id} onChange={(event) => updateField(setOrderForm, "customer_id", event.target.value)}>
                <option value="">Select customer</option>
                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.full_name}</option>)}
              </select>
            </label>
            <label>
              Order product
              <select value={orderForm.product_id} onChange={(event) => updateField(setOrderForm, "product_id", event.target.value)}>
                <option value="">Select product</option>
                {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.quantity_in_stock})</option>)}
              </select>
            </label>
            <label>
              Order quantity
              <input
                min="1"
                step="1"
                type="number"
                value={orderForm.quantity}
                onChange={(event) => updateField(setOrderForm, "quantity", event.target.value)}
              />
            </label>
            <div className="estimate">{currency.format(orderEstimate || 0)}</div>
            <button className="primary" type="submit">Create Order</button>
          </form>
          <DataTable
            emptyText={loading ? "Loading orders..." : "No orders yet."}
            columns={["Order", "Customer", "Items", "Total", ""]}
            rows={orders.map((order) => [
              `#${order.id}`,
              order.customer.full_name,
              order.items.map((item) => `${item.product.name} x ${item.quantity}`).join(", "),
              currency.format(order.total_amount),
              <div className="row-actions" key="actions">
                <button className="text-button" onClick={() => setSelectedOrder(order)} type="button">Details</button>
                <IconOnly title="Cancel order" onClick={() => deleteOrder(order.id)} icon={<Trash2 size={16} />} />
              </div>,
            ])}
          />
        </section>
      </div>

      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <section className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder.id}</h2>
              <button className="text-button" onClick={() => setSelectedOrder(null)} type="button">Close</button>
            </div>
            <p>{selectedOrder.customer.full_name} · {selectedOrder.customer.email}</p>
            <ul>
              {selectedOrder.items.map((item) => (
                <li key={item.id}>
                  {item.product.name} · {item.quantity} x {currency.format(item.unit_price)} = {currency.format(item.line_total)}
                </li>
              ))}
            </ul>
            <strong>Total {currency.format(selectedOrder.total_amount)}</strong>
          </section>
        </div>
      )}
    </main>
  );
}

function Metric({ icon, label, value }) {
  return (
    <article className="metric">
      <div className="metric-icon">{React.cloneElement(icon, { size: 20 })}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function PanelTitle({ icon, title }) {
  return (
    <div className="panel-title">
      {React.cloneElement(icon, { size: 20 })}
      <h2>{title}</h2>
    </div>
  );
}

function StockBadge({ value }) {
  const status = value <= 5 ? "low" : "ok";
  return <span className={`stock ${status}`}>{value}</span>;
}

function IconOnly({ icon, title, onClick }) {
  return (
    <button className="icon-button small" onClick={onClick} title={title} type="button">
      {icon}
    </button>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div className="row-actions">
      <IconOnly title="Edit product" onClick={onEdit} icon={<Pencil size={16} />} />
      <IconOnly title="Delete product" onClick={onDelete} icon={<Trash2 size={16} />} />
    </div>
  );
}

function DataTable({ columns, rows, emptyText }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="empty" colSpan={columns.length}>{emptyText}</td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
