# Polaris

**Jay's App Nexus** is a simple, static overview of Ajay's apps. The site has no build step or runtime dependencies.

## Preview

From the `public` directory, run `python3 -m http.server 8000` and open <http://localhost:8000>.

## Publish

Run `npm run deploy` from this directory. The Worker serves the static files in `public` at `ajay.nexus`, and redirects `ajay.nexus/polaris/` and `polaris.ajay.nexus` to the main address.

Update the app cards in `public/index.html` when an app's public URL or description changes.
