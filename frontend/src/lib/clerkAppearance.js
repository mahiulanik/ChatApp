/**
 * Clerk appearance + localization so the auth UI matches the app theme
 * (see "Sign In Modal by Clerk.png" and "Sign Out Modal By Clerk.png").
 *
 * Surfaces use the dedicated --auth-* tokens from index.css so the card,
 * inputs and buttons keep proper contrast in BOTH dark and light mode.
 * Style objects are used (not class strings) so they always win over
 * Clerk's internal stylesheet.
 */
import { APP_NAME } from "./constants";

const fontFamily =
  '"Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const clerkAppearance = {
  variables: {
    fontFamily,
    colorBackground: "var(--auth-card)",
    colorText: "var(--text)",
    colorTextSecondary: "var(--muted)",
    colorPrimary: "var(--accent)",
    colorDanger: "#e5484d",
    colorSuccess: "#2fb344",
    colorNeutral: "var(--muted)",
    colorInputBackground: "var(--auth-input)",
    colorInputText: "var(--text)",
    borderRadius: "12px",
  },
  elements: {
    // ---- modal shell
    modalBackdrop: {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      backdropFilter: "blur(4px)",
    },
    modalContent: {
      borderRadius: "18px",
    },
    card: {
      backgroundColor: "var(--auth-card)",
      border: "1px solid var(--auth-card-border)",
      borderRadius: "18px",
      boxShadow: "var(--auth-shadow)",
      overflow: "hidden",
    },
    headerTitle: { color: "var(--text)", fontWeight: 700 },
    headerSubtitle: { color: "var(--muted)" },
    // form region: no border/shadow so nothing separates it from the row below
    main: { border: "none", boxShadow: "none" },

    // ---- social + email
    socialButtonsBlockButton: {
      backgroundColor: "var(--auth-social)",
      border: "1px solid var(--auth-card-border)",
      borderRadius: "12px",
      color: "var(--text)",
    },
    socialButtonsBlockButtonIcon: { color: "var(--text)" },
    dividerLine: { backgroundColor: "var(--auth-input-border)" },
    dividerText: { color: "var(--muted)" },
    formFieldLabel: { color: "var(--text)" },
    formFieldInput: {
      backgroundColor: "var(--auth-input)",
      border: "1px solid var(--auth-input-border)",
      borderRadius: "12px",
      color: "var(--text)",
    },
    formButtonPrimary: {
      backgroundColor: "var(--cta-bg)",
      color: "var(--cta-fg)",
      fontWeight: 600,
      borderRadius: "12px",
    },

    // ---- sign-up row: transparent so it flows directly under the Continue
    //      button and the whole card reads as one single box
    footer: {
      backgroundColor: "transparent",
      border: "none",
    },
    footerAction: {
      backgroundColor: "transparent",
      border: "none",
      borderRadius: "0",
    },
    footerActionLink: { color: "var(--text)", fontWeight: 600 },
    // "Secured by Clerk" + "Development mode" branding — hidden on purpose.
    footerItem: { display: "none" },
    footerPages: { display: "none" },

    // ---- user button (avatar menu — "Sign Out Modal By Clerk.png")
    avatarBox: { width: "36px", height: "36px" },
    userButtonPopoverRootBox: { borderRadius: "18px" },
    userButtonPopoverCard: {
      backgroundColor: "var(--auth-card)",
      border: "1px solid var(--auth-card-border)",
      borderRadius: "18px",
      boxShadow: "var(--auth-shadow)",
      overflow: "hidden",
    },
    userButtonPopoverMain: { backgroundColor: "var(--auth-card)" },
    userButtonPopoverActionButton: {
      backgroundColor: "transparent",
      color: "var(--text)",
    },
    userButtonPopoverActionButtonIcon: { color: "var(--muted)" },
    userButtonPopoverFooter: {
      // "Secured by Clerk" / "Development mode" band — hidden on purpose.
      display: "none",
    },
    userPreviewMainIdentifier: { color: "var(--text)" },
    userPreviewSecondaryIdentifier: { color: "var(--muted)" },
  },
};

export const clerkLocalization = {
  signIn: {
    start: {
      title: `Sign in to ${APP_NAME}`,
      subtitle: "Welcome back! Please sign in to continue",
    },
  },
  signUp: {
    start: {
      title: `Sign up to ${APP_NAME}`,
      subtitle: "Welcome! Please sign up to continue",
    },
  },
};
