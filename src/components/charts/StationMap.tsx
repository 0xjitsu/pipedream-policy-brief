"use client";

import { useEffect, useRef } from "react";
import type { TrackedStation, StationStatus } from "@/data/types";

const STATUS_COLORS: Record<StationStatus, string> = {
  operational: "#10B981",
  "low-supply": "#F59E0B",
  "out-of-stock": "#EF4444",
  closed: "#6B7280",
};

const STATUS_LABELS: Record<StationStatus, string> = {
  operational: "Operational",
  "low-supply": "Low Supply",
  "out-of-stock": "Out of Stock",
  closed: "Closed",
};

interface StationMapProps {
  stations: TrackedStation[];
}

export function StationMap({ stations }: StationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  // Count stations by status for legend
  const counts: Record<StationStatus, number> = {
    operational: 0,
    "low-supply": 0,
    "out-of-stock": 0,
    closed: 0,
  };
  for (const s of stations) {
    counts[s.status]++;
  }

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let cancelled = false;

    async function initMap() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      // Create map only once
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [12.8797, 121.774],
          zoom: 6,
          zoomControl: true,
          attributionControl: true,
        });

        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(mapInstanceRef.current);
      }

      // Clear existing markers
      for (const marker of markersRef.current) {
        marker.remove();
      }
      markersRef.current = [];

      // Add new markers
      const map = mapInstanceRef.current;
      for (const station of stations) {
        const color = STATUS_COLORS[station.status];
        const marker = L.circleMarker([station.lat, station.lng], {
          radius: 8,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.6,
        }).addTo(map);

        const sourceLink = station.sourceUrl
          ? `<a href="${station.sourceUrl}" target="_blank" rel="noopener noreferrer" style="color:#38BDF8;text-decoration:underline;font-size:11px;">View source</a>`
          : "";

        marker.bindPopup(
          `<div style="font-family:system-ui;min-width:180px;">
            <div style="font-weight:600;font-size:13px;margin-bottom:4px;">${station.name}</div>
            <div style="font-size:11px;color:#999;margin-bottom:6px;">${station.brand}</div>
            <span style="display:inline-block;padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:600;color:#fff;background:${color};">
              ${STATUS_LABELS[station.status]}
            </span>
            ${station.details ? `<div style="font-size:11px;color:#ccc;margin-top:6px;">${station.details}</div>` : ""}
            <div style="font-size:10px;color:#888;margin-top:6px;">Reported: ${station.lastReported}</div>
            ${sourceLink ? `<div style="margin-top:4px;">${sourceLink}</div>` : ""}
          </div>`,
          { className: "dark-popup" }
        );

        markersRef.current.push(marker);
      }
    }

    initMap();

    return () => {
      cancelled = true;
    };
  }, [stations]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full rounded-xl overflow-hidden"
        style={{ height: 500, background: "#0a1628" }}
      />

      {/* Glass legend overlay */}
      <div className="absolute bottom-4 right-4 z-[1000] glass p-3 rounded-lg min-w-[140px]">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-white-50 mb-2">
          Status
        </div>
        {(Object.keys(STATUS_COLORS) as StationStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            <span className="text-xs text-white-70">{STATUS_LABELS[status]}</span>
            <span className="text-xs text-white-30 ml-auto font-mono">{counts[status]}</span>
          </div>
        ))}
      </div>

      {/* Dark popup styles */}
      <style jsx global>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: rgba(15, 27, 45, 0.95);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #fff;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        }
        .dark-popup .leaflet-popup-tip {
          background: rgba(15, 27, 45, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .leaflet-control-attribution {
          background: rgba(15, 27, 45, 0.7) !important;
          color: rgba(255, 255, 255, 0.3) !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: rgba(255, 255, 255, 0.4) !important;
        }
      `}</style>
    </div>
  );
}
