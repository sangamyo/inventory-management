import React from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { PanelTitle, DataTable, IconOnly } from "./Common";

export function CustomerSection({
  customers,
  customerForm,
  setCustomerForm,
  submitCustomer,
  deleteCustomer,
  loading,
  updateField,
}) {
  return (
    <section className="panel" id="customers-panel">
      <PanelTitle icon={<UserPlus />} title="Customers" />
      <form className="form-grid" onSubmit={submitCustomer}>
        <label>
          Full name
          <input
            value={customerForm.full_name}
            onChange={(event) => updateField(setCustomerForm, "full_name", event.target.value)}
            placeholder="e.g. John Doe"
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={customerForm.email}
            onChange={(event) => updateField(setCustomerForm, "email", event.target.value)}
            placeholder="e.g. john@example.com"
            required
          />
        </label>
        <label className="wide">
          Phone number
          <input
            value={customerForm.phone_number}
            onChange={(event) => updateField(setCustomerForm, "phone_number", event.target.value)}
            placeholder="e.g. +1 555-0199"
            required
          />
        </label>
        <button className="primary" type="submit">
          Add Customer
        </button>
      </form>
      <DataTable
        emptyText={loading ? "Loading customers..." : "No customers yet."}
        columns={["Name", "Email", "Phone", ""]}
        rows={customers.map((customer) => [
          customer.full_name,
          customer.email,
          customer.phone_number,
          <IconOnly
            key="delete"
            title="Delete customer"
            onClick={() => deleteCustomer(customer.id)}
            icon={<Trash2 size={16} />}
          />,
        ])}
      />
    </section>
  );
}
