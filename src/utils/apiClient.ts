/**
 * Robust API Client for Eagle House HOD Portal
 * Safely handles JSON responses, Nginx warming pages, connection timeouts, and server errors.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function safePost<T = any>(
  url: string,
  payload: any,
  timeoutMs: number = 60000
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      if (
        text.includes("<!doctype") ||
        text.includes("<html") ||
        text.includes("Starting Server") ||
        response.status === 502 ||
        response.status === 503 ||
        response.status === 504
      ) {
        return {
          success: false,
          error: "The HOD AI Engine is warming up. Please retry in a few seconds.",
        };
      }
      if (response.status === 413) {
        return {
          success: false,
          error: "The uploaded file is too large. Please use a file smaller than 25MB or paste text directly.",
        };
      }
      return {
        success: false,
        error: text || `Server error (Status ${response.status})`,
      };
    }

    const json = await response.json();
    if (!response.ok || json.success === false) {
      return {
        success: false,
        error: json.error || `Server returned error status ${response.status}`,
        data: json,
      };
    }

    return {
      success: true,
      data: json,
    };
  } catch (err: any) {
    if (err.name === "AbortError") {
      return {
        success: false,
        error: "The request timed out. Please try again or reduce the size of uploaded files.",
      };
    }
    return {
      success: false,
      error: err.message || "Failed to communicate with the HOD portal server.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}


export async function safePut<T = any>(
  url: string,
  payload: any,
  timeoutMs: number = 30000
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") || "";
    const json: any = contentType.includes("application/json") ? await response.json() : null;
    if (!response.ok || json?.success === false) {
      return { success: false, error: json?.error || `Server returned error status ${response.status}`, data: json };
    }
    return { success: true, data: json };
  } catch (err: any) {
    if (err.name === "AbortError") return { success: false, error: "The save request timed out. Please try again." };
    return { success: false, error: err.message || "Failed to save changes." };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function safeGet<T = any>(url: string, timeoutMs: number = 15000): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    const contentType = response.headers.get("content-type") || "";
    const json: any = contentType.includes("application/json") ? await response.json() : null;
    if (!response.ok) return { success: false, error: json?.error || `Server returned error status ${response.status}`, data: json };
    return { success: true, data: json };
  } catch (err: any) {
    if (err.name === "AbortError") return { success: false, error: "The request timed out." };
    return { success: false, error: err.message || "Failed to communicate with the server." };
  } finally {
    clearTimeout(timeoutId);
  }
}
