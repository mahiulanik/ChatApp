import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkLoaded, ClerkLoading, ClerkProvider } from "@clerk/react";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { clerkAppearance, clerkLocalization } from "./lib/clerkAppearance.js";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  createRoot(document.getElementById("root")).render(
    <div style={{ padding: 32, fontFamily: "system-ui", lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 18 }}>Clerk key missing</h1>
      <p>
        Add <code>VITE_CLERK_PUBLISHABLE_KEY</code> to <code>frontend/.env</code> and
        restart the dev server.
      </p>
    </div>,
  );
} else {
  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <ClerkProvider
        publishableKey={publishableKey}
        appearance={clerkAppearance}
        localization={clerkLocalization}
      >
        <BrowserRouter>
          <ThemeProvider>
            <ChatProvider>
              <ClerkLoading>
                <LoadingScreen />
              </ClerkLoading>
              <ClerkLoaded>
                <App />
              </ClerkLoaded>
            </ChatProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ClerkProvider>
    </StrictMode>,
  );
}
