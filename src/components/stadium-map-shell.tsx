"use client";

import dynamic from "next/dynamic";

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

type StadiumMapShellProps = {
  markers: MapMarker[];
};

const StadiumMap = dynamic(
  () => import("@/components/stadium-map").then((module) => module.StadiumMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] w-full items-center justify-center rounded-[28px] border border-slate-200/80 bg-slate-100 text-sm text-slate-600 md:h-[520px]">
        Stadionkarte wird geladen…
      </div>
    ),
  },
);

export function StadiumMapShell({ markers }: StadiumMapShellProps) {
  return <StadiumMap markers={markers} />;
}
