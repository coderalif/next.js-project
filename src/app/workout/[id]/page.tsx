import FitLogApp from "../../fitlog-app";
import { notFound } from "next/navigation";
import { getWorkout } from "../../../lib/workouts";

// Load one workout and show the not-found page for an unknown ID.
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let workout;
  try {
    workout = await getWorkout(id);
  } catch {
    return (
      <FitLogApp
        view="detail"
        workouts={[]}
        detailError="Workout details are temporarily unavailable. Please try again shortly."
      />
    );
  }

  if (!workout) notFound();

  return <FitLogApp view="detail" workout={workout} workouts={[]} />;
}
