import { Trophy, MapPinned, NotebookPen, Landmark } from "lucide-react";
import {
  addCapacityPeriod,
  importStadiumsFromWikipedia,
  lockAdminAccess,
  repairWikipediaImportData,
  unlockAdminAccess,
} from "@/app/actions";
import { StadiumAdminForm, VisitAdminForm } from "@/components/admin-forms";
import { StadiumMap } from "@/components/stadium-map";
import { StatCard } from "@/components/stat-card";
import { isAdminAuthenticated } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import { formatDate, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

type HomeProps = {
  searchParams?: Promise<{
    auth?: string;
  }>;
};

function AdminCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_50px_-40px_rgba(0,34,68,0.4)]">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
      <div className="mt-6">{children}</div>
    </article>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  const { stats, stadiums, mapMarkers, visitOptions, stadiumEditOptions } =
    await getDashboardData();
  const isAdmin = await isAdminAuthenticated();
  const resolvedSearchParams = await searchParams;
  const authFailed = resolvedSearchParams?.auth === "failed";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(31,157,85,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(0,34,68,0.18),_transparent_32%),linear-gradient(180deg,_#f8fbfb_0%,_#edf3f1_48%,_#e3ece8_100%)] px-5 py-8 text-slate-950 md:px-8 md:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="grid gap-6 rounded-[36px] border border-white/70 bg-white/88 p-7 shadow-[0_30px_80px_-45px_rgba(0,34,68,0.35)] backdrop-blur md:grid-cols-[1.7fr_1fr] md:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-700">
              Stadium Tracker
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
              Verfolge deine Stadionbesuche in den größten Arenen der Welt.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700 md:text-lg">
              Diese erste Version verwaltet Stadien, historische Kapazitäten und
              Besuche inklusive Event und Notiz. Die wichtigste Kennzahl ist schon
              integriert: Wie viele der aktuell größten Stadien hast du besucht?
            </p>
          </div>

          <div className="grid gap-4 rounded-[30px] bg-[linear-gradient(145deg,_#002244,_#0a3d62)] p-6 text-slate-50">
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.24em] text-emerald-300">
              <Trophy className="h-4 w-4" />
              Fokus-Statistik
            </div>
            <p className="text-6xl font-semibold tracking-tight">{stats.top100Visited}</p>
            <p className="text-lg text-slate-300">
              von {stats.top100Tracked} erfassten Top-Stadien besucht
            </p>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-white via-emerald-300 to-sky-400"
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
            hint="Gezählt werden Stadien mit mindestens einem hinterlegten Besuch."
            accent="field"
          />
          <StatCard
            label="Noch offen"
            value={formatNumber(stats.remainingStadiums)}
            hint="Getrackt werden nur Stadien ab 60.000 Plätzen. So viele davon warten noch auf ihren ersten Besuch."
            accent="sun"
          />
          <StatCard
            label="Top-50-Quote"
            value={`${stats.top50CompletionRate}%`}
            hint={`Aktuell ${stats.top50Visited} von ${stats.top50Tracked} der größten 50 Stadien besucht.`}
            accent="field"
          />
        </section>

        <section className="rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_50px_-40px_rgba(0,34,68,0.4)] md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Schreibschutz</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Stadionliste und Statistiken sind öffentlich sichtbar. Änderungen an der
                Datenbank sind nur nach Passwort-Freischaltung möglich.
              </p>
            </div>

            {isAdmin ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                  Admin-Zugriff aktiv
                </div>
                <form action={lockAdminAccess}>
                  <button className="button-primary button-secondary" type="submit">
                    Schutz wieder aktivieren
                  </button>
                </form>
              </div>
            ) : (
              <form action={unlockAdminAccess} className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <label className="sr-only" htmlFor="password">
                    Admin-Passwort
                  </label>
                  <input
                    className="input"
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Passwort für Änderungen eingeben"
                    required
                  />
                  {authFailed ? (
                    <p className="mt-2 text-sm text-rose-700">Das Passwort war nicht korrekt.</p>
                  ) : null}
                </div>
                <button className="button-primary" type="submit">
                  Bearbeiten entsperren
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_50px_-40px_rgba(0,34,68,0.4)] md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Stadionkarte</h2>
              <p className="text-sm leading-6 text-slate-600">
                Alle Stadien mit Koordinaten werden auf der Weltkarte dargestellt. Grün
                bedeutet besucht, Gelb bedeutet noch offen.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500" />
                Besucht
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                Noch offen
              </div>
              <div>{mapMarkers.length} Marker mit Koordinaten</div>
            </div>
          </div>

          <div className="mt-5">
            <StadiumMap markers={mapMarkers} />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_1.25fr] xl:items-start">
          <div className="grid h-fit gap-6 self-start">
            {isAdmin ? (
              <>
                <section className="rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_20px_50px_-40px_rgba(0,34,68,0.4)] md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Wikipedia-Basisimport</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Importiert alle Stadien aus der Liste „List of stadiums by capacity“
                        und aktualisiert vorhandene Einträge anhand von Name, Stadt und Land.
                        Stadien unter 60.000 Plätzen werden automatisch ignoriert oder
                        bereinigt.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <form action={repairWikipediaImportData}>
                        <button className="button-primary button-secondary" type="submit">
                          Fehlerhafte Wikipedia-Werte bereinigen
                        </button>
                      </form>

                      <form action={importStadiumsFromWikipedia}>
                        <button className="button-primary" type="submit">
                          Alle Stadien von Wikipedia importieren
                        </button>
                      </form>
                    </div>
                  </div>
                </section>

                <AdminCard
                  title="Stadion anlegen oder bearbeiten"
                  description="Ein zentrales Formular für neue Stadien und spätere Korrekturen."
                  icon={
                    <div className="rounded-2xl bg-slate-100 p-3 text-slate-800">
                      <Landmark className="h-5 w-5" />
                    </div>
                  }
                >
                  <StadiumAdminForm stadiumOptions={stadiumEditOptions} />
                </AdminCard>

                <AdminCard
                  title="Kapazitätshistorie pflegen"
                  description="Jede Änderung wird als Zeitraum gespeichert und später für Rankings genutzt."
                  icon={
                    <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-800">
                      <MapPinned className="h-5 w-5" />
                    </div>
                  }
                >
                  <form action={addCapacityPeriod} className="grid gap-4">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-slate-700">Stadion</span>
                      <select className="input" name="stadiumId" required defaultValue="">
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

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-700">Kapazität</span>
                        <input className="input" name="capacity" type="number" min="1" required />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-700">Gültig ab</span>
                        <input className="input" name="validFrom" type="date" />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-700">Gültig bis</span>
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
                      Kapazität hinterlegen
                    </button>
                  </form>
                </AdminCard>

                <AdminCard
                  title="Besuch eintragen"
                  description="Markiere ein Stadion als besucht und notiere dir Event, Datum und Erinnerung."
                  icon={
                    <div className="rounded-2xl bg-sky-100 p-3 text-sky-800">
                      <NotebookPen className="h-5 w-5" />
                    </div>
                  }
                >
                  <VisitAdminForm visitOptions={visitOptions} />
                </AdminCard>
              </>
            ) : (
              <section className="self-start rounded-[30px] border border-dashed border-slate-300 bg-white/85 p-6 shadow-[0_20px_50px_-40px_rgba(0,34,68,0.22)]">
                <h2 className="text-xl font-semibold">Bearbeitungsbereich geschützt</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Die Formulare für Import, neue Stadien, Kapazitäten und Besuche sind im
                  öffentlichen Betrieb geschützt. Gib oben das Passwort ein, wenn du Änderungen
                  an der Datenbank vornehmen möchtest.
                </p>
              </section>
            )}
          </div>

          <section className="self-start rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_50px_-40px_rgba(0,34,68,0.4)]">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Stadien und Besuchsstatus</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Grün markierte Karten sind bereits besucht. Die Sortierung priorisiert die
                  größten aktuell erfassten Stadien.
                </p>
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-500">
                {stadiums.length} Einträge
              </p>
            </div>

            <div className="mt-6 grid gap-4">
              {stadiums.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-8 text-sm leading-7 text-slate-600">
                  Noch keine Stadien vorhanden. Lege zuerst ein Stadion an oder starte später mit
                  einem Import der größten Arenen weltweit.
                </div>
              ) : (
                stadiums.map((stadium) => {
                  const visited = stadium.hasVisit;

                  return (
                    <article
                      key={stadium.id}
                      id={`stadium-${stadium.id}`}
                      className={`rounded-[26px] border p-5 transition-colors ${
                        visited
                          ? "border-emerald-300 bg-emerald-50/85"
                          : "border-slate-300 bg-slate-100/90"
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
                                  : "bg-slate-700 text-white"
                              }`}
                            >
                              {visited ? "Besucht" : "Offen"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {stadium.city}, {stadium.country}
                            {stadium.openedYear ? ` • eröffnet ${stadium.openedYear}` : ""}
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
                            Aktuelle Kapazität
                          </p>
                          <p className="mt-2 text-2xl font-semibold">
                            {stadium.currentCapacity != null
                              ? formatNumber(stadium.currentCapacity)
                              : "k. A."}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">
                            {visited ? "Erstbesuch gespeichert" : "Noch kein Besuch"}
                          </p>
                        </div>
                      </div>

                      {stadium.firstVisit ? (
                        <div className="mt-4 rounded-[20px] bg-white/70 p-4 text-sm leading-6 text-slate-700">
                          <span className="font-semibold">Erster Besuch:</span>{" "}
                          {formatDate(stadium.firstVisit.visitedOn)} bei{" "}
                          <span className="font-semibold">{stadium.firstVisit.eventName}</span>
                          {stadium.firstVisit.note ? ` • ${stadium.firstVisit.note}` : ""}
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
