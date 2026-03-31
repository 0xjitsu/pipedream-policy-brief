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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clusterRef = useRef<any>(null);

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
      await import("leaflet.markercluster/dist/MarkerCluster.css");
      await import("leaflet.markercluster/dist/MarkerCluster.Default.css");
      await import("leaflet.markercluster");

      if (cancelled || !mapRef.current) return;

      // Create map only once
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [12.8797, 121.774],
          zoom: 6,
          zoomControl: true,
          attributionControl: true,
        });

        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
          }
        ).addTo(mapInstanceRef.current);
      }

      const map = mapInstanceRef.current;

      // Remove old cluster group if it exists
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current);
        clusterRef.current = null;
      }

      // Create cluster group with custom icons
      const cluster = L.markerClusterGroup({
        maxClusterRadius: 60,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        iconCreateFunction: (clusterObj: any) => {
          const count = clusterObj.getChildCount();
          let color: string;
          let size: number;
          let className: string;

          if (count > 500) {
            color = "#EF4444";
            size = 48;
            className = "cluster-large";
          } else if (count > 100) {
            color = "#F59E0B";
            size = 40;
            className = "cluster-medium";
          } else {
            color = "#3B82F6";
            size = 32;
            className = "cluster-small";
          }

          return L.divIcon({
            html: `<div style="
              background:${color};
              width:${size}px;
              height:${size}px;
              border-radius:50%;
              display:flex;
              align-items:center;
              justify-content:center;
              color:#fff;
              font-weight:700;
              font-size:${count > 999 ? 10 : 12}px;
              font-family:ui-monospace,monospace;
              box-shadow:0 2px 8px rgba(0,0,0,0.4),0 0 0 3px rgba(255,255,255,0.1);
              border:2px solid rgba(255,255,255,0.2);
            ">${count > 999 ? `${(count / 1000).toFixed(1)}k` : count}</div>`,
            className: className,
            iconSize: L.point(size, size),
          });
        },
      });

      // Add markers in batch for performance
      const markers: L.CircleMarker[] = [];
      for (const station of stations) {
        const color = STATUS_COLORS[station.status];
        const marker = L.circleMarker([station.lat, station.lng], {
          radius: 6,
          fillColor: color,
          color: color,
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.7,
        });

        const sourceLabel = station.status === "operational"
          ? "Location source"
          : station.reportSource === "official" ? "DOE report" : "News report";

        const sourceLink = station.sourceUrl
          ? `<a href="${station.sourceUrl}" target="_blank" rel="noopener noreferrer" style="color:#38BDF8;text-decoration:underline;font-size:11px;">${sourceLabel} &rarr;</a>`
          : "";

        marker.bindPopup(
          `<div style="font-family:system-ui;min-width:200px;">
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

        markers.push(marker);
      }

      cluster.addLayers(markers);
      map.addLayer(cluster);
      clusterRef.current = cluster;
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
      <div className="absolute bottom-4 right-4 z-[1000] glass p-3 rounded-lg min-w-[160px]">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-white-50 mb-1.5">
          {stations.length.toLocaleString()} stations
        </div>
        {(Object.keys(STATUS_COLORS) as StationStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            <span className="text-xs text-white-70">{STATUS_LABELS[status]}</span>
            <span className="text-xs text-white-20 ml-auto font-mono">
              {counts[status].toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Dark popup + cluster styles */}
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
        /* Hide default markercluster styles — we use custom divIcons */
        .marker-cluster-small,
        .marker-cluster-medium,
        .marker-cluster-large {
          background: transparent !important;
        }
        .marker-cluster-small div,
        .marker-cluster-medium div,
        .marker-cluster-large div {
          background: transparent !important;
        }
        .cluster-small,
        .cluster-medium,
        .cluster-large {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
}
