"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addCapacityPeriod,
  addVisit,
  createStadium,
  deleteCapacityPeriod,
  deleteStadium,
  deleteVisit,
  updateCapacityPeriod,
  updateStadium,
  updateVisit,
} from "@/app/actions";
import type { CapacityOption, StadiumEditOption, VisitOption } from "@/lib/dashboard";
import { formatNumber } from "@/lib/utils";

type StadiumAdminFormProps = {
  stadiumOptions: StadiumEditOption[];
};

type VisitAdminFormProps = {
  visitOptions: VisitOption[];
};

type CapacityAdminFormProps = {
  capacityOptions: CapacityOption[];
};

type StadiumFormState = {
  name: string;
  country: string;
  city: string;
  continent: string;
  openedYear: string;
  latitude: string;
  longitude: string;
  primaryTenant: string;
  notes: string;
  isDemolished: boolean;
  isDangerous: boolean;
};

type VisitFormState = {
  visitedOn: string;
  eventName: string;
  note: string;
};

type CapacityFormState = {
  capacity: string;
  validFrom: string;
  validTo: string;
  source: string;
  note: string;
};

const emptyStadiumForm: StadiumFormState = {
  name: "",
  country: "",
  city: "",
  continent: "",
  openedYear: "",
  latitude: "",
  longitude: "",
  primaryTenant: "",
  notes: "",
  isDemolished: false,
  isDangerous: false,
};

const emptyVisitForm: VisitFormState = {
  visitedOn: "",
  eventName: "",
  note: "",
};

const emptyCapacityForm: CapacityFormState = {
  capacity: "",
  validFrom: "",
  validTo: "",
  source: "",
  note: "",
};

function toStadiumFormState(stadium: StadiumEditOption | null): StadiumFormState {
  if (!stadium) {
    return emptyStadiumForm;
  }

  return {
    name: stadium.name,
    country: stadium.country,
    city: stadium.city,
    continent: stadium.continent ?? "",
    openedYear: stadium.openedYear != null ? String(stadium.openedYear) : "",
    latitude: stadium.latitude != null ? String(stadium.latitude) : "",
    longitude: stadium.longitude != null ? String(stadium.longitude) : "",
    primaryTenant: stadium.primaryTenant ?? "",
    notes: stadium.notes ?? "",
    isDemolished: stadium.isDemolished,
    isDangerous: stadium.isDangerous,
  };
}

function toVisitFormState(option: VisitOption | null): VisitFormState {
  if (!option?.firstVisit) {
    return emptyVisitForm;
  }

  return {
    visitedOn: option.firstVisit.visitedOn,
    eventName: option.firstVisit.eventName,
    note: option.firstVisit.note ?? "",
  };
}

function toCapacityFormState(
  option: CapacityOption | null,
  selectedPeriodId: string,
): CapacityFormState {
  if (!option) {
    return emptyCapacityForm;
  }

  if (selectedPeriodId === "new") {
    return emptyCapacityForm;
  }

  const selectedPeriod =
    option.periods.find((period) => String(period.id) === selectedPeriodId) ??
    option.periods.find((period) => period.isCurrent) ??
    null;

  if (!selectedPeriod) {
    return emptyCapacityForm;
  }

  return {
    capacity: String(selectedPeriod.capacity),
    validFrom: selectedPeriod.validFrom,
    validTo: selectedPeriod.validTo,
    source: selectedPeriod.source ?? "",
    note: selectedPeriod.note ?? "",
  };
}

function formatPeriodLabel(period: CapacityOption["periods"][number]) {
  const rangeLabel =
    period.validFrom || period.validTo
      ? `${period.validFrom || "offen"} - ${period.validTo || "offen"}`
      : "ohne Zeitraum";

  return `${formatNumber(period.capacity)} Plätze • ${rangeLabel}`;
}

