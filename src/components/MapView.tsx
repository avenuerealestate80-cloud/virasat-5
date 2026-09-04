import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import type { Property } from '../lib/supabase';

// Fix default marker icons (Leaflet has issues with bundlers)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const goldIcon = L.divIcon({
  html: `<div style="background:#b8860b;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:#fff;font-size:14px;font-weight:bold;">₹</span></div>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

interface MapViewProps {
  properties: Property[];
}

export default function MapView({ properties }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [28.35, 77.12],
      zoom: 11,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const validProps = properties.filter((p) => p.latitude && p.longitude);

    validProps.forEach((prop) => {
      const marker = L.marker([prop.latitude!, prop.longitude!], { icon: goldIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:200px;font-family:Inter,sans-serif;">
            <img src="${prop.image_url}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />
            <div style="font-weight:600;font-size:14px;color:#2e2b24;margin-bottom:4px;">${prop.title}</div>
            <div style="font-size:12px;color:#666;margin-bottom:4px;">${prop.location}</div>
            <div style="font-weight:700;font-size:16px;color:#b8860b;margin-bottom:8px;">${prop.price}</div>
            <a href="/projects/${prop.id}" style="display:inline-block;padding:6px 12px;background:#2e2b24;color:#fff;text-decoration:none;border-radius:6px;font-size:12px;font-weight:500;">View Details</a>
          </div>
        `);

      marker.on('popupopen', () => {
        const link = document.querySelector('.leaflet-popup-content a[href="/projects/' + prop.id + '"]');
        if (link) {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            navigate(`/projects/${prop.id}`);
          });
        }
      });
    });

    if (validProps.length > 0) {
      const bounds = L.latLngBounds(validProps.map((p) => [p.latitude!, p.longitude!]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [properties, navigate]);

  return <div ref={mapRef} className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden" />;
}
