"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addVisit,
  createStadium,
  deleteStadium,
  deleteVisit,
  updateStadium,
  updateVisit,
} from "@/app/actions";
import type { StadiumEditOption, VisitOption } from "@/lib/dashboard";

type StadiumAdminFormProps = {
  stadiumOptions: StadiumEditOption[];
};

type VisitAdminFormProps = {
  visitOptions: VisitOption[];
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
};

type VisitFormState = {
  visitedOn: string;
  eventName: string;
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
};

const emptyVisitForm: VisitFormState = {
  visitedOn: "",
  eventName: "",
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
          ? "Die Werte des ausgewählten Stadions sind geladen und können direkt angepasst werden."
          : "Ohne Auswahl legst du hier ein neues Stadion an."}
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
          ? "Für dieses Stadion ist bereits ein Erstbesuch hinterlegt. Du bearbeitest ihn direkt in dieser Maske."
          : "Wenn für das ausgewählte Stadion noch kein Besuch existiert, wird hier ein neuer Erstbesuch angelegt."}
      </p>

      <form action={formAction} className="grid gap-4">
        {selectedOption ? <input name="stadiumId" type="hidden" value={selectedOption.id} /> : null}
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
