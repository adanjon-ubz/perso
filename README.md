# Restaurant Profitability Simulator

Simulateur web de P&L et de rentabilité pour restaurants en France.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build production
- `npm run test` — tests unitaires du moteur financier

## Architecture

- `src/data/france-benchmarks.ts` — benchmarks France sourcés
- `src/lib/engine/` — moteur financier testable (CA, coûts, EBITDA, break-even, sensibilité)
- `src/components/` — interface React (hypothèses, KPI, graphiques, scénarios)
- `src/__tests__/` — tests unitaires et scénarios économiques

## Scénarios de démo

- Restaurant traditionnel à Lyon (50 places)
- Bistrot parisien
- Fast food en ville moyenne
