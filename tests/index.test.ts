import { describe, it, expect } from "vitest";
import {
  SubscriptionManager,
  SubscriptionTier,
  ProductCatalog,
} from "../src/index.js";

describe("index exports", () => {
  it("exports SubscriptionManager class", () => {
    expect(SubscriptionManager).toBeDefined();
    expect(typeof SubscriptionManager).toBe("function");
  });

  it("exports SubscriptionTier enum", () => {
    expect(SubscriptionTier.FREE).toBe("free");
    expect(SubscriptionTier.BASIC).toBe("basic");
    expect(SubscriptionTier.PREMIUM).toBe("premium");
    expect(SubscriptionTier.ENTERPRISE).toBe("enterprise");
  });

  it("exports ProductCatalog class", () => {
    expect(ProductCatalog).toBeDefined();
    expect(typeof ProductCatalog).toBe("function");
  });

  it("can instantiate SubscriptionManager", () => {
    const manager = new SubscriptionManager();
    expect(manager).toBeInstanceOf(SubscriptionManager);
  });

  it("can instantiate ProductCatalog", () => {
    const catalog = new ProductCatalog();
    expect(catalog).toBeInstanceOf(ProductCatalog);
  });
});
