import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Pipedream Policy Brief — Navigating the Philippine Energy Emergency";
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #0F1B2D 0%, #1a2d47 50%, #0F1B2D 100%)",
          padding: "48px 80px",
          position: "relative",
        }}
      >
        {/* Top border accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #10B981, #3B82F6, #8B5CF6)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: "#10B981",
            }}
          />
          <span
            style={{
              fontSize: "16px",
              fontWeight: 600,
              letterSpacing: "0.25em",
              textTransform: "uppercase" as const,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            Pipedream
          </span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "16px" }}>|</span>
          <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)" }}>
            Policy Brief
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "46px",
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            lineHeight: 1.2,
            margin: "0 0 16px 0",
            fontFamily: "Georgia, serif",
          }}
        >
          The Philippines Has 45 Days of Fuel Left
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.5)",
            textAlign: "center",
            lineHeight: 1.5,
            margin: 0,
            maxWidth: "700px",
          }}
        >
          98% import-dependent. One refinery. No strategic reserve.
        </p>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "40px",
            padding: "16px 40px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          {[
            { value: "98%", label: "ME Dependence" },
            { value: "120%+", label: "Cargo Premium Surge" },
            { value: "10K+", label: "Stations Tracked" },
            { value: "34", label: "Verified Sources" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span
                style={{ fontSize: "26px", fontWeight: 700, color: "#10B981" }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.1em",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
