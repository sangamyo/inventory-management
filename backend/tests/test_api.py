import os
import tempfile

os.environ["DATABASE_URL"] = f"sqlite:///{tempfile.NamedTemporaryFile(suffix='.db').name}"

from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app


client = TestClient(app)


def setup_function() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def create_product(name="Widget", sku="WID-001", price="12.50", quantity=10):
    return client.post(
        "/products",
        json={"name": name, "sku": sku, "price": price, "quantity_in_stock": quantity},
    )


def create_customer(email="buyer@example.com"):
    return client.post(
        "/customers",
        json={"full_name": "Buyer One", "email": email, "phone_number": "+15551234567"},
    )


def test_product_crud_and_unique_sku():
    response = create_product()
    assert response.status_code == 201
    product_id = response.json()["id"]

    duplicate = create_product(name="Other")
    assert duplicate.status_code == 409

    update = client.put(f"/products/{product_id}", json={"quantity_in_stock": 6, "price": "15.00"})
    assert update.status_code == 200
    assert update.json()["quantity_in_stock"] == 6

    listing = client.get("/products")
    assert listing.status_code == 200
    assert len(listing.json()) == 1


def test_customer_unique_email_and_delete():
    customer = create_customer()
    assert customer.status_code == 201
    duplicate = create_customer()
    assert duplicate.status_code == 409

    delete = client.delete(f"/customers/{customer.json()['id']}")
    assert delete.status_code == 204


def test_order_reduces_inventory_and_calculates_total():
    product = create_product(price="9.99", quantity=4).json()
    customer = create_customer().json()

    order = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 3}]},
    )

    assert order.status_code == 201
    assert order.json()["total_amount"] == "29.97"
    refreshed_product = client.get(f"/products/{product['id']}").json()
    assert refreshed_product["quantity_in_stock"] == 1


def test_order_rejects_insufficient_inventory():
    product = create_product(quantity=1).json()
    customer = create_customer().json()

    order = client.post(
        "/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 2}]},
    )

    assert order.status_code == 409
    refreshed_product = client.get(f"/products/{product['id']}").json()
    assert refreshed_product["quantity_in_stock"] == 1


def test_dashboard_counts_low_stock():
    create_product(quantity=5)
    create_customer()
    summary = client.get("/dashboard")
    assert summary.status_code == 200
    assert summary.json() == {
        "total_products": 1,
        "total_customers": 1,
        "total_orders": 0,
        "low_stock_products": 1,
    }
