import { useState, useMemo, useEffect } from 'react';
import Map from './components/Map';
import Sidebar from './components/Sidebar.jsx';
import PlaceCard from './components/PlaceCard';

// ------------------------------------------------------------------
// 1. CONFIGURACIÓN
// ------------------------------------------------------------------

// ¡PEGA AQUÍ TU URL DEL CSV DE GOOGLE SHEETS!
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSwzOlDqYBbwIFhdZMLWVxz49b7KMjAFw17HK7P39uc2z5Kh78IY09NrMBLGo3tVngflWhUSDWBTeAp/pub?gid=0&single=true&output=csv";

// ------------------------------------------------------------------
// 2. FUNCIONES AUXILIARES (Fuera del componente para evitar errores)
// ------------------------------------------------------------------

// Helper para separar por comas respetando las comillas (ej: "Hola, mundo")
const csvToArray = (text) => {
  let p = '', row = [''], i = 0, s = true, l;
  for (l of text) {
    if ('"' === l) {
      if (s && l === p) row[i] += l;
      s = !s;
    } else if (',' === l && s) l = row[++i] = '';
    else row[i] += l;
    p = l;
  }
  return row;
};

// Parser principal
const parseCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/);
  const result = [];

  // Empezamos en i = 1 para saltar los encabezados
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;

    const values = csvToArray(lines[i]);

    // Validación simple para evitar líneas vacías o rotas
    if (values.length < 5) continue;

    // Limpiar comillas de todos los valores
    const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());

    // Convertir coordenadas y validar
    const lat = parseFloat(cleanValues[7]);  // lat está en columna 8
    const lng = parseFloat(cleanValues[8]);  // lng está en columna 9

    // Saltar lugares con coordenadas inválidas
    if (isNaN(lat) || isNaN(lng)) {
      console.warn(`Lugar con coordenadas inválidas: ${cleanValues[3]}`);
      continue;
    }

    // Mapeo según el orden real del CSV:
    // id, country, city, name, category, description, notes, lat, lng, visited, image
    const obj = {
      id: cleanValues[0],
      country: cleanValues[1],
      city: cleanValues[2],
      name: cleanValues[3],
      category: cleanValues[4],
      description: cleanValues[5],
      notes: cleanValues[6] || '',
      coordinates: [lat, lng],
      visited: cleanValues[9]?.toUpperCase() === 'TRUE',
      image: cleanValues[10]
    };
    result.push(obj);
  }
  return result;
};

// ------------------------------------------------------------------
// 3. COMPONENTE PRINCIPAL
// ------------------------------------------------------------------

function App() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [centerPlace, setCenterPlace] = useState(null);

  // Estado inicial del sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth >= 768;
  });

  const [filters, setFilters] = useState({
    country: 'all',
    category: 'all',
    city: 'all',
    status: 'all'
  });

  // --- CARGAR DATOS ---
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();

        const parsedData = parseCSV(csvText);

        setPlaces(parsedData);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando los lugares:", error);
        setLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  // --- FILTROS ---
  const filteredPlaces = useMemo(() => {
    if (!places.length) return [];

    let filtered = places;

    if (filters.country !== 'all') {
      filtered = filtered.filter(place => place.country === filters.country);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(place => place.category === filters.category);
    }

    if (filters.city !== 'all') {
      filtered = filtered.filter(place => place.city === filters.city);
    }

    if (filters.status !== 'all') {
      if (filters.status === 'visited') {
        filtered = filtered.filter(place => place.visited);
      } else if (filters.status === 'pending') {
        filtered = filtered.filter(place => !place.visited);
      }
    }

    return filtered;
  }, [filters, places]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleMarkerClick = (place) => {
    setSelectedPlace(place);
  };

  const handleCloseCard = () => {
    setSelectedPlace(null);
  };

  const handlePlaceClick = (place) => {
    // Centrar el mapa en las coordenadas del lugar
    setCenterPlace(place);
    
    // Cierra el sidebar en mobile al seleccionar un lugar
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // --- RENDER ---
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-100">
        <div className="text-xl font-bold text-gray-600 animate-pulse">
          Cargando mapa de viajes... 🌍
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-100 relative">

      {/* --- SIDEBAR --- */}
      <aside
        className={`
          flex-shrink-0 h-full bg-white border-r border-gray-200 z-40
          transition-all duration-300 ease-in-out
          
          /* MOBILE */
          fixed inset-y-0 left-0
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}

          /* DESKTOP */
          md:static md:shadow-none
          ${isSidebarOpen ? 'md:w-80 md:translate-x-0' : 'md:w-0 md:overflow-hidden'}
        `}
        style={window.innerWidth < 768 ? { width: '320px' } : {}}
      >
        <div className="w-80 h-full overflow-y-auto">
          <Sidebar
            places={places}
            filteredPlaces={filteredPlaces}
            onFilterChange={handleFilterChange}
            onPlaceClick={handlePlaceClick}
          />
        </div>
      </aside>

      {/* --- BOTÓN FLOTANTE --- */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`
          fixed bottom-6 left-6 z-50 
          w-12 h-12 flex items-center justify-center
          rounded-full shadow-lg text-white font-bold text-xl transition-all duration-300
          ${isSidebarOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}
          md:left-6
        `}
        title={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      {/* --- OVERLAY MOBILE --- */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- MAPA --- */}
      <main className="flex-1 h-full relative z-0">
        <Map
          places={filteredPlaces}
          selectedPlace={selectedPlace}
          centerPlace={centerPlace}
          onMarkerClick={handleMarkerClick}
        />
      </main>

      {/* --- FLIP CARD MODAL --- */}
      {selectedPlace && (
        <PlaceCard
          place={selectedPlace}
          onClose={handleCloseCard}
        />
      )}
    </div>
  );
}

export default App;