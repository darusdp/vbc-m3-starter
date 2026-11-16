import fs from "fs";
import path from "path";

export const LOCATIONS = ["Minneapolis", "Chicago", "Denver", "Austin"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const STATUSES = ["New", "In Progress", "Complete"];

export const CSV_COLUMNS = [
  "id",
  "created_at",
  "requester_name",
  "location",
  "description",
  "priority",
  "status",
];

// Parses CSV text into an array of rows (arrays of strings).
// Handles quoted fields with commas, escaped quotes ("") and CRLF line endings.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") {
        i++;
      }
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((value) => value.trim() !== ""));
}

function loadSeed() {
  const filePath = path.join(process.cwd(), "data", "seed-requests.csv");
  const text = fs.readFileSync(filePath, "utf8").replace(/^﻿/, "");
  const [header, ...lines] = parseCsv(text);

  const records = lines.map((values) => {
    const record = {};
    header.forEach((column, index) => {
      record[column.trim()] = (values[index] || "").trim();
    });
    return record;
  });

  // Oldest first, so ids increase over time.
  records.sort((a, b) => a.created_at.localeCompare(b.created_at));

  return records.map((record, index) => ({ id: index + 1, ...record }));
}

// Requests are kept in server memory, seeded from the CSV on first use.
// Stored on globalThis so the dev server's hot reload doesn't wipe them.
// They are lost whenever the server process restarts.
function getStore() {
  if (!globalThis.__morrowlaneStore) {
    const requests = loadSeed();
    globalThis.__morrowlaneStore = {
      requests,
      nextId: requests.length + 1,
    };
  }
  return globalThis.__morrowlaneStore;
}

function newestFirst(a, b) {
  const byDate = b.created_at.localeCompare(a.created_at);
  return byDate !== 0 ? byDate : b.id - a.id;
}

export function listRequests() {
  return [...getStore().requests].sort(newestFirst);
}

export function createRequest(fields) {
  const store = getStore();
  const request = {
    id: store.nextId++,
    created_at: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
    requester_name: fields.requester_name,
    location: fields.location,
    description: fields.description,
    priority: fields.priority,
    status: "New",
  };
  store.requests.push(request);
  return request;
}

export function updateRequestStatus(id, status) {
  const request = getStore().requests.find((r) => r.id === id);
  if (!request) {
    return null;
  }
  request.status = status;
  return request;
}

export function getSummary() {
  const requests = getStore().requests;
  const open = requests.filter((r) => r.status !== "Complete");

  let completedThisMonth = 0;
  if (requests.length > 0) {
    const latest = requests.reduce((a, b) =>
      b.created_at > a.created_at ? b : a
    );
    const month = latest.created_at.slice(0, 7); // "YYYY-MM"
    completedThisMonth = requests.filter(
      (r) => r.status === "Complete" && r.created_at.slice(0, 7) === month
    ).length;
  }

  return {
    open_requests: open.length,
    urgent_open: open.filter((r) => r.priority === "Urgent").length,
    completed_this_month: completedThisMonth,
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return '"' + text.replace(/"/g, '""') + '"';
  }
  return text;
}

export function toCsv(requests) {
  const lines = [CSV_COLUMNS.join(",")];
  for (const request of requests) {
    lines.push(CSV_COLUMNS.map((column) => csvEscape(request[column])).join(","));
  }
  return lines.join("\r\n") + "\r\n";
}

// Returns { error } or { value } with the cleaned-up fields.
export function validateNewRequest(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "The request body must be a JSON object." };
  }

  const clean = (value) => (typeof value === "string" ? value.trim() : "");
  const requester_name = clean(body.requester_name);
  const location = clean(body.location);
  const description = clean(body.description);
  const priority = clean(body.priority);

  if (!requester_name) {
    return { error: "Requester name is required." };
  }
  if (!location) {
    return { error: "Location is required." };
  }
  if (!LOCATIONS.includes(location)) {
    return { error: "Location must be Minneapolis, Chicago, Denver, or Austin." };
  }
  if (!description) {
    return { error: "Description is required." };
  }
  if (description.length > 500) {
    return {
      error: `Description must be 500 characters or fewer (it is ${description.length}).`,
    };
  }
  if (!priority) {
    return { error: "Priority is required." };
  }
  if (!PRIORITIES.includes(priority)) {
    return { error: "Priority must be Low, Medium, High, or Urgent." };
  }

  return { value: { requester_name, location, description, priority } };
}
