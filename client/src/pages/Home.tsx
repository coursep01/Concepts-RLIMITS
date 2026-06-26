import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Clock3, MapPin, RefreshCw, Search, TrainFront } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getArrivals, searchStations, type TflArrival, type TflStation } from "@/lib/tfl";

const SELECTED_STATION_KEY = "tfl-selected-station";

function getArrivalMinutes(arrival: TflArrival) {
  return Math.max(0, Math.ceil(arrival.timeToStation / 60));
}

function formatArrivalTime(arrival: TflArrival) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(arrival.expectedArrival));
}

function readSavedStation(): TflStation | null {
  try {
    const saved = localStorage.getItem(SELECTED_STATION_KEY);
    return saved ? (JSON.parse(saved) as TflStation) : null;
  } catch {
    return null;
  }
}

function StationResult({ station, onSelect }: { station: TflStation; onSelect: (station: TflStation) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(station)}
      className="glass-button w-full rounded-3xl px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
    >
      <span className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-black/80 text-white shadow-lg">
          <MapPin className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-slate-950">{station.name}</span>
          <span className="mt-1 block truncate text-xs capitalize text-slate-600">
            {station.modes.length > 0 ? station.modes.join(" · ").replace(/-/g, " ") : "TfL stop"}
            {station.zone ? ` · Zone ${station.zone}` : ""}
          </span>
        </span>
      </span>
    </button>
  );
}

