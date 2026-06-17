import React from "react";
import { PackagePlus } from "lucide-react";
import { PanelTitle, DataTable, StockBadge, RowActions } from "./Common";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function ProductSection({
  products,
  productForm,
  setProductForm,
  editingProductId,
  setEditingProductId,
  submitProduct,
  editProduct,
  deleteProduct,
  loading,
  initialProduct,
  updateField,
  productFilter,
  setProductFilter,
}) {
  const displayedProducts = productFilter === "low_stock"
    ? products.filter((p) => p.quantity_in_stock <= 5)
    : products;

  return (
    <section className="panel" id="products-panel">
      <PanelTitle icon={<PackagePlus />} title={editingProductId ? "Update Product" : "Add Product"} />
      
      {productFilter === "low_stock" && (
        <div className="notice warning" style={{ margin: "0 0 12px 0", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <span>Showing only Low Stock items (Stock ≤ 5)</span>
          <button 
            className="text-button" 
            onClick={() => setProductFilter(null)} 
            style={{ color: "var(--warning-text)", padding: "2px 8px" }}
            type="button"
          >
            Show All
          </button>
        </div>
      )}

      <form className="form-grid" onSubmit={submitProduct}>
        <label>
          Product name
          <input
            value={productForm.name}
            onChange={(event) => updateField(setProductForm, "name", event.target.value)}
            placeholder="e.g. Acme Widget"
            required
          />
        </label>
        <label>
          SKU/code
          <input
            value={productForm.sku}
            onChange={(event) => updateField(setProductForm, "sku", event.target.value)}
            placeholder="e.g. ACM-WID-01"
            required
          />
        </label>
        <label>
          Price
          <input
            min="0.01"
            step="0.01"
            type="number"
            value={productForm.price}
            onChange={(event) => updateField(setProductForm, "price", event.target.value)}
            placeholder="0.00"
            required
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
            placeholder="0"
            required
          />
        </label>
        <div style={{ display: "flex", gap: "8px", alignSelf: "end" }}>
          {editingProductId && (
            <button
              className="icon-button"
              type="button"
              onClick={() => {
                setEditingProductId(null);
                setProductForm(initialProduct);
              }}
              style={{ width: "auto", padding: "0 14px" }}
            >
              Cancel
            </button>
          )}
          <button className="primary" type="submit">
            {editingProductId ? "Save Product" : "Add Product"}
          </button>
        </div>
      </form>
      <DataTable
        emptyText={loading ? "Loading products..." : "No products yet."}
        columns={["Product", "SKU", "Price", "Stock", ""]}
        rows={displayedProducts.map((product) => [
          product.name,
          product.sku,
          currency.format(product.price),
          <StockBadge key="stock" value={product.quantity_in_stock} />,
          <RowActions
            key="actions"
            onEdit={() => editProduct(product)}
            onDelete={() => deleteProduct(product.id)}
          />,
        ])}
      />
    </section>
  );
}
