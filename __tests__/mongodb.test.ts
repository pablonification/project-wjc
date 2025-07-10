process.env.MONGODB_URI = "mongodb://localhost:27017/test";

jest.mock("mongoose", () => {
  return {
    connect: jest.fn(() => Promise.resolve("mock-conn")),
  };
});

import { connectMongo } from "../lib/mongodb";

describe("connectMongo", () => {
  it("should connect once and cache the connection", async () => {
    const conn1 = await connectMongo();
    const conn2 = await connectMongo();
    expect(conn1).toBe("mock-conn");
    expect(conn2).toBe("mock-conn");
    const mongoose = require("mongoose");
    expect(mongoose.connect).toHaveBeenCalledTimes(1);
  });
});