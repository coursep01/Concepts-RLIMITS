const TFL_API_BASE = "https://api.tfl.gov.uk";

export type TflStation = {
  id: string;
  name: string;
  modes: string[];
  zone?: string;
};

export type TflArrival = {
  id: string;
  lineName: string;
  destinationName: string;
  platformName?: string;
  expectedArrival: string;
  timeToStation: number;
  currentLocation?: string;
};

type StopPointSearchMatch = {
  id?: string;
  name?: string;
  modes?: string[];
  zone?: string;
};

type StopPointSearchResponse = {
  matches?: StopPointSearchMatch[];
};

type ArrivalPredictionResponse = {
  id?: string;
  lineName?: string;
  destinationName?: string;
  platformName?: string;
  expectedArrival?: string;
  timeToStation?: number;
  currentLocation?: string;
};

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${TFL_API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`TfL request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function searchStations(query: string, signal?: AbortSignal): Promise<TflStation[]> {
  const searchTerm = query.trim();

  if (searchTerm.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    modes: "tube,dlr,elizabeth-line,overground,national-rail",
    maxResults: "8",
  });
  const data = await fetchJson<StopPointSearchResponse>(
    `/StopPoint/Search/${encodeURIComponent(searchTerm)}?${params.toString()}`,
    signal
  );

  return (data.matches ?? [])
    .filter((match): match is StopPointSearchMatch & { id: string; name: string } => Boolean(match.id && match.name))
    .map((match) => ({
      id: match.id,
      name: match.name,
      modes: match.modes ?? [],
      zone: match.zone,
    }));
}

export async function getArrivals(stationId: string, signal?: AbortSignal): Promise<TflArrival[]> {
  const data = await fetchJson<ArrivalPredictionResponse[]>(
    `/StopPoint/${encodeURIComponent(stationId)}/Arrivals`,
    signal
  );

  return data
    .filter((arrival): arrival is ArrivalPredictionResponse & { id: string; lineName: string; expectedArrival: string } =>
      Boolean(arrival.id && arrival.lineName && arrival.expectedArrival)
    )
    .map((arrival) => ({
      id: arrival.id,
      lineName: arrival.lineName,
      destinationName: arrival.destinationName || "Destination unavailable",
      platformName: arrival.platformName,
      expectedArrival: arrival.expectedArrival,
      timeToStation: arrival.timeToStation ?? 0,
      currentLocation: arrival.currentLocation,
    }))
    .sort((a, b) => a.timeToStation - b.timeToStation);
}

