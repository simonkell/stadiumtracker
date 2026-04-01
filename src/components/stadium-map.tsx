"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import type { ComponentType } from "react";
import { formatDate, formatNumber } from "@/lib/utils";

type MapMarker = {
  id: number;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  currentCapacity: number | null;
  isVisited: boolean;
  isDemolished: boolean;
  isDangerous: boolean;
  isInTop100: boolean;
  firstVisitDate: Date | null;
  firstVisitEvent: string | null;
};

type StadiumMapProps = {
  markers: MapMarker[];
};

type MarkerFilter = "all" | "visited" | "open" | "dangerous";

const WORLD_BOUNDS: [[number, number], [number, number]] = [
  [-60, -180],
  [85, 180],
];

const LeafletMapContainer = MapContainer as unknown as ComponentType<Record<string, unknown>>;
const LeafletTileLayer = TileLayer as unknown as ComponentType<Record<string, unknown>>;
const LeafletCircleMarker = CircleMarker as unknown as ComponentType<Record<string, unknown>>;
const LeafletPopup = Popup as unknown as ComponentType<Record<string, unknown>>;

export function StadiumMap({ markers }: StadiumMapProps) {
  const [filter, setFilter] = useState<MarkerFilter>("all");

  const filteredMarkers = useMemo(() => {
    switch (filter) {
      case "visited":
        return markers.filter((marker) => marker.isVisited);
      case "dangerous":
        return markers.filter((marker) => marker.isDangerous);
      case "open":
        return markers.filter((marker) => !marker.isVisited && !marker.isDangerous);
      default:
        return markers;
    }
  }, [filter, markers]);

  const mapBounds =
    filteredMarkers.length > 0
      ? filteredMarkers.map((marker) => [marker.latitude, marker.longitude] as [number, number])
      : WORLD_BOUNDS;

  const visitedCount = markers.filter((marker) => marker.isVisited).length;
  const dangerousCount = markers.filter((marker) => marker.isDangerous).length;
  const openCount = markers.filter((marker) => !marker.isVisited && !marker.isDangerous).length;

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-slate-100">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 bg-white/90 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
        <div className="flex flex-wrap gap-2">
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
            onClick={() => setFilter("all")}
            type="button"
          >
            Alle ({markers.length})
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === "visited"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
            }`}
            onClick={() => setFilter("visited")}
            type="button"
          >
            Besucht ({visitedCount})
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === "open"
                ? "bg-amber-400 text-slate-950"
                : "bg-amber-100 text-amber-900 hover:bg-amber-200"
            }`}
            onClick={() => setFilter("open")}
            type="button"
          >
            Offen ({openCount})
          </button>
          <button
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === "dangerous"
                ? "bg-rose-600 text-white"
                : "bg-rose-100 text-rose-900 hover:bg-rose-200"
            }`}
            onClick={() => setFilter("dangerous")}
            type="button"
          >
            Zu gefährlich ({dangerousCount})
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            Besucht
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            Noch offen
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500" />
            Zu gefährlich
          </div>
          <div>{filteredMarkers.length} Marker sichtbar</div>
        </div>
      </div>

      <LeafletMapContainer
        bounds={mapBounds}
        className="h-[420px] w-full md:h-[520px]"
      >
        <LeafletTileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filteredMarkers.map((marker) => (
          <LeafletCircleMarker
            key={marker.id}
            center={[marker.latitude, marker.longitude]}
            radius={8}
            pathOptions={{
              color: marker.isDangerous ? "#be123c" : marker.isVisited ? "#117a43" : "#d4a017",
              weight: 2,
              fillColor: marker.isDangerous
                ? "#f43f5e"
                : marker.isVisited
                  ? "#1f9d55"
                  : "#f2c94c",
              fillOpacity: 0.92,
            }}
          >
            <LeafletPopup>
              <div className="min-w-[220px] text-slate-900">
                <p className="text-base font-semibold">{marker.name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {marker.city}, {marker.country}
                </p>
                <p className="mt-3 text-sm">
                  Status:{" "}
                  <span className="font-semibold">
                    {marker.isDangerous
                      ? "Zu gefährlich"
                      : marker.isVisited
                        ? "Besucht"
                        : "Noch offen"}
                  </span>
                </p>
                {marker.isDemolished ? (
                  <p className="mt-1 text-sm">
                    Zustand: <span className="font-semibold">Abgerissen</span>
                  </p>
                ) : null}
                <p className="mt-1 text-sm">
                  Aktuelle Kapazität:{" "}
                  <span className="font-semibold">
                    {marker.currentCapacity != null
                      ? formatNumber(marker.currentCapacity)
                      : "k. A."}
                  </span>
                </p>
                {marker.isInTop100 ? (
                  <p className="mt-1 text-sm">
                    Ranking: <span className="font-semibold">Top 100</span>
                  </p>
                ) : null}
                {marker.firstVisitDate ? (
                  <p className="mt-1 text-sm">
                    Erster Besuch:{" "}
                    <span className="font-semibold">
                      {formatDate(marker.firstVisitDate)}
                      {marker.firstVisitEvent ? ` • ${marker.firstVisitEvent}` : ""}
                    </span>
                  </p>
                ) : null}
                <a
                  className="mt-3 inline-flex text-sm font-semibold text-sky-700 underline underline-offset-2"
                  href={`#stadium-${marker.id}`}
                >
                  Zur Stadionkarte springen
                </a>
              </div>
            </LeafletPopup>
          </LeafletCircleMarker>
        ))}
      </LeafletMapContainer>
    </div>
  );
}
