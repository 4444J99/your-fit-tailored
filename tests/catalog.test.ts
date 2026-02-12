import { describe, it, expect } from "vitest";
import { ProductCatalog } from "../src/catalog.js";
import type { Product } from "../src/catalog.js";

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "P001",
  name: "Resistance Band Set",
  category: "equipment",
  price: 29.99,
  available: true,
  tags: ["strength", "home"],
  description: "Adjustable resistance band set for home workouts",
  ...overrides,
});

describe("ProductCatalog", () => {
  it("should add and retrieve a product", () => {
    const catalog = new ProductCatalog();
    catalog.addProduct(makeProduct());
    const product = catalog.getProduct("P001");
    expect(product.name).toBe("Resistance Band Set");
  });

  it("should reject duplicate product IDs", () => {
    const catalog = new ProductCatalog();
    catalog.addProduct(makeProduct());
    expect(() => catalog.addProduct(makeProduct())).toThrow("already exists");
  });

  it("should search by name", () => {
    const catalog = new ProductCatalog();
    catalog.addProduct(makeProduct());
    catalog.addProduct(makeProduct({ id: "P002", name: "Yoga Mat", tags: ["flexibility"] }));
    const results = catalog.search("resistance");
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("P001");
  });

  it("should filter by category and price range", () => {
    const catalog = new ProductCatalog();
    catalog.addProduct(makeProduct({ id: "P001", category: "equipment", price: 29.99 }));
    catalog.addProduct(makeProduct({ id: "P002", category: "apparel", price: 59.99 }));
    catalog.addProduct(makeProduct({ id: "P003", category: "equipment", price: 99.99 }));
    const results = catalog.filter({ category: "equipment", maxPrice: 50 });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe("P001");
  });

  it("should return unique categories", () => {
    const catalog = new ProductCatalog();
    catalog.addProduct(makeProduct({ id: "P001", category: "equipment" }));
    catalog.addProduct(makeProduct({ id: "P002", category: "apparel" }));
    catalog.addProduct(makeProduct({ id: "P003", category: "equipment" }));
    expect(catalog.categories).toEqual(["apparel", "equipment"]);
  });
});