export function StadiumAdminForm({ stadiumOptions }: StadiumAdminFormProps) {
  const [selectedStadiumId, setSelectedStadiumId] = useState("");
  const selectedStadium = useMemo(
    () => stadiumOptions.find((stadium) => String(stadium.id) === selectedStadiumId) ?? null,
    [selectedStadiumId, stadiumOptions],
  );
  const [formState, setFormState] = useState<StadiumFormState>(emptyStadiumForm);

  useEffect(() => {
    setFormState(toStadiumFormState(selectedStadium));
  }, [selectedStadium]);

  const formAction = selectedStadium ? updateStadium : createStadium;

  return (
    <div className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Bestehendes Stadion auswählen</span>
        <select
          className="input"
          value={selectedStadiumId}
          onChange={(event) => setSelectedStadiumId(event.target.value)}
        >
          <option value="">Neues Stadion anlegen</option>
          {stadiumOptions.map((stadium) => (
            <option key={stadium.id} value={stadium.id}>
              {stadium.name} ({stadium.city}, {stadium.country})
            </option>
          ))}
        </select>
      </label>

      <p className="text-sm leading-6 text-slate-600">
        {selectedStadium
          ? "Die Daten des ausgewählten Stadions sind geladen und können für Simons Tracking direkt angepasst werden."
          : "Ohne Auswahl wird hier ein neues Stadion für Simons Sammlung angelegt."}
      </p>

      <form action={formAction} className="grid gap-4">
        {selectedStadium ? (
          <input name="stadiumId" type="hidden" value={selectedStadium.id} />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <input
              className="input"
              name="name"
              value={formState.name}
              onChange={(event) =>
                setFormState((current) => ({ ...current, name: event.target.value }))
              }
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Land</span>
            <input
              className="input"
              name="country"
              value={formState.country}
              onChange={(event) =>
                setFormState((current) => ({ ...current, country: event.target.value }))
              }
              required
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Stadt</span>
            <input
              className="input"
              name="city"
              value={formState.city}
              onChange={(event) =>
                setFormState((current) => ({ ...current, city: event.target.value }))
              }
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Kontinent</span>
            <input
              className="input"
              name="continent"
              value={formState.continent}
              onChange={(event) =>
                setFormState((current) => ({ ...current, continent: event.target.value }))
              }
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Eröffnet</span>
            <input
              className="input"
              name="openedYear"
              type="number"
              min="1800"
              value={formState.openedYear}
              onChange={(event) =>
                setFormState((current) => ({ ...current, openedYear: event.target.value }))
              }
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Breitengrad</span>
            <input
              className="input"
              name="latitude"
              type="number"
              step="0.000001"
              value={formState.latitude}
              onChange={(event) =>
                setFormState((current) => ({ ...current, latitude: event.target.value }))
              }
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Längengrad</span>
            <input
              className="input"
              name="longitude"
              type="number"
              step="0.000001"
              value={formState.longitude}
              onChange={(event) =>
                setFormState((current) => ({ ...current, longitude: event.target.value }))
              }
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex items-start gap-3 rounded-[20px] border border-slate-200 bg-slate-50/80 p-4">
            <input
              checked={formState.isDemolished}
              className="mt-1 h-4 w-4"
              name="isDemolished"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  isDemolished: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span className="text-sm leading-6 text-slate-700">
              <span className="block font-semibold text-slate-900">Abgerissen</span>
              Dieses Stadion wird nicht mehr aktiv genutzt und zählt nicht mehr in Simons Statistiken.
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-[20px] border border-slate-200 bg-slate-50/80 p-4">
            <input
              checked={formState.isDangerous}
              className="mt-1 h-4 w-4"
              name="isDangerous"
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  isDangerous: event.target.checked,
                }))
              }
              type="checkbox"
            />
            <span className="text-sm leading-6 text-slate-700">
              <span className="block font-semibold text-slate-900">Zu gefährlich</span>
              Markiert Orte, die aktuell wegen Krieg oder Sicherheitslage nicht realistisch bereist werden können.
            </span>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Primärer Nutzer / Club</span>
          <input
            className="input"
            name="primaryTenant"
            value={formState.primaryTenant}
            onChange={(event) =>
              setFormState((current) => ({ ...current, primaryTenant: event.target.value }))
            }
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Notizen</span>
          <textarea
            className="textarea"
            name="notes"
            rows={4}
            value={formState.notes}
            onChange={(event) =>
              setFormState((current) => ({ ...current, notes: event.target.value }))
            }
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="button-primary" type="submit">
            {selectedStadium ? "Stadion aktualisieren" : "Stadion speichern"}
          </button>
        </div>
      </form>

      {selectedStadium ? (
        <form action={deleteStadium}>
          <input name="stadiumId" type="hidden" value={selectedStadium.id} />
          <button className="button-primary button-dark" type="submit">
            Stadion löschen
          </button>
        </form>
      ) : null}
    </div>
  );
}

