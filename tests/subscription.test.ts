import { describe, it, expect } from "vitest";
import { SubscriptionManager, SubscriptionTier } from "../src/subscription.js";

describe("SubscriptionManager", () => {
  it("should create a free subscription by default", () => {
    const mgr = new SubscriptionManager();
    const sub = mgr.create("CUST-001");
    expect(sub.tier).toBe(SubscriptionTier.FREE);
    expect(sub.monthlyPrice).toBe(0);
    expect(sub.active).toBe(true);
  });

  it("should create a subscription with a specified tier", () => {
    const mgr = new SubscriptionManager();
    const sub = mgr.create("CUST-001", SubscriptionTier.PREMIUM);
    expect(sub.tier).toBe(SubscriptionTier.PREMIUM);
    expect(sub.monthlyPrice).toBe(49.99);
  });

  it("should upgrade a subscription tier", () => {
    const mgr = new SubscriptionManager();
    const sub = mgr.create("CUST-001", SubscriptionTier.BASIC);
    const upgraded = mgr.changeTier(sub.id, SubscriptionTier.PREMIUM);
    expect(upgraded.tier).toBe(SubscriptionTier.PREMIUM);
    expect(upgraded.monthlyPrice).toBe(49.99);
  });

  it("should cancel a subscription", () => {
    const mgr = new SubscriptionManager();
    const sub = mgr.create("CUST-001");
    const cancelled = mgr.cancel(sub.id);
    expect(cancelled.active).toBe(false);
    expect(cancelled.endDate).not.toBeNull();
  });

  it("should throw when changing tier of inactive subscription", () => {
    const mgr = new SubscriptionManager();
    const sub = mgr.create("CUST-001");
    mgr.cancel(sub.id);
    expect(() => mgr.changeTier(sub.id, SubscriptionTier.PREMIUM)).toThrow("not active");
  });

  it("should track active count correctly", () => {
    const mgr = new SubscriptionManager();
    mgr.create("CUST-001");
    mgr.create("CUST-002");
    const sub3 = mgr.create("CUST-003");
    mgr.cancel(sub3.id);
    expect(mgr.activeCount).toBe(2);
  });
});
