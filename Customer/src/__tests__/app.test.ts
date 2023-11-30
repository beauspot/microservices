import request from "supertest";
import AppConfig from "../api/helpers/config/AppConfig";

const API_PREFIX = AppConfig.API_PREFIX;

import app from "../app";

describe("Test the app.ts file", () => {
  test("Testing Index Routes", async () => {
    const response = await request(app).get(`/${API_PREFIX}`);
    expect(response.body).toEqual({
      message: "Welcome to the User-Micro-Service rest api application.",
    });
  }, 200000);
});
