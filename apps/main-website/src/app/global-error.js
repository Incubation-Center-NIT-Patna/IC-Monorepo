"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={styles.body}>
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.iconWrapper}>
              <svg
                style={styles.icon}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h1 style={styles.title}>Something went critically wrong!</h1>

            <p style={styles.description}>
              An unexpected application error occurred. We have been notified
              and are looking into it.
            </p>

            {/* Optional: Show digest or message in development */}
            {process.env.NODE_ENV === "development" && error?.message && (
              <pre style={styles.errorDetails}>{error.message}</pre>
            )}

            <div style={styles.buttonGroup}>
              <button onClick={() => reset()} style={styles.primaryButton}>
                Try again
              </button>

              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = window.location.origin;
                  }
                }}
                style={styles.secondaryButton}
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    padding: 0,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    maxWidth: "500px",
    width: "90%",
    padding: "2rem",
    textAlign: "center",
  },
  content: {
    backgroundColor: "#1e293b",
    padding: "2.5rem",
    borderRadius: "12px",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
    border: "1px solid #334155",
  },
  iconWrapper: {
    marginBottom: "1rem",
    color: "#f43f5e",
  },
  icon: {
    width: "50px",
    height: "50px",
    margin: "0 auto",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    marginBottom: "0.75rem",
    color: "#ffffff",
  },
  description: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    marginBottom: "1.5rem",
    lineHeight: "1.5",
  },
  errorDetails: {
    backgroundColor: "#0f172a",
    color: "#f87171",
    padding: "0.75rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    textAlign: "left",
    overflowX: "auto",
    marginBottom: "1.5rem",
    border: "1px solid #334155",
  },
  buttonGroup: {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "0.625rem 1.25rem",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    color: "#cbd5e1",
    border: "1px solid #475569",
    padding: "0.625rem 1.25rem",
    borderRadius: "6px",
    fontWeight: "600",
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
};
