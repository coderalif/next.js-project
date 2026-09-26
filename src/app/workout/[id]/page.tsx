import FitLogApp from "../../fitlog-app";

// Only catalog workout ids are valid detail routes; other slugs resolve to 404.
export const dynamicParams = false;

// Pre-render every workout detail page from the local catalog ids.
export function generateStaticParams() {
  return [
    "barbell-bench-press",
    "pull-up",
    "back-squat",
    "overhead-press",
    "dumbbell-bicep-curl",
    "hollow-body-plank",
    "conventional-deadlift",
    "push-up",
    "walking-lunge",
    "russian-twist",
    "barbell-row",
    "romanian-deadlift",
  ].map((id) => ({ id }));
}

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FitLogApp view="detail" workoutId={id} />;
}
