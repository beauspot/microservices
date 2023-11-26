import request from "supertest";

import app from "../app";

describe("Test the app.ts file", () => {
  test("Testing Index Routes", async () => {
    const response = await request(app).get("/");
    expect(response.body).toEqual({
      message: "Welcome to the User-Micro-Service rest api application.",
    });
  }, 200000);
});
