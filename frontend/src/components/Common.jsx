import React from "react";
import { AlertCircle, Pencil, Trash2 } from "lucide-react";

export function Metric({ icon, label, value, onClick, active }) {
  return (
    <article className={`metric ${active ? "active" : ""}`} onClick={onClick}>
      <div className="metric-icon">{React.cloneElement(icon, { size: 20 })}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

export function PanelTitle({ icon, title }) {
  return (
    <div className="panel-title">
      {React.cloneElement(icon, { size: 20 })}
      <h2>{title}</h2>
    </div>
  );
}

export function StockBadge({ value }) {
  const status = value <= 5 ? "low" : "ok";
  return <span className={`stock ${status}`}>{value}</span>;
}

export function IconOnly({ icon, title, onClick, disabled = false, type = "button" }) {
  return (
    <button
      className="icon-button small"
      onClick={onClick}
      title={title}
      type={type}
      disabled={disabled}
    >
      {icon}
    </button>
  );
}

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="row-actions">
      <IconOnly title="Edit product" onClick={onEdit} icon={<Pencil size={16} />} />
      <IconOnly title="Delete product" onClick={onDelete} icon={<Trash2 size={16} />} />
    </div>
  );
}

export function DataTable({ columns, rows, emptyText }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="empty" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
