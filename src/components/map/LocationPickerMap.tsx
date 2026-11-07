import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MYSURU_CENTER,
  MYSURU_DISTRICT_POLYGON,
  validateMysuruLocation,
  MYSURU_TALUKS,
} from '../../services/geoService';
import { MapPin, AlertTriangle, CheckCircle2, Navigation, Info } from 'lucide-react';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, isValid: boolean) => void;
  label?: string;
  readOnly?: boolean;
  selectedTaluk?: string;
}

export const LocationPickerMap: React.FC<LocationPickerProps> = ({
  initialLat = MYSURU_CENTER[0],
  initialLng = MYSURU_CENTER[1],
  onLocationSelect,
  label = 'Select Location on Mysuru District Map',
  readOnly = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [coords, setCoords] = useState<[number, number]>([initialLat, initialLng]);
  const [validation, setValidation] = useState(() =>
    validateMysuruLocation(initialLat, initialLng)
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Fix default Leaflet icon paths in Vite
    delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 11,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Mysuru District Boundary Polygon Layer
    const boundaryLayer = L.polygon(MYSURU_DISTRICT_POLYGON, {
      color: '#991b1b', // blood-800
      weight: 2.5,
      fillColor: '#ef4444', // blood-500
      fillOpacity: 0.12,
      dashArray: '5, 5',
    }).addTo(map);

    boundaryLayer.bindTooltip(
      '<div style="font-weight: 600; color: #7f1d1d; font-size: 11px;">Mysuru District Boundary<br/><span style="font-weight: 400; color: #555;">Operating Perimeter</span></div>',
      { sticky: true }
    );

    // Initial Marker
    const marker = L.marker([initialLat, initialLng], {
      draggable: !readOnly,
      title: 'Mysuru Location Pin',
    }).addTo(map);
    markerRef.current = marker;

    const handleCoordsUpdate = (lat: number, lng: number) => {
      const precisionLat = Number(lat.toFixed(5));
      const precisionLng = Number(lng.toFixed(5));
      const res = validateMysuruLocation(precisionLat, precisionLng);
      setCoords([precisionLat, precisionLng]);
      setValidation(res);
      onLocationSelect(precisionLat, precisionLng, res.isValid);
    };

    if (!readOnly) {
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handleCoordsUpdate(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        handleCoordsUpdate(e.latlng.lat, e.latlng.lng);
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const handleResetToCenter = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView(MYSURU_CENTER, 12);
      markerRef.current.setLatLng(MYSURU_CENTER);
      const res = validateMysuruLocation(MYSURU_CENTER[0], MYSURU_CENTER[1]);
      setCoords(MYSURU_CENTER);
      setValidation(res);
      onLocationSelect(MYSURU_CENTER[0], MYSURU_CENTER[1], res.isValid);
    }
  };

  const handleSimulateOut = () => {
    // Quick demonstration button to show user rejection of outside coordinates (e.g. Mandya/Bengaluru)
    const outCoord: [number, number] = [12.9716, 77.5946]; // Bengaluru
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView(outCoord, 10);
      markerRef.current.setLatLng(outCoord);
      const res = validateMysuruLocation(outCoord[0], outCoord[1]);
      setCoords(outCoord);
      setValidation(res);
      onLocationSelect(outCoord[0], outCoord[1], res.isValid);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-blood-700" />
          {label}
        </label>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToCenter}
              className="text-xs font-semibold text-blood-700 hover:text-blood-900 bg-blood-50 px-2.5 py-1 rounded border border-blood-200 transition"
            >
              Reset to Mysuru City Center
            </button>
            <button
              type="button"
              onClick={handleSimulateOut}
              className="text-xs text-neutral-500 hover:text-neutral-700 underline"
              title="Test boundary rejection by jumping to out-of-district coordinates"
            >
              Test Outside Reject
            </button>
          </div>
        )}
      </div>

      <div className="relative rounded-xl overflow-hidden border-2 border-neutral-300 shadow-inner bg-neutral-100">
        <div ref={mapContainerRef} className="h-64 sm:h-72 w-full z-0" />

        {/* Live Coordinate Overlay HUD */}
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-neutral-200 text-xs font-mono z-10 flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-blood-600" />
          <span>
            {coords[0].toFixed(4)}° N, {coords[1].toFixed(4)}° E
          </span>
        </div>
      </div>

      {/* Real-time Status Card */}
      <div
        className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-colors ${
          validation.isValid
            ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
            : 'bg-red-50 text-red-950 border-red-300'
        }`}
      >
        {validation.isValid ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-emerald-800">
                Location Verified Inside Mysuru District Boundary
              </p>
              <p className="text-emerald-700 text-[11px] leading-relaxed">
                Coordinates ({coords[0]}, {coords[1]}) passed point-in-polygon verification against the authoritative Mysuru district perimeter.
              </p>
            </div>
          </>
        ) : (
          <>
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-red-700">
                Absolute Restriction: Location Outside Mysuru District
              </p>
              <p className="text-red-800 text-[11px] leading-relaxed">
                {validation.message} Submissions with these coordinates will be rejected by policy and server validation. Click within the red polygon to select a valid Mysuru location.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
