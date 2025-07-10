import { GraphQLClient } from "graphql-request";

const token = process.env.DATOCMS_READONLY_TOKEN;

if (!token) {
  throw new Error("DATOCMS_READONLY_TOKEN is not set in environment variables");
}

export const datocmsClient = new GraphQLClient("https://graphql.datocms.com/", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export async function datoRequest<R>(query: string, variables?: Record<string, any>): Promise<R> {
  return datocmsClient.request<R>(query, variables);
}