function ArrivalCard({ arrival }: { arrival: TflArrival }) {
  const minutes = getArrivalMinutes(arrival);
  const isDue = minutes === 0;

  return (
    <Card className="glass-card gap-4 rounded-[2rem] border-white/35 p-4 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.8)]" />
            <p className="truncate text-sm font-semibold text-slate-950">{arrival.lineName}</p>
          </div>
          <h3 className="mt-2 text-lg font-bold leading-tight text-slate-950">{arrival.destinationName}</h3>
          {arrival.platformName && <p className="mt-1 text-sm text-slate-600">{arrival.platformName}</p>}
        </div>
        <div className="rounded-3xl bg-slate-950 px-4 py-3 text-center text-white shadow-lg">
          <p className="text-2xl font-black leading-none">{isDue ? "Due" : minutes}</p>
          {!isDue && <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/70">min</p>}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/40 pt-3 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-3.5" />
          {formatArrivalTime(arrival)}
        </span>
        {arrival.currentLocation && <span className="truncate">{arrival.currentLocation}</span>}
      </div>
    </Card>
  );
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [stations, setStations] = useState<TflStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<TflStation | null>(() => readSavedStation());
  const [arrivals, setArrivals] = useState<TflArrival[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingArrivals, setIsLoadingArrivals] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [arrivalsError, setArrivalsError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const nextArrival = arrivals[0];
  const stationHeading = selectedStation?.name ?? "Choose your station";
  const lastUpdatedLabel = useMemo(() => {
    if (!lastUpdated) {
      return "Not refreshed yet";
    }

    return `Updated ${new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(lastUpdated)}`;
  }, [lastUpdated]);

  useEffect(() => {
    const searchTerm = query.trim();

    if (searchTerm.length < 2) {
      setStations([]);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    setSearchError("");

    const timeoutId = window.setTimeout(() => {
      searchStations(searchTerm, controller.signal)
        .then(setStations)
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }

          setStations([]);
          setSearchError("Could not search TfL stations. Please try again.");
        })
        .finally(() => setIsSearching(false));
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    if (!selectedStation) {
      return;
    }

    localStorage.setItem(SELECTED_STATION_KEY, JSON.stringify(selectedStation));
  }, [selectedStation]);

  useEffect(() => {
    if (!selectedStation) {
      return;
    }

    const controller = new AbortController();

    setIsLoadingArrivals(true);
    setArrivalsError("");

    getArrivals(selectedStation.id, controller.signal)
      .then((nextArrivals) => {
        setArrivals(nextArrivals);
        setLastUpdated(new Date());
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setArrivals([]);
        setArrivalsError("Could not load live arrivals from TfL. Pull a refresh in a moment.");
      })
      .finally(() => setIsLoadingArrivals(false));

    return () => controller.abort();
  }, [selectedStation]);

  const selectStation = (station: TflStation) => {
    setSelectedStation(station);
    setQuery("");
    setStations([]);
  };

  const refreshArrivals = async () => {
    if (!selectedStation) {
      return;
    }

    setIsLoadingArrivals(true);
    setArrivalsError("");

    try {
      const nextArrivals = await getArrivals(selectedStation.id);
      setArrivals(nextArrivals);
      setLastUpdated(new Date());
    } catch {
      setArrivalsError("Could not refresh arrivals from TfL. Please try again.");
    } finally {
      setIsLoadingArrivals(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <div className="ios-orb ios-orb-one" />
      <div className="ios-orb ios-orb-two" />
      <div className="ios-orb ios-orb-three" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-xl flex-col px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))]">
        <header className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">TfL live trains</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Next train</h1>
          </div>
          <div className="glass-card flex size-14 items-center justify-center rounded-[1.35rem] border-white/40 p-0 shadow-xl">
            <TrainFront className="size-7 text-slate-950" />
          </div>
        </header>

        <Card className="glass-card rounded-[2.25rem] border-white/40 p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Station</p>
              <h2 className="mt-2 truncate text-2xl font-black text-slate-950">{stationHeading}</h2>
              <p className="mt-1 text-sm text-slate-600">{lastUpdatedLabel}</p>
            </div>
            <Button
              type="button"
              size="icon"
              onClick={refreshArrivals}
              disabled={!selectedStation || isLoadingArrivals}
              aria-label="Refresh arrivals"
              className="size-12 rounded-2xl bg-slate-950 text-white shadow-lg hover:bg-slate-800"
            >
              <RefreshCw className={cn("size-5", isLoadingArrivals && "animate-spin")} />
            </Button>
          </div>

          <div className="mt-5 rounded-[1.75rem] border border-white/35 bg-white/35 p-2 shadow-inner">
            <label htmlFor="station-search" className="sr-only">
              Search for a TfL station
            </label>
            <div className="flex items-center gap-2 rounded-[1.35rem] bg-white/55 px-4 py-2">
              <Search className="size-5 shrink-0 text-slate-500" />
              <Input
                id="station-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search station, e.g. King's Cross"
                className="h-11 border-0 bg-transparent px-0 text-base font-medium text-slate-950 shadow-none placeholder:text-slate-500 focus-visible:ring-0"
                autoComplete="off"
              />
            </div>
          </div>

          {(isSearching || stations.length > 0 || searchError) && (
            <div className="mt-4 space-y-3">
              {isSearching && <p className="px-1 text-sm text-slate-600">Searching TfL stations...</p>}
              {searchError && (
                <p className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700">
                  <AlertCircle className="size-4" />
                  {searchError}
                </p>
              )}
              {stations.map((station) => (
                <StationResult key={station.id} station={station} onSelect={selectStation} />
              ))}
            </div>
          )}
        </Card>

        <section className="mt-5 flex-1 space-y-4">
          {nextArrival && (
            <Card className="glass-card rounded-[2.25rem] border-white/40 bg-slate-950/90 p-5 text-white shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">Next due</p>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-white/80">{nextArrival.lineName}</p>
                  <h2 className="mt-1 text-2xl font-black leading-tight">{nextArrival.destinationName}</h2>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-black leading-none">
                    {getArrivalMinutes(nextArrival) === 0 ? "Due" : getArrivalMinutes(nextArrival)}
                  </p>
                  {getArrivalMinutes(nextArrival) > 0 && (
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-white/55">min</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {arrivalsError && (
            <Card className="glass-card rounded-[2rem] border-red-200/70 bg-red-100/70 p-4 text-red-800">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <p className="text-sm font-medium">{arrivalsError}</p>
              </div>
            </Card>
          )}

          {!selectedStation && (
            <Card className="glass-card rounded-[2rem] border-white/40 p-6 text-center shadow-xl">
              <p className="text-lg font-bold text-slate-950">Start with a station</p>
              <p className="mt-2 text-sm text-slate-600">
                Search for a tube, rail, Overground, DLR, or Elizabeth line station to see live TfL arrivals.
              </p>
            </Card>
          )}

          {selectedStation && isLoadingArrivals && arrivals.length === 0 && (
            <Card className="glass-card rounded-[2rem] border-white/40 p-6 text-center shadow-xl">
              <RefreshCw className="mx-auto size-6 animate-spin text-slate-600" />
              <p className="mt-3 text-sm font-medium text-slate-600">Loading live arrivals...</p>
            </Card>
          )}

          {selectedStation && !isLoadingArrivals && arrivals.length === 0 && !arrivalsError && (
            <Card className="glass-card rounded-[2rem] border-white/40 p-6 text-center shadow-xl">
              <p className="text-lg font-bold text-slate-950">No arrivals listed</p>
              <p className="mt-2 text-sm text-slate-600">TfL is not reporting upcoming trains for this station right now.</p>
            </Card>
          )}

          {arrivals.slice(nextArrival ? 1 : 0, 7).map((arrival) => (
            <ArrivalCard key={arrival.id} arrival={arrival} />
          ))}
        </section>
      </section>
    </main>
  );
}

