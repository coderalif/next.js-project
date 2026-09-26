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
  const workout = await getWorkout(id);
  if (!workout) notFound();

  return <FitLogApp view="detail" workout={workout} workouts={[]} />;
}
