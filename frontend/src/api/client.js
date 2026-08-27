const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function request(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url.toString());
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return body;
}

export const api = {
  home: {
    announcements: () => request("/home/announcements"),
    activities: () => request("/home/activities"),
    trivia: () => request("/home/trivia"),
    schedules: () => request("/home/schedules"),
  },
  legislative: {
    list: (type, params) => request(`/legislative/${type}`, params),
    detail: (type, id) => request(`/legislative/${type}/${id}`),
    downloadUrl: (type, id) => `${BASE_URL}/legislative/${type}/${id}/download`,
  },
  councilors: {
    current: (params) => request("/councilors/current", params),
    previous: (params) => request("/councilors/previous", params),
    profile: (id) => request(`/councilors/${id}`),
  },
  about: () => request("/about"),
};
