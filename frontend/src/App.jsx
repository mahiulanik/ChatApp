import { useAuth } from "@clerk/react";
import { Navigate, Route, Routes } from "react-router";
import LoadingScreen from "./components/LoadingScreen";
import { useTheme } from "./context/ThemeContext";
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
  const { wallpaper } = useTheme();

  return (
    <>
      {wallpaper && <div className="wallpaper" aria-hidden="true" />}
      <div
        className={
          wallpaper
            ? "relative z-10 m-1.5 h-[calc(100dvh-12px)] overflow-hidden rounded-2xl border border-line shadow-2xl"
            : "relative z-10 h-[100dvh]"
        }
      >
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
    </>
  );
}
