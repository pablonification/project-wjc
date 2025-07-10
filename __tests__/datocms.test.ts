process.env.DATOCMS_READONLY_TOKEN = "dummy";

const mockRequest = jest.fn(() => Promise.resolve({ hello: "world" }));

jest.mock("graphql-request", () => {
  return {
    GraphQLClient: jest.fn().mockImplementation(() => ({ request: mockRequest })),
  };
});

import { datoRequest } from "../lib/datocms";

describe("datoRequest", () => {
  it("forwards query to GraphQLClient", async () => {
    const query = "query MyQuery { field }";
    const result = await datoRequest(query);
    expect(mockRequest).toHaveBeenCalledWith(query, undefined);
    expect(result).toEqual({ hello: "world" });
  });
});