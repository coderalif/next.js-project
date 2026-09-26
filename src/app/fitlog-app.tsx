"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWorkouts, type Workout } from "../lib/workouts";

const heroImage =
  "https://img.magnific.com/free-photo/portrait-anime-character-doing-fitness-exercising_23-2151666664.jpg?w=740";

type View = "home" | "plan" | "detail";

// Restore saved IDs and convert old name-based IDs to the API's numeric IDs.
const readList = (key: string, workouts: Workout[]): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(stored)) return [];

    const ids: string[] = [];
    for (const value of stored) {
      if (typeof value !== "string") continue;

      let id = value;
      if (workouts.length > 0) {
        const workout = workouts.find(
          (item) =>
            item.id === value ||
            item.name.toLowerCase().replaceAll(" ", "-") === value,
        );
        if (!workout) continue;
        id = workout.id;
      }

      if (!ids.includes(id)) ids.push(id);
      if (key === "fitlog-plan" && ids.length === 5) break;
    }

    return ids;
  } catch {
    return [];
  }
};

// Reuse the last API response when the service is temporarily unavailable.
function readWorkoutCache(): Workout[] {
  try {
    const saved = JSON.parse(localStorage.getItem("fitlog-workouts") || "[]");
    if (!Array.isArray(saved)) return [];

    return saved.filter(
      (item): item is Workout =>
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        Array.isArray(item.tags),
    );
  } catch {
    return [];
  }
}

// Keep the current page usable even if browser storage cannot be written.
function saveWorkoutCache(workouts: Workout[]) {
  try {
    localStorage.setItem("fitlog-workouts", JSON.stringify(workouts));
  } catch {
    // The API response is still used for this visit.
  }
}

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

function WorkoutLoading() {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div>
        <div className="spinner" />
        <p>LOADING WORKOUTS...</p>
      </div>
    </div>
  );
}

