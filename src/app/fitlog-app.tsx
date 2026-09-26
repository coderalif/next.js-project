"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Workout = {
  id: string;
  name: string;
  tags: string[];
  equipment: string;
  duration: number;
  calories: number;
  rating: number;
  image: string;
  description: string;
  difficulty: string;
  sets: number;
  reps: string;
  instructions: string[];
};

// Reuse a small image set across the library so the cards stay visually consistent.
const images = [
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85",
];

// These arrays provide the local workout catalog used by the home and detail pages.
const names = [
  "Barbell Bench Press",
  "Pull-Up",
  "Back Squat",
  "Overhead Press",
  "Dumbbell Bicep Curl",
  "Hollow-Body Plank",
  "Conventional Deadlift",
  "Push-Up",
  "Walking Lunge",
  "Russian Twist",
  "Barbell Row",
  "Romanian Deadlift",
];

// Build complete workout records from the catalog values above.
const workoutData: Workout[] = names.map((name, i) => ({
  id: name.toLowerCase().replaceAll(" ", "-"),
  name,
  tags: [
    ["Chest", "Arms"],
    ["Back", "Arms"],
    ["Legs", "Core"],
    ["Shoulders", "Arms"],
    ["Arms"],
    ["Core"],
    ["Back", "Legs"],
    ["Chest", "Arms", "Core"],
    ["Legs"],
    ["Core"],
    ["Back"],
    ["Legs"],
  ][i],
  equipment: [
    "Barbell, Bench",
    "Pull-up Bar",
    "Barbell, Rack",
    "Barbell",
    "Dumbbells",
    "Bodyweight",
    "Barbell",
    "Bodyweight",
    "Dumbbells (optional)",
    "Medicine Ball",
    "Barbell",
    "Barbell",
  ][i],
  duration: [25, 15, 30, 20, 12, 10, 28, 10, 18, 8, 18, 26][i],
  calories: [180, 120, 240, 150, 80, 60, 260, 90, 170, 70, 160, 230][i],
  rating: [4.8, 4.7, 4.9, 4.6, 4.3, 4.4, 4.9, 4.5, 4.4, 4.1, 4.7, 4.8][i],
  image: images[i % images.length],
  description:
    i === 0
      ? "A compound press that builds chest thickness, triceps, and pressing power from a stable bench."
      : `A focused ${name.toLowerCase()} session built to make every rep count.`,
  difficulty: i % 3 === 0 ? "Intermediate" : "Beginner",
  sets: 4,
  reps: i % 2 ? "8-12" : "6-8",
  instructions: [
    "Set your position with a braced core and steady breathing.",
    "Move through a controlled range and keep the target muscles loaded.",
    "Pause briefly at the hardest point without losing your shape.",
    "Return to the start, reset, and repeat with intent.",
  ],
}));

type View = "home" | "plan" | "detail";

