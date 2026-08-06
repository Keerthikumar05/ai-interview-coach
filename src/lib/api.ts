/**
 * Safe JSON reading for API responses.
 *
 * If the Express API is not reachable (e.g. a static-only host that serves
 * index.html for every path), the response body is HTML and `res.json()`
 * throws `Unexpected token '<'`. This helper turns that into a clear error.
 */
export async function readJson(res: Response): Promise<any> {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!contentType.includes("application/json")) {
    const looksLikeHtml = text.trim().startsWith("<");
    throw new Error(
      looksLikeHtml
        ? `The API endpoint ${res.url || ""} returned an HTML page instead of JSON. The backend server (npm run dev) is not handling /api requests on this origin.`
        : `Unexpected non-JSON response (${res.status}) from ${res.url || "the API"}.`
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Malformed JSON response (${res.status}) from ${res.url || "the API"}.`);
  }
}

/** fetch + readJson in one call. Always uses a relative /api/... path. */
export async function apiFetch(input: string, init?: RequestInit): Promise<any> {
  const res = await fetch(input, init);
  return readJson(res);
}
