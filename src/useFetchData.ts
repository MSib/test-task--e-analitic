import type { ApiResponse, Endpoint, EndpointDataMap } from '@/endpoints.ts'

/**
 * Fetches data from a given URL using the specified HTTP method and payload.
 * 
 * @param {string} url - The endpoint URL to fetch data from.
 * @param {'GET' | 'POST' | 'PUT' | 'DELETE'} [method='GET'] - The HTTP method to use for the request.
 * @param {FetchPayload} [payload=null] - The payload to send with the request.
 *   - `dateFrom` and `dateTo` should be in `YYYY-MM-DD` format for dates, or `YYYY-MM-DD HH:mm:ss` for date-times.
 * @returns {Promise<FetchData>} A promise that resolves to an object containing the response data or an error message.
 */
async function fetchData<E extends Endpoint>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  payload: FetchPayload = null
): Promise<FetchData<ApiResponse<EndpointDataMap[E]>>> {
  const options: FetchOptions = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }
  if (method === 'GET' && payload) {
    const correctedPayload: Record<string, string> = Object.fromEntries(
      Object.entries(payload)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, typeof v === 'string' ? v : String(v)]) as [string, string][]
    );
    const query = new URLSearchParams(correctedPayload).toString();
    url = `${url}?${query}`;
  } else if (method !== 'DELETE' && payload) {
    options.body = JSON.stringify(payload);
  }
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      return { error: `HTTP error ${response.status}` };
    }
    const data = await response.json();
    return { data };
  } catch (e) {
    const errorMessage = (e instanceof Error) ? e.message : String(e);
    return { error: errorMessage };
  }
}

type FetchOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers: Record<string, string>
  body?: string
}

type FetchPayload = null | {
  dateFrom: string
  dateTo?: string
  page: number
  key: string
  limit: number
}

type FetchData<T = unknown> = {
  data?: T
  error?: string
}

export { fetchData }
export type { FetchPayload, FetchData }
