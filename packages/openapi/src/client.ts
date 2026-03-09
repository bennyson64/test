import createClient from "openapi-fetch";
import type { paths } from "./types";
export const apiClient = createClient<paths>({
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.EXPO_PUBLIC_API_URL ??
    "http://localhost:3001",
});
