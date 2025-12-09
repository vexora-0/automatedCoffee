"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error for debugging
    console.error("Global error caught in root layout:", error);

    // Redirect to screensaver immediately
    router.replace("/product/screensaver");
  }, [error, router]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            background: "linear-gradient(to bottom right, #432818, #5F3023, #2C1006)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#F4EBDE",
            fontFamily: "system-ui, sans-serif",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <h1 style={{ fontSize: "2rem", fontWeight: 300, marginBottom: "1rem" }}>
            Sorry, something went wrong
          </h1>
          <p style={{ opacity: 0.7 }}>
            Redirecting you back to the home screen...
          </p>
        </div>
      </body>
    </html>
  );
}

