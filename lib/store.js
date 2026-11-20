import { getSupabase } from "./supabase";

export const LOCATIONS = ["Minneapolis", "Chicago", "Denver", "Austin"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const STATUSES = ["New", "In Progress", "Complete"];

const TABLE = "entries";

export const CSV_COLUMNS = [
  "id",
  "created_at",
  "requester_name",
  "location",
  "description",
  "priority",
  "status",
];

const SELECT_COLUMNS = CSV_COLUMNS.join(",");

// Postgres returns timestamps like "2026-08-28T17:45:00+00:00".
// Normalize to the contract's "2026-08-28T17:45:00Z" format.
function toRequest(row) {
  const date = new Date(row.created_at);
  return {
    ...row,
    id: Number(row.id),
    created_at: isNaN(date.getTime())
      ? row.created_at
      : date.toISOString().replace(/\.\d{3}Z$/, "Z"),
  };
}

function fail(action, error) {
  throw new Error(`Supabase ${action} failed: ${error.message}`);
}

export async function listRequests() {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) fail("select", error);
  return data.map(toRequest);
}

export async function createRequest(fields) {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .insert({
      requester_name: fields.requester_name,
      location: fields.location,
      description: fields.description,
      priority: fields.priority,
      status: "New",
    })
    .select(SELECT_COLUMNS)
    .single();

  if (error) fail("insert", error);
  return toRequest(data);
}

// Returns the updated request, or null if no request has that id.
export async function updateRequestStatus(id, status) {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .update({ status })
    .eq("id", id)
    .select(SELECT_COLUMNS)
    .maybeSingle();

  if (error) fail("update", error);
  return data ? toRequest(data) : null;
}

export async function getSummary() {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select("created_at,priority,status");

  if (error) fail("select", error);

  const requests = data.map(toRequest);
  const open = requests.filter((r) => r.status !== "Complete");

  let completedThisMonth = 0;
  if (requests.length > 0) {
    const latest = requests.reduce((a, b) =>
      b.created_at > a.created_at ? b : a
    );
    const month = latest.created_at.slice(0, 7); // "YYYY-MM" (UTC)
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
