# Riftbound Vault

A static **Riftbound TCG** collection manager and deck possibility viewer. No account, no server — your collection lives in **localStorage**, with **JSON import/export** for backup and moving between devices.

Card art uses **Riot’s official CDN** (same assets as the [official card gallery](https://riftbound.leagueoflegends.com/en-us/card-gallery/)).

## Features

- Visual card grid with official card images
- Track owned copies (+ / − on each card)
- Filter by set, domain, type; search by name or code (`OGN-042`)
- **Deck possibilities**: pick a Legend you own and see how close you are to a legal deck (40 main / 12 runes / 3 unique battlefields)
- Export / import collection as JSON

## Local development

```bash
cd riftbound-vault
npm install
npm run build:cards   # première fois, ou après mise à jour des cartes
npm run dev           # http://localhost:5174 (5173 souvent déjà pris par un autre Vite)
```

Si un ancien serveur tourne encore sur le port **5173**, tu peux aussi ouvrir directement [http://localhost:5173/](http://localhost:5173/) sans relancer.

The first run downloads card metadata from `scripts/source-cards.json` (fetch the gist once if missing):

```powershell
Invoke-WebRequest -Uri "https://gist.githubusercontent.com/OwenMelbz/e04dadf641cc9b81cb882b4612343112/raw/riftbound.json" -OutFile "scripts/source-cards.json"
npm run build:cards
```

## Deploy to GitHub Pages (any GitHub account)

1. Create a **new repository** on the GitHub account you want (not necessarily your work account).
2. Push this `riftbound-vault` folder to that repo.
3. In the repo: **Settings → Pages → Build and deployment → GitHub Actions** (or use the workflow below).
4. If the site URL is `https://<user>.github.io/<repo>/`, set the base path when building:

   ```bash
   # Example: repo name is riftbound-vault
   set VITE_BASE_PATH=/riftbound-vault/
   npm run build
   ```

   On Linux/macOS: `VITE_BASE_PATH=/riftbound-vault/ npm run build`

5. Publish the `dist/` folder (workflow does this automatically).

### Manual deploy

```bash
VITE_BASE_PATH=/your-repo-name/ npm run build
# Upload contents of dist/ to gh-pages branch or Pages artifact
```

The included workflow `.github/workflows/deploy.yml` builds with `VITE_BASE_PATH=/<repository-name>/` automatically.

## JSON format

```json
{
  "version": 1,
  "exportedAt": "2026-06-04T12:00:00.000Z",
  "collection": {
    "ogn-001-298": 2,
    "ogn-246-298": 1
  }
}
```

You can also import a plain object: `{ "ogn-001-298": 2 }`.

## Disclaimer

Fan project, not affiliated with Riot Games. Card data is aggregated from community sources; images are served from Riot’s public CDN. For commercial apps, follow [Riot’s Riftbound developer policy](https://developer.riotgames.com/docs/riftbound).