export function CapacityAdminForm({ capacityOptions }: CapacityAdminFormProps) {
  const [selectedStadiumId, setSelectedStadiumId] = useState("");
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const selectedStadium = useMemo(
    () => capacityOptions.find((stadium) => String(stadium.id) === selectedStadiumId) ?? null,
    [selectedStadiumId, capacityOptions],
  );
  const [formState, setFormState] = useState<CapacityFormState>(emptyCapacityForm);

  useEffect(() => {
    setSelectedPeriodId(selectedStadium?.currentCapacityPeriodId != null ? String(selectedStadium.currentCapacityPeriodId) : "");
  }, [selectedStadium]);

  useEffect(() => {
    setFormState(toCapacityFormState(selectedStadium, selectedPeriodId));
  }, [selectedPeriodId, selectedStadium]);

  const hasExistingPeriod =
    selectedPeriodId !== "" &&
    selectedPeriodId !== "new" &&
    selectedStadium?.periods.some((period) => String(period.id) === selectedPeriodId) === true;
  const formAction = hasExistingPeriod ? updateCapacityPeriod : addCapacityPeriod;

  return (
    <div className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-700">Stadion</span>
        <select
          className="input"
          value={selectedStadiumId}
          onChange={(event) => setSelectedStadiumId(event.target.value)}
          required
        >
          <option value="" disabled>
            Stadion wählen
          </option>
          {capacityOptions.map((stadium) => (
            <option key={stadium.id} value={stadium.id}>
              {stadium.name}
            </option>
          ))}
        </select>
      </label>

      {selectedStadium ? (
        <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Aktuell gültige Kapazität:</span>{" "}
          {selectedStadium.currentCapacity != null
            ? `${formatNumber(selectedStadium.currentCapacity)} Plätze`
            : "noch nicht hinterlegt"}
        </div>
      ) : null}

      <p className="text-sm leading-6 text-slate-600">
        {hasExistingPeriod
          ? "Ein vorhandener Historieneintrag ist ausgewählt und kann direkt aktualisiert oder gelöscht werden."
          : "Ohne ausgewählten Historieneintrag wird eine neue Kapazitätsperiode angelegt."}
      </p>

      <form action={formAction} className="grid gap-4">
        {selectedStadium ? <input name="stadiumId" type="hidden" value={selectedStadium.id} /> : null}
        {hasExistingPeriod ? <input name="capacityPeriodId" type="hidden" value={selectedPeriodId} /> : null}

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Kapazität</span>
            <input
              className="input"
              name="capacity"
              type="number"
              min="1"
              value={formState.capacity}
              onChange={(event) =>
                setFormState((current) => ({ ...current, capacity: event.target.value }))
              }
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Gültig ab</span>
            <input
              className="input"
              name="validFrom"
              type="date"
              value={formState.validFrom}
              onChange={(event) =>
                setFormState((current) => ({ ...current, validFrom: event.target.value }))
              }
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Gültig bis</span>
            <input
              className="input"
              name="validTo"
              type="date"
              value={formState.validTo}
              onChange={(event) =>
                setFormState((current) => ({ ...current, validTo: event.target.value }))
              }
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Quelle</span>
          <input
            className="input"
            name="source"
            placeholder="z. B. offizieller Stadionguide oder Wikipedia"
            value={formState.source}
            onChange={(event) =>
              setFormState((current) => ({ ...current, source: event.target.value }))
            }
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Kommentar</span>
          <textarea
            className="textarea"
            name="note"
            rows={3}
            value={formState.note}
            onChange={(event) =>
              setFormState((current) => ({ ...current, note: event.target.value }))
            }
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="button-primary button-secondary" disabled={!selectedStadium} type="submit">
            {hasExistingPeriod ? "Kapazität aktualisieren" : "Kapazität hinterlegen"}
          </button>
          {hasExistingPeriod ? (
            <button
              className="button-primary"
              onClick={() => setSelectedPeriodId("new")}
              type="button"
            >
              Neue Periode anlegen
            </button>
          ) : null}
        </div>
      </form>

      {hasExistingPeriod ? (
        <form action={deleteCapacityPeriod}>
          <input name="capacityPeriodId" type="hidden" value={selectedPeriodId} />
          <button className="button-primary button-dark" type="submit">
            Kapazitätseintrag löschen
          </button>
        </form>
      ) : null}

      {selectedStadium?.periods.length ? (
        <div className="grid gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Bereits hinterlegte Kapazitäten
          </p>
          <div className="grid gap-2">
            {selectedStadium.periods.map((period) => (
              <button
                key={period.id}
                className={`rounded-[18px] border px-4 py-3 text-left text-sm transition-colors ${
                  selectedPeriodId === String(period.id)
                    ? "border-sky-300 bg-sky-50 text-sky-950"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                onClick={() => setSelectedPeriodId(String(period.id))}
                type="button"
              >
                <span className="block font-semibold">{formatPeriodLabel(period)}</span>
                {period.isCurrent ? (
                  <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
                    Aktuell gültig
                  </span>
                ) : null}
                {period.source ? (
                  <span className="mt-1 block text-xs text-slate-500">Quelle: {period.source}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function VisitAdminForm({ visitOptions }: VisitAdminFormProps) {
  const [selectedStadiumId, setSelectedStadiumId] = useState("");
  const selectedOption = useMemo(
    () => visitOptions.find((stadium) => String(stadium.id) === selectedStadiumId) ?? null,
    [selectedStadiumId, visitOptions],
  );
  const [formState, setFormState] = useState<VisitFormState>(emptyVisitForm);

  useEffect(() => {
    setFormState(toVisitFormState(selectedOption));
  }, [selectedOption]);

  const hasExistingVisit = Boolean(selectedOption?.firstVisit);
  const formAction = hasExistingVisit ? updateVisit : addVisit;

  return (
    <div className="grid gap-4">
      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Stadion</span>
          <select
            className="input"
            name="stadiumId"
            value={selectedStadiumId}
            onChange={(event) => setSelectedStadiumId(event.target.value)}
            required
          >
            <option value="" disabled>
              Stadion wählen
            </option>
            {visitOptions.map((stadium) => (
              <option key={stadium.id} value={stadium.id}>
                {stadium.name}
              </option>
            ))}
          </select>
        </label>

        <p className="text-sm leading-6 text-slate-600">
          {hasExistingVisit
            ? "Für dieses Stadion ist bereits ein Erstbesuch hinterlegt. Er kann direkt in dieser Maske angepasst werden."
            : "Wenn für das ausgewählte Stadion noch kein Besuch existiert, wird hier ein neuer Erstbesuch für Simon angelegt."}
        </p>

        {selectedOption?.firstVisit ? (
          <input name="visitId" type="hidden" value={selectedOption.firstVisit.id} />
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Besuchsdatum</span>
            <input
              className="input"
              name="visitedOn"
              type="date"
              value={formState.visitedOn}
              onChange={(event) =>
                setFormState((current) => ({ ...current, visitedOn: event.target.value }))
              }
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Event</span>
            <input
              className="input"
              name="eventName"
              placeholder="z. B. Champions League Finale"
              value={formState.eventName}
              onChange={(event) =>
                setFormState((current) => ({ ...current, eventName: event.target.value }))
              }
              required
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-700">Notiz</span>
          <textarea
            className="textarea"
            name="note"
            rows={4}
            value={formState.note}
            onChange={(event) =>
              setFormState((current) => ({ ...current, note: event.target.value }))
            }
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="button-primary button-dark" type="submit" disabled={!selectedOption}>
            {hasExistingVisit ? "Erstbesuch aktualisieren" : "Besuch speichern"}
          </button>
        </div>
      </form>

      {selectedOption?.firstVisit ? (
        <form action={deleteVisit}>
          <input name="visitId" type="hidden" value={selectedOption.firstVisit.id} />
          <button className="button-primary button-secondary" type="submit">
            Erstbesuch löschen
          </button>
        </form>
      ) : null}
    </div>
  );
}
