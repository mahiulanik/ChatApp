import { useAuth } from "@clerk/react";
import { Navigate, Route, Routes } from "react-router";
import LoadingScreen from "./components/LoadingScreen";
import Home from "./pages/Home";
import Landing from "./pages/Landing";

function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <Navigate to="/" replace />;
  return children;
}

function OnlyWhenSignedOut({ children }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingScreen />;
  if (isSignedIn) return <Navigate to="/home" replace />;
  return children;
}

export default function App() {
  // Fullscreen always — the wallpaper inset frame was removed with its toggle.
  return (
    <div className="relative z-10 h-[100dvh]">
      <Routes>
        <Route
          path="/"
          element={
            <OnlyWhenSignedOut>
              <Landing />
            </OnlyWhenSignedOut>
          }
        />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
