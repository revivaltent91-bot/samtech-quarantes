'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const mapData = [
  { id: 1, name: 'Siège & R&D', coords: [6.1319, 1.2228] as [number, number], radius: 8, color: '#D4AF37', desc: 'Quarantes Studio - Lomé, Togo' },
  { id: 2, name: 'Hub Stratégique', coords: [14.6928, -17.4467] as [number, number], radius: 6, color: '#A855F7', desc: 'Laboratoire IA & Edge - Dakar' },
  { id: 3, name: 'Déploiement Logistique', coords: [5.3599, -4.0083] as [number, number], radius: 6, color: '#A855F7', desc: 'Hub Karaba OS - Abidjan' },
  { id: 4, name: 'Opérations Industrielles', coords: [-1.2921, 36.8219] as [number, number], radius: 6, color: '#A855F7', desc: 'Infrastructure KOF - Nairobi' },
  { id: 5, name: 'Gouvernance & IA', coords: [3.848, 11.5021] as [number, number], radius: 5, color: '#D4AF37', desc: 'Partenariat Tépé - Yaoundé' },
  { id: 6, name: 'Projet Actif', coords: [9.082, 8.6753] as [number, number], radius: 4, color: '#F5F5F7', desc: 'Test & Déploiement - Abuja' },
  { id: 7, name: 'Projet Actif', coords: [51.5074, -0.1278] as [number, number], radius: 4, color: '#F5F5F7', desc: 'Partenaires Financiers - Londres' },
];

export default function NetworkMap() {
  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden border border-default relative z-10 shadow-2xl shadow-gold-dark/10">
      <MapContainer
        center={[15, 10]}
        zoom={3}
        scrollWheelZoom={false}
        className="w-full h-full bg-[#1A1A1B]"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        />
        {mapData.map((node) => (
          <CircleMarker
            key={node.id}
            center={node.coords}
            radius={node.radius}
            pathOptions={{ color: node.color, fillColor: node.color, fillOpacity: 0.8, weight: 2 }}
          >
            <Popup className="q-map-popup">
              <div className="bg-background text-primary p-1 -m-1">
                <span className="font-bold text-gold block mb-1">{node.name}</span>
                <span className="text-xs text-muted">{node.desc}</span>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="absolute bottom-6 left-6 z-[400] bg-background/80 backdrop-blur-md border border-default p-4 rounded-xl max-w-xs pointer-events-none">
        <h4 className="text-gold font-bold text-sm uppercase tracking-widest mb-3">
          Réseau Opérationnel
        </h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold" />
            <span className="text-xs text-muted">Sièges & Hubs d&apos;Expertise</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pulse" />
            <span className="text-xs text-muted">Infrastructures Hard/Soft</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted">Projets & Partenaires</span>
          </div>
        </div>
      </div>
    </div>
  );
}
