import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, ScaleControl, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Colores por categoría (igual que antes)
const categoryColors = {
    'Monumento': '#ef4444',
    'Museo': '#3b82f6',
    'Restaurante': '#f59e0b',
    'Naturaleza': '#10b981',
    'Actividad': '#06b6d4',
    'Iglesia': '#ec4899',
    'Alojamiento': '#8b5cf6'
};

const createCustomIcon = (category, id) => {
    const color = categoryColors[category] || '#6b7280';
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;"><div style="transform: rotate(45deg); color: white; font-weight: bold; font-size: 10px;">${id}</div></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
    });
};

// Componente interno para manejar el centrado del mapa
function MapCenterController({ centerPlace }) {
    const map = useMap();
    
    useEffect(() => {
        if (centerPlace && centerPlace.coordinates) {
            map.flyTo(centerPlace.coordinates, 13, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [centerPlace, map]);
    
    return null;
}

// Componente de Geolocalización
function GeolocationControl() {
    const map = useMap();
    const [isLocating, setIsLocating] = useState(false);
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        // Crear el botón de geolocalización
        const locationButton = L.control({ position: 'topleft' });

        locationButton.onAdd = () => {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            div.innerHTML = `
                <button 
                    id="geolocate-btn"
                    style="
                        background: white;
                        width: 34px;
                        height: 34px;
                        border: 2px solid rgba(0,0,0,0.2);
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 18px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.2s;
                    "
                    title="Ir a mi ubicación"
                >
                    📍
                </button>
            `;

            // Prevenir que los clics en el botón se propaguen al mapa
            L.DomEvent.disableClickPropagation(div);

            const button = div.querySelector('#geolocate-btn');
            
            button.addEventListener('click', () => {
                setIsLocating(true);
                button.style.background = '#3b82f6';
                button.innerHTML = '⌛';

                map.locate({ setView: true, maxZoom: 13 });
            });

            button.addEventListener('mouseenter', () => {
                if (!isLocating) {
                    button.style.background = '#f3f4f6';
                }
            });

            button.addEventListener('mouseleave', () => {
                if (!isLocating) {
                    button.style.background = 'white';
                }
            });

            return div;
        };

        locationButton.addTo(map);

        // Manejar la ubicación encontrada
        const onLocationFound = (e) => {
            setIsLocating(false);
            setUserLocation(e.latlng);
            
            const button = document.querySelector('#geolocate-btn');
            if (button) {
                button.style.background = '#10b981';
                button.innerHTML = '✓';
                
                setTimeout(() => {
                    button.style.background = 'white';
                    button.innerHTML = '📍';
                }, 2000);
            }

            // Agregar un marcador en la ubicación del usuario
            const radius = e.accuracy / 2;
            L.marker(e.latlng, {
                icon: L.divIcon({
                    className: 'user-location-marker',
                    html: `<div style="
                        background: #3b82f6;
                        width: 16px;
                        height: 16px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                    "></div>`,
                    iconSize: [16, 16],
                    iconAnchor: [8, 8]
                })
            })
            .addTo(map)
            .bindPopup(`Estás aquí<br/>Precisión: ${Math.round(radius)} metros`)
            .openPopup();

            // Círculo de precisión
            L.circle(e.latlng, { radius, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.1 }).addTo(map);
        };

        const onLocationError = (e) => {
            setIsLocating(false);
            const button = document.querySelector('#geolocate-btn');
            if (button) {
                button.style.background = '#ef4444';
                button.innerHTML = '✗';
                
                setTimeout(() => {
                    button.style.background = 'white';
                    button.innerHTML = '📍';
                }, 2000);
            }
            alert('No se pudo obtener tu ubicación: ' + e.message);
        };

        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        return () => {
            locationButton.remove();
            map.off('locationfound', onLocationFound);
            map.off('locationerror', onLocationError);
        };
    }, [map, isLocating]);

    return null;
}

// Componente para manejar clicks en el mapa
function MapClickHandler() {
    const [clickMarker, setClickMarker] = useState(null);
    const map = useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            
            // Remover marcador anterior si existe
            if (clickMarker) {
                map.removeLayer(clickMarker);
            }

            // Crear marcador temporal
            const tempMarker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'temp-marker',
                    html: `<div style="
                        background: #8b5cf6;
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        border: 3px solid white;
                        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5);
                        animation: pulse 2s infinite;
                    "></div>
                    <style>
                        @keyframes pulse {
                            0%, 100% { opacity: 1; }
                            50% { opacity: 0.5; }
                        }
                    </style>`,
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                })
            }).addTo(map);

            // Intentar obtener el nombre del lugar usando Nominatim (OpenStreetMap)
            const popupContent = `
                <div style="min-width: 200px;">
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: #8b5cf6;">
                        📍 Coordenadas
                    </div>
                    <div style="font-size: 12px; color: #374151; margin-bottom: 4px;">
                        <strong>Lat:</strong> ${lat.toFixed(6)}
                    </div>
                    <div style="font-size: 12px; color: #374151; margin-bottom: 8px;">
                        <strong>Lng:</strong> ${lng.toFixed(6)}
                    </div>
                    <div id="location-name" style="font-size: 11px; color: #6b7280; font-style: italic;">
                        Buscando ubicación...
                    </div>
                </div>
            `;

            tempMarker.bindPopup(popupContent).openPopup();
            setClickMarker(tempMarker);

            // Reverse geocoding con Nominatim
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                    {
                        headers: {
                            'User-Agent': 'TravelMapApp/1.0'
                        }
                    }
                );
                const data = await response.json();
                
                const locationName = data.display_name || 'Ubicación desconocida';
                const nameElement = document.getElementById('location-name');
                if (nameElement) {
                    nameElement.innerHTML = `<strong>📌 ${locationName}</strong>`;
                    nameElement.style.fontStyle = 'normal';
                    nameElement.style.color = '#374151';
                }
            } catch (error) {
                const nameElement = document.getElementById('location-name');
                if (nameElement) {
                    nameElement.innerHTML = 'No se pudo obtener el nombre' + error.message;
                    nameElement.style.color = '#ef4444';
                }
            }
        }
    });

    return null;
}