// Read saved workout ids safely on both the server and the browser.
const readList = (key: string): string[] => {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

// Shared navigation with live plan and saved counters.
function Header({
  view,
  planCount,
  savedCount,
}: {
  view: View;
  planCount: number;
  savedCount: number;
}) {
  return (
    <header className="topbar">
      <div className="shell nav">
        <Link href="/" className="brand">
          <span className="brand-mark">✣</span> FITLOG
        </Link>
        <nav className="nav-links">
          <Link
            className={`nav-link ${view === "home" ? "active" : ""}`}
            href="/"
          >
            Workouts
          </Link>
          <Link
            className={`nav-link ${view === "plan" ? "active" : ""}`}
            href="/my-plan"
          >
            My Plan
          </Link>
        </nav>
        <div className="badges">
          <Link href="/my-plan" className="badge plan">
            Plan <b>{planCount}</b>
          </Link>
          <Link href="/my-plan" className="badge">
            Saved <b>{savedCount}</b>
          </Link>
        </div>
      </div>
    </header>
  );
}

// Keep the footer consistent across home, plan, and detail pages.
function Footer() {
  return (
    <footer className="footer">
      <div className="shell nav">
        <div className="brand">
          <span className="brand-mark">✣</span> FITLOG
        </div>
        <span>© 2026 FitLog — Workout Library. Train hard, log honest.</span>
      </div>
    </footer>
  );
}

// Display the same duration, calorie, and rating information on every workout surface.
function Stats({ item }: { item: Workout }) {
  return (
    <div className="stats">
      <span>
        <i className="stat-icon">◷</i>
        {item.duration} min
      </span>
      <span>
        <i className="stat-icon">♨</i>
        {item.calories} kcal
      </span>
      <span>
        <i className="stat-icon">☆</i>
        {item.rating}
      </span>
    </div>
  );
}

// A library card links directly to the selected workout detail route.
function Card({ item }: { item: Workout }) {
  return (
    <Link className="workout-card" href={`/workout/${item.id}`}>
      <img className="card-image" src={item.image} alt={item.name} />
      <div className="card-content">
        <div className="tags">
          {item.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <h3 className="display">{item.name.toUpperCase()}</h3>
        <div className="equipment">{item.equipment}</div>
        <Stats item={item} />
      </div>
    </Link>
  );
}

// Home page hero, loading state, sorting control, and workout grid.
function Home({ onSort }: { onSort: (value: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("duration");

  // Keep the loading state visible briefly while the library is prepared.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Sort a copy so the original catalog order remains unchanged.
  const ordered = useMemo(
    () =>
      [...workoutData].sort((a, b) =>
        sort === "calories"
          ? b.calories - a.calories
          : sort === "rating"
            ? b.rating - a.rating
            : a.duration - b.duration,
      ),
    [sort],
  );
  return (
    <>
      <main className="shell">
        <section className="hero">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">WORKOUT LIBRARY</span>
              <h1 className="display">
                TRAIN WITH INTENT.
                <br />
                LOG EVERY SET.
              </h1>
              <p>
                FitLog is a dark, no-nonsense gym companion: pick a lift, lock
                it into today&apos;s plan, and watch the week&apos;s work add
                up.
              </p>
              <a className="lime-btn" href="#library">
                ↘ &nbsp; Browse workouts
              </a>
            </div>
            <div className="hero-media">
              <img src={images[0]} alt="Athlete training with a barbell" />
            </div>
          </div>
        </section>
        <section className="library" id="library">
          <div className="section-head">
            <div>
              <h2 className="display">THE LIBRARY</h2>
              <p>Twelve lifts covering every major muscle group.</p>
            </div>
            <label className="sort">
              Sort by{" "}
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  onSort(e.target.value);
                }}
              >
                <option value="duration">Duration</option>
                <option value="calories">Calories</option>
                <option value="rating">Rating</option>
              </select>
            </label>
          </div>
          {loading ? (
            <div className="loading">
              <div>
                <div className="spinner" />
                <p>LOADING WORKOUTS...</p>
              </div>
            </div>
          ) : (
            <div className="card-grid">
              {ordered.map((item) => (
                <Card key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

// Plan page for today's exercises and the saved-for-later tab.
function Plan({
  planIds,
  savedIds,
  onRemove,
  onDone,
  onTab,
}: {
  planIds: string[];
  savedIds: string[];
  onRemove: (id: string) => void;
  onDone: (id: string) => void;
  onTab: (tab: "plan" | "saved") => void;
}) {
  const [tab, setTab] = useState<"plan" | "saved">("plan");
  const ids = tab === "plan" ? planIds : savedIds;

  // Resolve stored ids into workout records and ignore ids no longer in the catalog.
  const items = ids
    .map((id) => workoutData.find((item) => item.id === id))
    .filter(Boolean) as Workout[];
  const minutes = planIds.reduce(
    (sum, id) => sum + (workoutData.find((x) => x.id === id)?.duration || 0),
    0,
  );
  const calories = planIds.reduce(
    (sum, id) => sum + (workoutData.find((x) => x.id === id)?.calories || 0),
    0,
  );

  // Summary values are calculated from today's plan only.
  return (
    <main className="shell page">
      <div>
        <h1 className="display page-title">MY PLAN</h1>
        <p className="page-subtitle">
          Cap of five lifts for today. Finish them, then load more.
        </p>
      </div>
      <div className="metrics">
        <div className="metric">
          <small>Exercises</small>
          <strong>{planIds.length}</strong>
        </div>
        <div className="metric">
          <small>Minutes</small>
          <strong>{minutes}</strong>
        </div>
        <div className="metric">
          <small>Calories</small>
          <strong>{calories}</strong>
        </div>
      </div>
      <div className="tabs-row">
        <div className="tabs">
          <button
            className={`tab ${tab === "plan" ? "active" : ""}`}
            onClick={() => {
              setTab("plan");
              onTab("plan");
            }}
          >
            Today&apos;s Plan
          </button>
          <button
            className={`tab ${tab === "saved" ? "active" : ""}`}
            onClick={() => {
              setTab("saved");
              onTab("saved");
            }}
          >
            Saved
          </button>
        </div>
        <span className="sort">
          {items.length} {tab === "plan" ? "planned" : "saved"}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="empty">
          <h2 className="display">NOTHING HERE YET</h2>
          <p>Browse the library and add a lift to get today moving.</p>
          <Link className="lime-btn" href="/">
            Go to workouts
          </Link>
        </div>
      ) : (
        <div className="plan-list">
          {items.map((item) => (
            <article className="plan-card" key={item.id}>
              <img src={item.image} alt="" />
              <div>
                <h3 className="display">{item.name.toUpperCase()}</h3>
                <div className="equipment">{item.equipment}</div>
                <Stats item={item} />
              </div>
              <div className="plan-actions">
                <a className="outline-btn" href={`/workout/${item.id}`}>
                  View details
                </a>
                {tab === "plan" && (
                  <button className="lime-btn" onClick={() => onDone(item.id)}>
                    ✓ Mark as done
                  </button>
                )}
                <button
                  className="icon-btn"
                  aria-label="Remove"
                  onClick={() => onRemove(item.id)}
                >
                  ×
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

// Detail page with workout specs, instructions, and plan actions.
function Detail({
  item,
  onAdd,
  onSave,
}: {
  item: Workout;
  onAdd: () => void;
  onSave: () => void;
}) {
  return (
    <main className="shell page">
      <div className="detail-grid">
        <div className="detail-visual">
          <img src={item.image} alt={item.name} />
        </div>
        <div className="detail-copy">
          <div className="tags">
            {item.tags.map((tag) => (
              <span className="tag" key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <h1 className="display">{item.name.toUpperCase()}</h1>
          <p>{item.description}</p>
          <div className="specs">
            {[
              ["EQUIPMENT", item.equipment],
              ["DIFFICULTY", item.difficulty],
              ["SETS", item.sets],
              ["REPS", item.reps],
              ["DURATION", `${item.duration} min`],
              ["CALORIES", `${item.calories} kcal`],
              ["RATING", item.rating],
            ].map(([label, value]) => (
              <div className="spec-row" key={label}>
                <b>{label}</b>
                <span>{value}</span>
              </div>
            ))}
          </div>
          <div className="instructions">
            <h2>INSTRUCTIONS</h2>
            <ol>
              {item.instructions.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>
          <div className="detail-actions">
            <button className="lime-btn" onClick={onAdd}>
              ▣ &nbsp; Add to today&apos;s plan
            </button>
            <button className="outline-btn" onClick={onSave}>
              ♡ &nbsp; Save for later
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function FitLogApp({
  view,
  workoutId,
}: {
  view: View;
  workoutId?: string;
}) {
  // Start consistently on the server and browser, then restore local data after hydration.
  const [planIds, setPlanIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const restore = window.setTimeout(() => {
      setPlanIds(readList("fitlog-plan"));
      setSavedIds(readList("fitlog-saved"));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("fitlog-plan", JSON.stringify(planIds));
  }, [hydrated, planIds]);

  useEffect(() => {
    if (hydrated)
      localStorage.setItem("fitlog-saved", JSON.stringify(savedIds));
  }, [hydrated, savedIds]);

  // Show short-lived feedback after plan actions.
  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  };
  const item = workoutData.find((x) => x.id === workoutId);

  // Add a workout only once and enforce the five-exercise daily limit.
  const add = () => {
    if (!item) return;
    if (planIds.includes(item.id)) return notify("Already in today's plan");
    if (planIds.length >= 5) return notify("Today&apos;s plan is full");
    setPlanIds((value) => [...value, item.id]);
    notify("Added to today&apos;s plan");
  };

  // Save a workout for later without creating duplicate saved entries.
  const save = () => {
    if (!item) return;
    if (savedIds.includes(item.id)) return notify("Already saved for later");
    setSavedIds((value) => [...value, item.id]);
    notify("Saved for later");
  };

  // Remove an item from both lists so the user can reset its saved state.
  const remove = (id: string) => {
    setPlanIds((value) => value.filter((x) => x !== id));
    setSavedIds((value) => value.filter((x) => x !== id));
    notify("Workout removed");
  };

  // Completing a planned workout removes it from today's active list.
  const done = (id: string) => {
    setPlanIds((value) => value.filter((x) => x !== id));
    notify("Workout marked as done");
  };
  return (
    <>
      <Header
        view={view}
        planCount={planIds.length}
        savedCount={savedIds.length}
      />
      {view === "home" && <Home onSort={() => {}} />}
      {view === "plan" && (
        <Plan
          planIds={planIds}
          savedIds={savedIds}
          onRemove={remove}
          onDone={done}
          onTab={() => {}}
        />
      )}
      {view === "detail" && item && (
        <Detail item={item} onAdd={add} onSave={save} />
      )}
      <Footer />
      {toast && <div className="toast">{toast}</div>}{" "}
    </>
  );
}
