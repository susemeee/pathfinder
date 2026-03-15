const BASE_URL = "https://apis-navi.kakaomobility.com";

export interface Coordinate {
  x: number; // longitude
  y: number; // latitude
  name?: string;
  angle?: number;
}

export interface RouteOptions {
  priority?: "RECOMMEND" | "TIME" | "DISTANCE";
  avoid?: string[];
  alternatives?: boolean;
  roadDetails?: boolean;
  carType?: number;
  carFuel?: "GASOLINE" | "DIESEL" | "LPG";
  carHipass?: boolean;
  summary?: boolean;
  roadevent?: number;
}

export interface DirectionsRequest extends RouteOptions {
  origin: Coordinate;
  destination: Coordinate;
  waypoints?: Coordinate[];
}

export interface FutureDirectionsRequest extends DirectionsRequest {
  departureTime: string; // YYYYMMDDHHMM
}

export interface WaypointsDirectionsRequest extends RouteOptions {
  origin: Coordinate;
  destination: Coordinate;
  waypoints?: Coordinate[];
}

// Response types
export interface RouteSummary {
  origin: { name: string; x: number; y: number };
  destination: { name: string; x: number; y: number };
  waypoints?: { name: string; x: number; y: number }[];
  priority: string;
  bound: { min_x: number; min_y: number; max_x: number; max_y: number };
  fare: { taxi: number; toll: number };
  distance: number;
  duration: number;
}

export interface Guide {
  name: string;
  x: number;
  y: number;
  distance: number;
  duration: number;
  type: number;
  guidance: string;
  road_index: number;
}

export interface Road {
  name: string;
  distance: number;
  duration: number;
  traffic_speed: number;
  traffic_state: number;
  vertexes: number[];
}

export interface Section {
  distance: number;
  duration: number;
  bound?: { min_x: number; min_y: number; max_x: number; max_y: number };
  roads: Road[];
  guides: Guide[];
}

export interface Route {
  result_code: number;
  result_msg: string;
  summary: RouteSummary;
  sections: Section[];
}

export interface DirectionsResponse {
  trans_id: string;
  routes: Route[];
}

function formatCoord(c: Coordinate): string {
  let s = `${c.x},${c.y}`;
  if (c.name) s += `,name=${c.name}`;
  if (c.angle !== undefined) s += `,angle=${c.angle}`;
  return s;
}

function buildCommonParams(opts: RouteOptions): Record<string, string> {
  const params: Record<string, string> = {};
  if (opts.priority) params.priority = opts.priority;
  if (opts.avoid?.length) params.avoid = opts.avoid.join("|");
  if (opts.alternatives) params.alternatives = "true";
  if (opts.roadDetails) params.road_details = "true";
  if (opts.carType !== undefined) params.car_type = String(opts.carType);
  if (opts.carFuel) params.car_fuel = opts.carFuel;
  if (opts.carHipass) params.car_hipass = "true";
  if (opts.summary) params.summary = "true";
  if (opts.roadevent !== undefined) params.roadevent = String(opts.roadevent);
  return params;
}

async function request<T>(
  apiKey: string,
  method: "GET" | "POST",
  path: string,
  params?: Record<string, string>,
  body?: unknown
): Promise<T> {
  const url = new URL(path, BASE_URL);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    Authorization: `KakaoAK ${apiKey}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API 요청 실패 (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

export async function directions(
  apiKey: string,
  req: DirectionsRequest
): Promise<DirectionsResponse> {
  const params: Record<string, string> = {
    origin: formatCoord(req.origin),
    destination: formatCoord(req.destination),
    ...buildCommonParams(req),
  };

  if (req.waypoints?.length) {
    params.waypoints = req.waypoints.map(formatCoord).join("|");
  }

  return request<DirectionsResponse>(apiKey, "GET", "/v1/directions", params);
}

export async function futureDirections(
  apiKey: string,
  req: FutureDirectionsRequest
): Promise<DirectionsResponse> {
  const params: Record<string, string> = {
    origin: formatCoord(req.origin),
    destination: formatCoord(req.destination),
    departure_time: req.departureTime,
    ...buildCommonParams(req),
  };

  if (req.waypoints?.length) {
    params.waypoints = req.waypoints.map(formatCoord).join("|");
  }

  return request<DirectionsResponse>(
    apiKey,
    "GET",
    "/v1/future/directions",
    params
  );
}

export async function waypointsDirections(
  apiKey: string,
  req: WaypointsDirectionsRequest
): Promise<DirectionsResponse> {
  const body: Record<string, unknown> = {
    origin: { x: req.origin.x, y: req.origin.y, ...(req.origin.name && { name: req.origin.name }) },
    destination: { x: req.destination.x, y: req.destination.y, ...(req.destination.name && { name: req.destination.name }) },
    ...buildCommonParams(req),
  };

  if (req.waypoints?.length) {
    body.waypoints = req.waypoints.map((w) => ({
      x: w.x,
      y: w.y,
      ...(w.name && { name: w.name }),
    }));
  }

  if (req.priority) body.priority = req.priority;
  if (req.avoid?.length) body.avoid = req.avoid;

  return request<DirectionsResponse>(
    apiKey,
    "POST",
    "/v1/waypoints/directions",
    undefined,
    body
  );
}
