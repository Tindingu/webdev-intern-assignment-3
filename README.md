# G-Scores

G-Scores is a full-stack dashboard for the Golden Owl web developer intern assignment. It imports Vietnam THPT 2024 exam scores into PostgreSQL and provides a polished interface for score lookup, subject analytics, and top rankings by exam group.

The application is designed for a large, mostly static dataset with more than 1 million exam records. Heavy aggregations are precomputed after seeding, so dashboard APIs stay fast and lightweight in production.

## Preview

### Score Lookup

Search by registration number and view subject scores with level classification.

![Score lookup](./images/trang-tra-cuu.png)

### Reports Dashboard

Explore score distribution across subjects through precomputed charts and summary cards.

![Reports dashboard overview](./images/trang-bao-cao-1.png)
![Reports dashboard charts](./images/trang-bao-cao-2.png)
![Reports dashboard details](./images/trang-bao-cao-3.png)

### Top Exam Groups

View top 10 students for groups A, B, C, and D. Students with the same total score share the same medal color.

![Top 10 group A](./images/top10-khoi-a.png)
![Top 10 group B](./images/top10-khoi-b.png)
![Top 10 group C](./images/top10-khoi-c.png)
![Top 10 group D](./images/top10-khoi-d.png)

### Theme And Language

The UI supports light/dark mode and Vietnamese/English switching.

![English interface](./images/giao-dien-tieng-anh.png)
![Dark interface](./images/giao-dien-toi.png)

## Main Features

- Import `diem_thi_thpt_2024.csv` into PostgreSQL with Prisma migrations and seed script.
- Search exam scores by registration number with validation.
- Report score distribution by subject across 4 levels:
  - `>= 8`
  - `>= 6 and < 8`
  - `>= 4 and < 6`
  - `< 4`
- Display charts for subject-level statistics.
- Display top 10 rankings for exam groups A/B/C/D.
- Vietnamese-first app routes:
  - `/tra-cuu`
  - `/bao-cao`
  - `/top-khoi-thi`
- Responsive dashboard layout for desktop, tablet, and mobile.
- Light/dark mode and Vietnamese/English language switching.
- Unit tests for domain logic, validation, group lookup, and ranking medals.

## Technical Highlights

- **OOP subject layer**: `Subject` encapsulates subject metadata and behavior such as score extraction, validation, and classification.
- **TypeScript**: used across frontend, backend routes, Prisma seed scripts, and tests.
- **ORM**: Prisma manages schema, migrations, and database access.
- **Precision-safe scores**: scores are stored as PostgreSQL `Decimal(4,2)` instead of floating point numbers.
- **Precomputed reports**:
  - `score_reports` stores subject-level distribution counts.
  - `top_group_reports` stores top rankings for groups A/B/C/D.
- **Production-ready deployment flow**: Next.js app on Vercel with PostgreSQL on Neon.

## Tech Stack

- Next.js App Router
- React Hooks
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Recharts
- Zod
- Vitest

## Data Design

Runtime report APIs do not scan the full `exam_results` table.

- `exam_results`: one row per student, nullable decimal score columns for each subject.
- `score_reports`: precomputed subject score-level reports.
- `top_group_reports`: precomputed top 10 rankings for groups A/B/C/D.

The CSV import is intentionally handled by a local seed script because the dataset is large and mostly static.

## Getting Started

Copy the environment file:

```bash
cp .env.example .env
```

Set `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Install dependencies:

```bash
npm install
```

Create the database schema:

```bash
npm run db:migrate
```

Import the CSV data and generate precomputed reports:

```bash
npm run db:seed
```

If an import is interrupted, resume from an existing row count:

```bash
SEED_SKIP_ROWS=1060000 npm run db:seed
```

Run the app locally:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

The root route redirects to `/tra-cuu`.

For LAN testing on another device, set comma-separated dev origins in `.env`:

```env
ALLOWED_DEV_ORIGINS="YOUR_LAN_IP"
```

## Useful Commands

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
npm run lint
npm run test
npm run build
```

## Vercel Deployment

1. Create a PostgreSQL database on Neon, Supabase, or another Vercel-compatible provider.
2. Add the production `DATABASE_URL` to the Vercel project environment variables.
3. Run migrations against the production database:

```bash
npx prisma migrate deploy
```

4. Seed the production database from your local machine using the production `DATABASE_URL`:

```bash
npm run db:seed
```

5. Deploy the project to Vercel.

## Project Structure

```txt
prisma/
  schema.prisma
  seed.ts
src/
  app/
    api/
      students/[sbd]/route.ts
      reports/score-levels/route.ts
      reports/top-groups/route.ts
    tra-cuu/page.tsx
    bao-cao/page.tsx
    top-khoi-thi/page.tsx
  components/
  lib/
    subjects/
tests/
  unit/
images/
dataset/
  diem_thi_thpt_2024.csv
```
