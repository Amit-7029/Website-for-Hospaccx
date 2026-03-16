# Website-for-Hospaccx

Website project for **Banerjee Diagnostic Foundation and Hospaccx** with two runnable targets in one repository.

## Current Versions

- Spring Boot app version: `1.0-SNAPSHOT`
- Spring Boot: `3.2.2`
- Java: `17`
- Vercel frontend version: `1.0.0`
- Node.js: `20+` recommended
- Vite: `7.x`

## Project Structure

- `src/`
  Spring Boot MVC app with Thymeleaf templates, H2 persistence, and the original local deployment flow.
- `frontend/`
  Vercel-friendly static frontend built with Vite. This is the version intended for Vercel deployment.

## Run Locally

Spring Boot version:

```bat
run-website.bat
```

Open:

- `http://localhost:8081`

Vercel-friendly frontend:

```bat
run-vercel-frontend.bat
```

Open:

- `http://localhost:5173`

## Deploy to Vercel

Use the `frontend/` folder as the Vercel project root.

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

Important:

- `frontend/vercel.json` includes an SPA rewrite to `index.html`
- all doctor, department, and gallery data are rendered client-side
- the appointment flow redirects to WhatsApp instead of posting to Spring Boot

## Project Notes

- Backend app: Spring Boot MVC + Thymeleaf + H2
- Vercel app: static Vite frontend
- Shared content: clinic branding, doctor directory, services, gallery, contact details
- Appointment flow: WhatsApp booking redirect

## Versioning

Recommended release approach:

1. Use semantic versions for both app targets
2. Bump `pom.xml` when releasing the Spring Boot app
3. Bump `frontend/package.json` when releasing the Vercel frontend
4. Tag releases in Git

Example:

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Repository

- GitHub: `https://github.com/Amit-7029/Website-for-Hospaccx`