export default function MapComponent({ places, centerPlace }) {
    const center = [43.0, 12.0];

    return (
        <MapContainer
            center={center}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
        >
            <MapCenterController centerPlace={centerPlace} />
            <GeolocationControl />
            <MapClickHandler />
            
            {/* Control de Escala */}
            <ScaleControl position="bottomleft" imperial={false} />
            
            <TileLayer
                attribution='© OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {places && places.map((place) => (
                <Marker
                    key={place.id}
                    position={place.coordinates}
                    icon={createCustomIcon(place.category, place.id)}
                >
                    {/* Tooltip que aparece al pasar el mouse */}
                    <Tooltip 
                        direction="top" 
                        offset={[0, -20]} 
                        opacity={0.95}
                        className="custom-tooltip"
                    >
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '2px' }}>
                                {place.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                {place.city}
                            </div>
                        </div>
                    </Tooltip>

                    {/* CAMBIOS AQUÍ:
                        1. maxWidth={1000}: Ponemos un número gigante para que Leaflet NO limite el ancho.
                        2. minWidth={200}: Un mínimo seguro.
                    */}
                    <Popup maxWidth={1000} minWidth={200}>
                        
                        {/* CSS MÁGICO:
                            w-[90vw]: En móvil ocupa el 90% del ancho de la ventana.
                            sm:w-[380px]: En pantallas sm (tablets) en adelante, se fija en 380px.
                        */}
                        <div className="w-[90vw] sm:w-[380px] max-h-[60vh] sm:max-h-[400px] overflow-y-auto overflow-x-hidden">
                            
                            {/* Imagen Header */}
                            <div className="w-full h-40 sm:h-52 relative group">
                                <img
                                    src={place.image}
                                    alt={place.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                
                                {/* Título sobre la imagen para ahorrar espacio vertical en móviles */}
                                <div className="absolute bottom-0 left-0 p-3 w-full">
                                    <h3 className="text-xl font-bold text-white leading-tight shadow-black drop-shadow-md">
                                        {place.name}
                                    </h3>
                                    <p className="text-xs text-gray-200 flex items-center gap-1 mt-1 font-medium">
                                        <span>📍</span> {place.city}, {place.country}
                                    </p>
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="p-4 bg-white">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wide">
                                        {place.category}
                                    </span>
                                    {place.visited ? (
                                        <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span> Visitado
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-orange-600 text-xs font-bold">
                                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Pendiente
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-gray-600 leading-relaxed mb-4 font-normal">
                                    {place.description}
                                </p>

                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                    {place.notes && (
                                        <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex gap-3 items-start">
                                            <span className="text-amber-500 text-lg">💡</span>
                                            <div>
                                                <p className="text-[10px] text-amber-600 font-bold uppercase mb-0.5">Tip Pro</p>
                                                <p className="text-xs text-gray-700 italic">"{place.notes}"</p>
                                            </div>
                                        </div>
                                    )}

                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.city} ${place.country}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-black text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 group"
                                    >
                                        <span>Cómo llegar</span>
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}