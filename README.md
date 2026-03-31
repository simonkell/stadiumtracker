# stadiumtracker

Minimaler MVP fuer eine WebApp, die Stadionbesuche in den groessten Stadien der Welt verwaltet.

## Stack

- Next.js 16 mit App Router
- Prisma
- SQLite
- Docker fuer spaeteres Deployment auf Proxmox

## Kernfunktionen

- Stadien anlegen und verwalten
- historische Kapazitaeten als Zeitraeume speichern
- Besuche mit Datum, Event und Notiz erfassen
- Dashboard mit Top-100-Fortschritt und Besuchsstatistiken

## Lokal starten

```bash
npm install
npm run db:setup
npm run dev
```

Die App laeuft dann unter [http://localhost:3000](http://localhost:3000).

## Docker starten

```bash
docker compose up --build -d
```

Die SQLite-Datenbank liegt im Volume `stadiumtracker_data`.
