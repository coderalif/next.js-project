export type Workout = {
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

// The API uses different names for some workout fields.
type ApiWorkout = {
  id: number;
  name: string;
  muscleGroups: string[];
  equipment: string;
  duration: number;
  caloriesBurned: number;
  rating: number;
  image: string;
  description: string;
  difficulty: string;
  sets: number;
  reps: string;
  instructions: string[];
};

const API_URL = "https://api.api-store.workers.dev/api/fitlog";
const API_CACHE = { cache: "force-cache" as RequestCache };

// Convert one API workout into the names used by the app.
function normalizeWorkout(data: ApiWorkout): Workout {
  return {
    id: String(data.id),
    name: data.name,
    tags: data.muscleGroups,
    equipment: data.equipment,
    duration: data.duration,
    calories: data.caloriesBurned,
    rating: data.rating,
    image: data.image,
    description: data.description,
    difficulty: data.difficulty,
    sets: data.sets,
    reps: data.reps,
    instructions: data.instructions,
  };
}

// Get every workout for the library and My Plan page.
export async function getWorkouts(): Promise<Workout[]> {
  const response = await fetch(API_URL, API_CACHE);
  if (!response.ok) throw new Error(`Workout API returned ${response.status}`);

  const data = (await response.json()) as ApiWorkout[];
  return data.map(normalizeWorkout);
}

// Get one workout for its detail page. A missing ID returns null for the 404 page.
export async function getWorkout(id: string): Promise<Workout | null> {
  const response = await fetch(`${API_URL}/${id}`, API_CACHE);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Workout API returned ${response.status}`);

  const data = (await response.json()) as ApiWorkout;
  return normalizeWorkout(data);
}
