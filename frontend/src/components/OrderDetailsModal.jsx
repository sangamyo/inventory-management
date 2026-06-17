import React from "react";
import { X } from "lucide-react";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function OrderDetailsModal({ selectedOrder, setSelectedOrder }) {
  if (!selectedOrder) return null;

  return (
    <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
      <section className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
          <h2 style={{ fontSize: "1.4rem", margin: 0, fontWeight: 800, color: "var(--text-main)" }}>
            Order #{selectedOrder.id}
          </h2>
          <button 
            className="icon-button small" 
            onClick={() => setSelectedOrder(null)} 
            type="button"
            style={{ padding: "8px" }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ marginBottom: "20px", color: "var(--text-muted)", fontSize: "0.95rem" }}>
          <div style={{ marginBottom: "6px" }}>
            <strong style={{ color: "var(--text-main)" }}>Customer:</strong> {selectedOrder.customer.full_name}
          </div>
          <div style={{ marginBottom: "6px" }}>
            <strong style={{ color: "var(--text-main)" }}>Email:</strong> {selectedOrder.customer.email}
          </div>
          {selectedOrder.customer.phone_number && (
            <div>
              <strong style={{ color: "var(--text-main)" }}>Phone:</strong> {selectedOrder.customer.phone_number}
            </div>
          )}
        </div>
        
        <div className="table-wrap" style={{ maxHeight: "250px", overflowY: "auto", marginBottom: "20px" }}>
          <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                <th style={{ padding: "12px", borderBottom: "1px solid var(--border)", color: "var(--text-main)" }}>Product</th>
                <th style={{ padding: "12px", borderBottom: "1px solid var(--border)", textAlign: "right", color: "var(--text-main)" }}>Quantity</th>
                <th style={{ padding: "12px", borderBottom: "1px solid var(--border)", textAlign: "right", color: "var(--text-main)" }}>Price</th>
                <th style={{ padding: "12px", borderBottom: "1px solid var(--border)", textAlign: "right", color: "var(--text-main)" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "12px", color: "var(--text-muted)" }}>{item.product.name}</td>
                  <td style={{ padding: "12px", textAlign: "right", color: "var(--text-muted)" }}>{item.quantity}</td>
                  <td style={{ padding: "12px", textAlign: "right", color: "var(--text-muted)" }}>{currency.format(item.unit_price)}</td>
                  <td style={{ padding: "12px", textAlign: "right", color: "var(--text-main)", fontWeight: "600" }}>{currency.format(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "12px" }}>
          <span style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>
            Date: {new Date(selectedOrder.created_at).toLocaleString()}
          </span>
          <span style={{ fontSize: "1.25rem", color: "var(--primary-light)", fontWeight: "800" }}>
            Total: {currency.format(selectedOrder.total_amount)}
          </span>
        </div>
      </section>
    </div>
  );
}
