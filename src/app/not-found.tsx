import Link from "next/link";

// Shared fallback for unknown routes and invalid workout paths.
export default function NotFound() {
  return (
    <main className="shell page">
      <span className="eyebrow">404 / ROUTE NOT FOUND</span>
      <h1 className="display page-title">NOTHING TO LOG HERE.</h1>
      <p className="page-subtitle">
        That route does not exist. Head back to the workout library.
      </p>
      <br />
      <Link className="lime-btn" href="/">
        Go to workouts
      </Link>
    </main>
  );
}
