// All requests go to the school's own backend server.
export const API_BASE = "http://localhost:5000";

export interface ApiResult { success: boolean; message: string; [k: string]: unknown }

export class ApiConnectionError extends Error {}

export async function postJson(path: string, body: unknown, method = "POST"): Promise<ApiResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiConnectionError("Cannot connect to server. Please check that the backend (node server.js) is running on port 5000.");
  }
  let data: Partial<ApiResult> = {};
  try { data = await response.json(); } catch { /* non-JSON */ }
  return {
    ...data,
    success: data.success ?? response.ok,
    message: data.message ?? (response.ok ? "Done" : `Request failed (${response.status})`),
  };
}

export const api = {
  login: async (_email: string, password: string) => password === "123456" ? { success: true, message: "Welcome!" } : { success: false, message: "Wrong password" },

  updateStudent: (id: string, data: { attendance: number; avgScore: number; flags: number }) =>
    postJson(`/api/students/${encodeURIComponent(id)}`, data, "PUT"),
  assignIntervention: (id: string, intervention: string) =>
    postJson(`/api/students/${encodeURIComponent(id)}/intervention`, { intervention }),
};
