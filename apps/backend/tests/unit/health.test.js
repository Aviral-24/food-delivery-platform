import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app.js";
import {
  ORDER_STATUS,
  canTransitionOrder,
} from "../../src/constants/orderStatus.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../../src/utils/pagination.js";

describe("Day 1 Foundation Checks", () => {
  it("GET /health returns 200 with X-Request-Id header", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.headers["x-request-id"]).toBeTruthy();
  });

  it("validates order state machine transitions", () => {
    expect(
      canTransitionOrder(ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED),
    ).toBe(true);
    expect(
      canTransitionOrder(ORDER_STATUS.PENDING, ORDER_STATUS.DELIVERED),
    ).toBe(false);
  });

  it("computes pagination bounds safely", () => {
    const { page, limit, offset } = parsePagination({
      page: "2",
      limit: "500",
    });
    expect(page).toBe(2);
    expect(limit).toBe(100);
    expect(offset).toBe(100);

    const meta = buildPaginationMeta({ total: 250, page, limit });
    expect(meta.totalPages).toBe(3);
    expect(meta.hasNextPage).toBe(true);
  });
});
