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

Fuer geschuetzte Schreibzugriffe setze zusaetzlich:

```bash
ADMIN_PASSWORD=dein-passwort
AUTH_SECRET=ein-langer-zufaelliger-wert
```

Optional fuer die automatische Koordinaten-Suche ueber OpenStreetMap/Nominatim:

```bash
NOMINATIM_EMAIL=du@example.com
NOMINATIM_USER_AGENT=stadiumtracker/0.1 (+https://deine-domain.example)
```

Vorhandene Koordinaten werden dabei nicht ueberschrieben. Die Sammel-Ergaenzung laeuft bewusst nur fuer Stadien ohne Lat/Lon.

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
