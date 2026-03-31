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
docker compose up -d
```

Die SQLite-Datenbank liegt im Volume `stadiumtracker_data`.

## GHCR Deployment

Pushes auf `main` bauen automatisch ein Docker-Image und pushen es nach `ghcr.io/simonkell/stadiumtracker:latest`.

Fuer Arcane brauchst du dann nur noch:

- Zugriff auf `ghcr.io`
- einen Token mit `read:packages`, falls das Paket privat ist
- die mitgelieferte `compose.yaml`, die direkt das GHCR-Image verwendet
