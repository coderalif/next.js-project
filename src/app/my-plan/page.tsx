import FitLogApp from "../fitlog-app";

// The plan route reuses the shared app with the plan view selected.
export default function MyPlanPage() {
  return <FitLogApp view="plan" />;
}
