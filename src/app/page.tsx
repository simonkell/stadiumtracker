import { Trophy, MapPinned, NotebookPen, Landmark } from "lucide-react";
import { addCapacityPeriod, addVisit, createStadium } from "@/app/actions";
import { StatCard } from "@/components/stat-card";
import { getDashboardData } from "@/lib/dashboard";
import { formatDate, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { stats, stadiums, visitOptions } = await getDashboardData();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.16),_transparent_35%),linear-gradient(180deg,_#f6f1e8_0%,_#f2efe7_50%,_#ebe7dc_100%)] px-5 py-8 text-slate-950 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="grid gap-6 rounded-[36px] border border-white/70 bg-white/80 p-7 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.45)] backdrop-blur md:grid-cols-[1.7fr_1fr] md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-orange-700">
              Stadium Tracker
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Verfolge deine Stadionbesuche in den groessten Arenen der Welt.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700 md:text-lg">
              Diese erste Version verwaltet Stadien, historische Kapazitaeten und
              Besuche inklusive Event und Notiz. Die wichtigste Kennzahl ist schon
              integriert: Wie viele der aktuell groessten Stadien hast du besucht?
            </p>
          </div>

          <div className="grid gap-4 rounded-[30px] bg-slate-950 p-6 text-slate-50">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-amber-300">
              <Trophy className="h-4 w-4" />
              Fokus-Statistik
            </div>
            <p className="text-6xl font-semibold tracking-tight">{stats.top100Visited}</p>
            <p className="text-lg text-slate-300">
              von {stats.top100Tracked} erfassten Top-Stadien besucht
            </p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <p className="text-sm leading-6 text-slate-400">
              Sobald 100 Stadien eingepflegt sind, wird daraus automatisch deine echte
              Top-100-Abdeckung.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Getrackte Stadien"
            value={formatNumber(stats.trackedStadiums)}
            hint="Alle Stadien in deiner Datenbank, egal ob besucht oder noch offen."
            accent="ink"
          />
          <StatCard
            label="Besuchte Stadien"
            value={formatNumber(stats.visitedStadiums)}
            hint="Gezahlt werden Stadien mit mindestens einem hinterlegten Besuch."
            accent="field"
          />
          <StatCard
            label="Gesamtbesuche"
            value={formatNumber(stats.totalVisits)}
            hint="Mehrfachbesuche in einem Stadion bleiben erhalten und sind separat auswertbar."
            accent="sun"
          />
          <StatCard
            label="Top-100-Quote"
            value={`${stats.completionRate}%`}
            hint="Aktuell bezogen auf die gepflegten Stadien mit gueltiger Kapazitaet."
            accent="field"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_1.25fr]">
          <div className="grid gap-6">
            <article className="rounded-[30px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.45)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-orange-100 p-3 text-orange-700">
                  <Landmark className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Stadion anlegen</h2>
                  <p className="text-sm text-slate-600">
                    Grunddaten inklusive Koordinaten fuer die spaetere Kartenansicht.
                  </p>
                </div>
              </div>

              <form action={createStadium} className="mt-6 grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Name</span>
                    <input className="input" name="name" required />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Land</span>
                    <input className="input" name="country" required />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Stadt</span>
                    <input className="input" name="city" required />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Kontinent</span>
                    <input className="input" name="continent" />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Eroeffnet</span>
                    <input className="input" name="openedYear" type="number" min="1800" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Breitengrad</span>
                    <input className="input" name="latitude" type="number" step="0.000001" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Laengengrad</span>
                    <input className="input" name="longitude" type="number" step="0.000001" />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Primaerer Nutzer / Club</span>
                  <input className="input" name="primaryTenant" />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Notizen</span>
                  <textarea className="textarea" name="notes" rows={4} />
                </label>

                <button className="button-primary" type="submit">
                  Stadion speichern
                </button>
              </form>
            </article>

            <article className="rounded-[30px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.45)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Kapazitaetshistorie pflegen</h2>
                  <p className="text-sm text-slate-600">
                    Jede Aenderung wird als Zeitraum gespeichert und spaeter fuer Rankings genutzt.
                  </p>
                </div>
              </div>

              <form action={addCapacityPeriod} className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Stadion</span>
                  <select className="input" name="stadiumId" required defaultValue="">
                    <option value="" disabled>
                      Stadion waehlen
                    </option>
                    {visitOptions.map((stadium) => (
                      <option key={stadium.id} value={stadium.id}>
                        {stadium.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Kapazitaet</span>
                    <input className="input" name="capacity" type="number" min="1" required />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Gueltig ab</span>
                    <input className="input" name="validFrom" type="date" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Gueltig bis</span>
                    <input className="input" name="validTo" type="date" />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Quelle</span>
                  <input
                    className="input"
                    name="source"
                    placeholder="z. B. offizieller Stadionguide oder Wikipedia"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Kommentar</span>
                  <textarea className="textarea" name="note" rows={3} />
                </label>

                <button className="button-primary button-secondary" type="submit">
                  Kapazitaet hinterlegen
                </button>
              </form>
            </article>

            <article className="rounded-[30px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.45)]">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <NotebookPen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Besuch eintragen</h2>
                  <p className="text-sm text-slate-600">
                    Markiere ein Stadion als besucht und notiere dir Event, Datum und Erinnerung.
                  </p>
                </div>
              </div>

              <form action={addVisit} className="mt-6 grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Stadion</span>
                  <select className="input" name="stadiumId" required defaultValue="">
                    <option value="" disabled>
                      Stadion waehlen
                    </option>
                    {visitOptions.map((stadium) => (
                      <option key={stadium.id} value={stadium.id}>
                        {stadium.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Besuchsdatum</span>
                    <input className="input" name="visitedOn" type="date" required />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">Event</span>
                    <input
                      className="input"
                      name="eventName"
                      placeholder="z. B. Champions League Finale"
                      required
                    />
                  </label>
                </div>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">Notiz</span>
                  <textarea className="textarea" name="note" rows={4} />
                </label>

                <button className="button-primary button-dark" type="submit">
                  Besuch speichern
                </button>
              </form>
            </article>
          </div>

          <section className="rounded-[30px] border border-slate-200/80 bg-white/85 p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.45)]">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Stadien und Besuchsstatus</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Gruen markierte Karten sind bereits besucht. Die Sortierung priorisiert die
                  groessten aktuell erfassten Stadien.
                </p>
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
                {stadiums.length} Eintraege
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              {stadiums.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm leading-7 text-slate-600">
                  Noch keine Stadien vorhanden. Lege zuerst ein Stadion an oder starte spaeter mit
                  einem Import der groessten Arenen weltweit.
                </div>
              ) : (
                stadiums.map((stadium) => {
                  const visited = stadium.visitCount > 0;

                  return (
                    <article
                      key={stadium.id}
                      className={`rounded-[26px] border p-5 transition-colors ${
                        visited
                          ? "border-emerald-300 bg-emerald-50/80"
                          : "border-rose-200 bg-rose-50/70"
                      }`}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold">{stadium.name}</h3>
                            {stadium.isInTop100 ? (
                              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                                Top 100
                              </span>
                            ) : null}
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                                visited
                                  ? "bg-emerald-600 text-white"
                                  : "bg-rose-600 text-white"
                              }`}
                            >
                              {visited ? "Besucht" : "Offen"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {stadium.city}, {stadium.country}
                            {stadium.openedYear ? ` • eroefnet ${stadium.openedYear}` : ""}
                            {stadium.primaryTenant ? ` • ${stadium.primaryTenant}` : ""}
                          </p>
                          {stadium.coordinates ? (
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                              {stadium.coordinates}
                            </p>
                          ) : null}
                        </div>

                        <div className="min-w-[170px] rounded-[20px] bg-white/80 p-4 text-right shadow-sm">
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                            Aktuelle Kapazitaet
                          </p>
                          <p className="mt-2 text-2xl font-semibold">
                            {stadium.currentCapacity != null
                              ? formatNumber(stadium.currentCapacity)
                              : "k. A."}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {stadium.visitCount} Besuch{stadium.visitCount === 1 ? "" : "e"}
                          </p>
                        </div>
                      </div>

                      {stadium.latestVisit ? (
                        <div className="mt-4 rounded-[20px] bg-white/70 p-4 text-sm leading-6 text-slate-700">
                          <span className="font-semibold">Letzter Besuch:</span>{" "}
                          {formatDate(stadium.latestVisit.visitedOn)} bei{" "}
                          <span className="font-semibold">{stadium.latestVisit.eventName}</span>
                          {stadium.latestVisit.note ? ` • ${stadium.latestVisit.note}` : ""}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-[20px] bg-white/70 p-4 text-sm leading-6 text-slate-600">
                          Noch kein Besuch hinterlegt.
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
