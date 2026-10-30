# BuildFlow Studio — Independent Edition

A standalone template-based app builder owned by Se Fire Tech. This product has no Base44 dependencies, runtime calls, account requirement, or subscription. It does not migrate or alter the existing BuildFlow production app or its records.

## Working first version

- Describe an idea and select a matching starter through a deterministic keyword router (not an AI model).
- Service-business website, portfolio, task tracker, and job cost calculator starters.
- Editable title, description, accent colour, contact email, and service/project titles.
- Full HTML/CSS/JavaScript source editor, isolated iframe preview, phone-width preview, duplication, and the last 10 snapshots per project.
- Browser-local projects with JSON backup/import and standalone HTML export.
- No model tokens or integration credits consumed by the template engine.

## Not connected

AI code generation, cloud accounts, server databases, collaboration, billing, and one-click deployment of generated apps are not implemented. They must not be presented as working. The existing Base44-dependent BuildFlow app remains separate. This is a functional independent foundation, not a completed full-platform migration or a finished AI app builder.

Generated pages and tools work locally or as static hosted HTML. Adding authentication, payments, cross-device records or other server features requires actual backend implementation and tests. Contact buttons prepare an email in the visitor's email application; they do not silently send messages. Service descriptions are editable placeholders; there are no invented testimonials or customer claims.

## Security and storage

The preview uses `sandbox="allow-scripts"` without same-origin, popups, downloads or top-navigation privileges. A restrictive CSP is prepended to the editable document to block resource loading and form submissions. Preview scripts have no access to the builder's local storage. Task templates catch unavailable storage and use memory inside the preview; exports use their own origin's local storage.

Source is editable user code, not a security-reviewed production application. Review exported code before hosting it. Never store model keys, payment secrets, authentication credentials, customer financial data or production data in browser projects, HTML exports, or JSON backups. Saved projects remain only on this device until exported; storage quota errors are reported. Local app data and backups can contain project details and contact information. Only import files you intend to trust and run inside the isolated preview.

## Build and deployment

Node 24. `npm test` runs the generator and export safety checks. `npm run build` writes public/. No external packages are needed. Vercel: framework Other, root `products/buildflow-independent`, output `public`, build `npm run build`. The `api/health` endpoint accurately reports which capabilities are connected.

## Next implementation stages

1. Choose and provision a verified identity provider and database; implement owner-scoped project access, founder access and tests.
2. Connect a model through a server-only API with per-user cost/rate limits and spend controls. Model use has costs unless self-hosted; self-hosting has infrastructure costs.
3. Add safe generated-file validation, revision diffs, isolated execution, user review, and deployment tests before any automated hosting workflow.
4. Add payment catalog, signed webhooks and tested subscription entitlements only after the intended account and price are selected.
5. Export and validate any wanted legacy records before cutting over the old BuildFlow app.