// Sort workouts by the option selected in the dropdown.
function sortWorkouts(workouts: Workout[], sort: string): Workout[] {
  const sorted = [...workouts];

  if (sort === "calories") {
    return sorted.sort((first, second) => second.calories - first.calories);
  }
  if (sort === "rating") {
    return sorted.sort((first, second) => second.rating - first.rating);
  }
  return sorted.sort((first, second) => first.duration - second.duration);
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

// Home page hero, sorting control, and workout grid.
function Home({
  workouts,
  loading,
  error,
}: {
  workouts: Workout[];
  loading: boolean;
  error: string;
}) {
  const [sort, setSort] = useState("duration");
  const [query, setQuery] = useState("");

  // Search by workout name or muscle group, then apply the selected sort order.
  const matchingWorkouts = workouts.filter((item) =>
    `${item.name} ${item.tags.join(" ")}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const ordered = sortWorkouts(matchingWorkouts, sort);
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
              <img
                src={workouts[0]?.image || heroImage}
                alt="Athlete training with a barbell"
              />
            </div>
          </div>
        </section>
        <section className="library" id="library">
          <div className="section-head">
            <div>
              <h2 className="display">THE LIBRARY</h2>
              <p>Twelve lifts covering every major muscle group.</p>
            </div>
            <div className="library-controls">
              <label className="search-field">
                <span className="visually-hidden">
                  Search workouts by name or muscle group
                </span>
                <input
                  className="search-input"
                  type="search"
                  placeholder="Search workouts"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <label className="sort">
                Sort by{" "}
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="duration">Duration</option>
                  <option value="calories">Calories</option>
                  <option value="rating">Rating</option>
                </select>
              </label>
            </div>
          </div>
          {loading ? (
            <WorkoutLoading />
          ) : error ? (
            <div className="empty">
              <h2 className="display">WORKOUTS UNAVAILABLE</h2>
              <p>{error}</p>
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
  workouts,
  loading,
  error,
  onRemove,
  onDone,
}: {
  planIds: string[];
  savedIds: string[];
  workouts: Workout[];
  loading: boolean;
  error: string;
  onRemove: (id: string) => void;
  onDone: (id: string) => void;
}) {
  const [tab, setTab] = useState<"plan" | "saved">("plan");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("duration");
  const ids = tab === "plan" ? planIds : savedIds;

  // Resolve stored ids into workout records and ignore ids no longer in the catalog.
  const items = ids
    .map((id) => workouts.find((item) => item.id === id))
    .filter(Boolean) as Workout[];
  // Search and sort only the items in the selected tab.
  const matchingItems = items.filter((item) =>
    `${item.name} ${item.tags.join(" ")}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const filteredItems = sortWorkouts(matchingItems, sort);
  const minutes = planIds.reduce(
    (sum, id) =>
      sum + (workouts.find((item) => item.id === id)?.duration || 0),
    0,
  );
  const calories = planIds.reduce(
    (sum, id) =>
      sum + (workouts.find((item) => item.id === id)?.calories || 0),
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
            onClick={() => setTab("plan")}
          >
            Today&apos;s Plan
          </button>
          <button
            className={`tab ${tab === "saved" ? "active" : ""}`}
            onClick={() => setTab("saved")}
          >
            Saved
          </button>
        </div>
        <div className="plan-tools">
          <label className="search-field">
            <span className="visually-hidden">
              Search {tab === "plan" ? "planned" : "saved"} workouts
            </span>
            <input
              className="search-input"
              type="search"
              placeholder="Search workouts"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label className="sort">
            Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="duration">Duration</option>
              <option value="calories">Calories</option>
              <option value="rating">Rating</option>
            </select>
          </label>
          <span className="plan-count">
            {items.length} {tab === "plan" ? "planned" : "saved"}
          </span>
        </div>
      </div>
      {loading ? (
        <WorkoutLoading />
      ) : error ? (
        <div className="empty">
          <h2 className="display">WORKOUTS UNAVAILABLE</h2>
          <p>{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty">
          <h2 className="display">NOTHING HERE YET</h2>
          <p>Browse the library and add a lift to get today moving.</p>
          <Link className="lime-btn" href="/">
            Go to workouts
          </Link>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="empty">
          <h2 className="display">NO MATCHING WORKOUTS</h2>
          <p>Try another name or muscle group.</p>
        </div>
      ) : (
        <div className="plan-list">
          {filteredItems.map((item) => (
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
  disableAdd,
  onAdd,
  onSave,
}: {
  item: Workout;
  disableAdd: boolean;
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
            <button
              className="lime-btn"
              onClick={onAdd}
              disabled={disableAdd}
              title={disableAdd ? "Already planned or today's plan is full" : undefined}
            >
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
  workouts: initialWorkouts,
  workout,
  workoutId,
  detailError,
}: {
  view: View;
  workouts: Workout[];
  workout?: Workout;
  workoutId?: string;
  detailError?: string;
}) {
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const [workoutsError, setWorkoutsError] = useState("");
  const workoutsLoading =
    view !== "detail" && workouts.length === 0 && !workoutsError;
  // Start consistently on the server and browser, then restore local data after hydration.
  const [planIds, setPlanIds] = useState<string[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");

  // Load workout data for the library and plan pages.
  useEffect(() => {
    if (view === "detail") {
      if (!workout && workouts.length === 0) {
        const restore = window.setTimeout(() => {
          setWorkouts(readWorkoutCache());
        }, 0);
        return () => window.clearTimeout(restore);
      }
      return;
    }
    if (workouts.length > 0) return;

    let active = true;
    getWorkouts()
      .then((data) => {
        // Ignore the response if the user has left this page.
        if (!active) return;
        if (data.length === 0) {
          setWorkoutsError("The workout API returned an empty list.");
          return;
        }
        saveWorkoutCache(data);
        setWorkouts(data);
      })
      .catch(() => {
        if (!active) return;
        const savedWorkouts = readWorkoutCache();
        if (savedWorkouts.length > 0) {
          setWorkouts(savedWorkouts);
        } else {
          setWorkoutsError("Please refresh to try loading again.");
        }
      });

    return () => {
      active = false;
    };
  }, [view, workout, workouts.length]);

  // Restore the saved plan after the browser has loaded.
  useEffect(() => {
    const restore = window.setTimeout(() => {
      setPlanIds(readList("fitlog-plan", workouts));
      setSavedIds(readList("fitlog-saved", workouts));
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(restore);
  }, [workouts]);

  // Save plan changes in the browser so they survive a reload.
  useEffect(() => {
    if (hydrated) localStorage.setItem("fitlog-plan", JSON.stringify(planIds));
  }, [hydrated, planIds]);

  // Save the later list in the browser too.
  useEffect(() => {
    if (hydrated)
      localStorage.setItem("fitlog-saved", JSON.stringify(savedIds));
  }, [hydrated, savedIds]);

  // Show short-lived feedback after plan actions.
  const notify = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(""), 2400);
  };
  const item =
    workout || workouts.find((savedWorkout) => savedWorkout.id === workoutId);

  // Add a workout only once and enforce the five-exercise daily limit.
  const add = () => {
    if (!item) return;
    if (planIds.includes(item.id)) return notify("Already in today's plan");
    if (planIds.length >= 5) return notify("Today's plan is full");
    setPlanIds((value) => [...value, item.id]);
    notify("Added to today's plan");
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
      {view === "home" && (
        <Home
          workouts={workouts}
          loading={workoutsLoading}
          error={workoutsError}
        />
      )}
      {view === "plan" && (
        <Plan
          planIds={planIds}
          savedIds={savedIds}
          workouts={workouts}
          loading={workoutsLoading}
          error={workoutsError}
          onRemove={remove}
          onDone={done}
        />
      )}
      {view === "detail" && item && (
        <Detail
          item={item}
          disableAdd={planIds.length >= 5 || planIds.includes(item.id)}
          onAdd={add}
          onSave={save}
        />
      )}
      {view === "detail" && detailError && !item && (
        <main className="shell page">
          <div className="empty">
            <h1 className="display">WORKOUT UNAVAILABLE</h1>
            <p>{detailError}</p>
            <Link className="lime-btn" href="/">
              Go to workouts
            </Link>
          </div>
        </main>
      )}
      <Footer />
      {toast && <div className="toast">{toast}</div>}{" "}
    </>
  );
}
