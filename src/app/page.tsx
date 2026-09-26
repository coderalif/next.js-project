import FitLogApp from "./fitlog-app";

// The client loads the library and owns its loading state.
export default function Home() {
  return <FitLogApp view="home" workouts={[]} />;
}
