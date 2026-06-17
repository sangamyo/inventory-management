import React, { useState, useMemo } from "react";
import { ShoppingCart, Trash2, Plus, AlertCircle } from "lucide-react";
import { PanelTitle, DataTable, IconOnly } from "./Common";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function OrderSection({
  customers,
  products,
  orders,
  onCreateOrder,
  onCancelOrder,
  onViewDetails,
  loading,
}) {
  const [customerId, setCustomerId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantityToAdd, setQuantityToAdd] = useState("1");
  const [draftItems, setDraftItems] = useState([]);
  const [errorNotice, setErrorNotice] = useState(null);

  // Find product detail for adding
  const activeProduct = useMemo(() => {
    return products.find((p) => p.id === Number(selectedProductId));
  }, [selectedProductId, products]);

  // Handle adding an item to the draft order
  function handleAddItem(event) {
    event.preventDefault();
    setErrorNotice(null);

    if (!selectedProductId) {
      setErrorNotice("Please select a product.");
      return;
    }

    const qty = Number(quantityToAdd);
    if (isNaN(qty) || qty <= 0) {
      setErrorNotice("Quantity must be a positive integer.");
      return;
    }

    if (!activeProduct) {
      setErrorNotice("Selected product not found.");
      return;
    }

    // Check stock limit
    if (activeProduct.quantity_in_stock < qty) {
      setErrorNotice(`Insufficient stock. Only ${activeProduct.quantity_in_stock} available.`);
      return;
    }

    const existingIndex = draftItems.findIndex((item) => item.product_id === activeProduct.id);
    if (existingIndex > -1) {
      const newQty = draftItems[existingIndex].quantity + qty;
      if (activeProduct.quantity_in_stock < newQty) {
        setErrorNotice(`Cannot add. Total quantity in draft (${newQty}) exceeds stock (${activeProduct.quantity_in_stock}).`);
        return;
      }

      const updated = [...draftItems];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        subtotal: newQty * Number(activeProduct.price),
      };
      setDraftItems(updated);
    } else {
      setDraftItems([
        ...draftItems,
        {
          product_id: activeProduct.id,
          name: activeProduct.name,
          price: Number(activeProduct.price),
          quantity: qty,
          subtotal: qty * Number(activeProduct.price),
        },
      ]);
    }

    // Reset item add inputs
    setQuantityToAdd("1");
  }

  // Remove item from draft
  function handleRemoveItem(productId) {
    setDraftItems(draftItems.filter((item) => item.product_id !== productId));
  }

  // Compute draft total
  const draftTotal = useMemo(() => {
    return draftItems.reduce((acc, item) => acc + item.subtotal, 0);
  }, [draftItems]);

  // Submit the completed order
  async function handleSubmitOrder(event) {
    event.preventDefault();
    setErrorNotice(null);

    if (!customerId) {
      setErrorNotice("Please select a customer.");
      return;
    }

    if (draftItems.length === 0) {
      setErrorNotice("Please add at least one product to the order.");
      return;
    }

    const payload = {
      customer_id: Number(customerId),
      items: draftItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      })),
    };

    try {
      await onCreateOrder(payload);
      // Reset all order creation state upon success
      setCustomerId("");
      setDraftItems([]);
      setSelectedProductId("");
      setQuantityToAdd("1");
    } catch (err) {
      setErrorNotice(err.message || "Failed to create order.");
    }
  }

  return (
    <section className="panel panel-wide" id="orders-panel">
      <PanelTitle icon={<ShoppingCart />} title="Orders" />

      <div className="order-workspace">
        {/* Left Side: Order Composition Form */}
        <div className="order-compose-form">
          <h3 style={{ fontSize: "1rem", color: "var(--text-main)", borderBottom: "1px solid var(--border)", paddingBottom: "8px", margin: 0, fontWeight: 700 }}>
            Create New Order
          </h3>

          {errorNotice && (
            <div className="notice error" style={{ margin: 0 }}>
              <AlertCircle size={18} />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* Customer Selection */}
          <label>
            Customer
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
              <option value="">Select customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.email})
                </option>
              ))}
            </select>
          </label>

          {/* Item Adder Inputs */}
          <div className="draft-item-adder">
            <h4 style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 700 }}>Add Products</h4>
            <div className="draft-item-inputs">
              <label style={{ flex: 2 }}>
                Product
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.quantity_in_stock}) - {currency.format(p.price)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ flex: 1 }}>
                Qty
                <input
                  min="1"
                  type="number"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(e.target.value)}
                />
              </label>

              <button
                className="primary"
                onClick={handleAddItem}
                title="Add product to draft"
                style={{ height: "42px", width: "42px", padding: 0, minHeight: "42px" }}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Finalize order button */}
          <div className="order-actions-bar">
            <div>
              <span style={{ fontSize: "0.8rem", color: "var(--text-light)", fontWeight: 600 }}>Order Estimate</span>
              <div className="estimate" style={{ marginTop: "4px" }}>
                {currency.format(draftTotal)}
              </div>
            </div>
            <button
              className="primary"
              onClick={handleSubmitOrder}
              disabled={!customerId || draftItems.length === 0}
              style={{ height: "42px", minWidth: "150px" }}
            >
              Create Order ({draftItems.length} {draftItems.length === 1 ? "item" : "items"})
            </button>
          </div>
        </div>

        {/* Right Side: Draft Order Items Cart */}
        <div className="order-draft-cart">
          <h3 style={{ fontSize: "0.95rem", color: "var(--text-main)", margin: "0 0 12px 0", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
            <span>Draft Order Items</span>
            {draftItems.length > 0 && (
              <button
                onClick={() => setDraftItems([])}
                style={{ background: "none", border: "none", color: "var(--error)", fontSize: "0.8rem", cursor: "pointer", fontWeight: "700" }}
              >
                Clear All
              </button>
            )}
          </h3>

          <DataTable
            emptyText="No items in draft. Add products on the left."
            columns={["Product", "Qty", "Price", "Total", ""]}
            rows={draftItems.map((item) => [
              item.name,
              item.quantity,
              currency.format(item.price),
              currency.format(item.subtotal),
              <IconOnly
                key="remove"
                title="Remove item"
                onClick={() => handleRemoveItem(item.product_id)}
                icon={<Trash2 size={16} />}
              />,
            ])}
          />
        </div>
      </div>

      {/* Orders History Table */}
      <h3 style={{ fontSize: "1.1rem", color: "var(--text-main)", borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "24px", marginBottom: "12px", fontWeight: 800 }}>
        Order History
      </h3>
      <DataTable
        emptyText={loading ? "Loading orders..." : "No orders yet."}
        columns={["Order ID", "Customer", "Items Count", "Total Amount", "Actions"]}
        rows={orders.map((order) => [
          `#${order.id}`,
          order.customer.full_name,
          `${order.items.reduce((acc, item) => acc + item.quantity, 0)} items (${order.items.length} unique)`,
          currency.format(order.total_amount),
          <div className="row-actions" key="actions">
            <button className="text-button" onClick={() => onViewDetails(order)} type="button">
              Details
            </button>
            <IconOnly title="Cancel order" onClick={() => onCancelOrder(order.id)} icon={<Trash2 size={16} />} />
          </div>,
        ])}
      />
    </section>
  );
}
