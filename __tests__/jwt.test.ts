process.env.JWT_SECRET = "testsecret";
import { signJwt, verifyJwt } from "../lib/jwt";

describe("jwt helper", () => {
  it("should sign and verify payload", () => {
    const token = signJwt({ foo: "bar" }, "1h");
    const decoded = verifyJwt<{ foo: string }>(token);
    expect(decoded.foo).toBe("bar");
  });

  it("should throw on invalid token", () => {
    expect(() => verifyJwt("invalid.token.here")).toThrow();
  });
});