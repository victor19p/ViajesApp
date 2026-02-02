import { useState } from 'react';

export default function Sidebar({ 
    places = [],          // PROTECCIÓN 1: Valor por defecto vacío
    filteredPlaces = [],  // PROTECCIÓN 2: Valor por defecto vacío
    onFilterChange, 
    onPlaceClick 
}) {
    const [selectedCountry, setSelectedCountry] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedCity, setSelectedCity] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');

    // PROTECCIÓN 3: Aseguramos que trabajamos sobre arrays reales
    const safePlaces = places || [];
    const safeFilteredPlaces = filteredPlaces || [];

    // Extraer valores únicos (Agregamos filter(Boolean) para limpiar vacíos del Excel)
    const countries = [...new Set(safePlaces.map(p => p.country).filter(Boolean))];
    const categories = [...new Set(safePlaces.map(p => p.category).filter(Boolean))];
    const cities = [...new Set(safePlaces.map(p => p.city).filter(Boolean))].sort();

    const handleCountryChange = (country) => {
        setSelectedCountry(country);
        onFilterChange({ country, category: selectedCategory, city: selectedCity, status: selectedStatus });
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        onFilterChange({ country: selectedCountry, category, city: selectedCity, status: selectedStatus });
    };

    const handleCityChange = (city) => {
        setSelectedCity(city);
        onFilterChange({ country: selectedCountry, category: selectedCategory, city, status: selectedStatus });
    };

    const handleStatusChange = (status) => {
        setSelectedStatus(status);
        onFilterChange({ country: selectedCountry, category: selectedCategory, city: selectedCity, status });
    };

    // Cálculos seguros
    const stats = {
        total: safePlaces.length,
        visited: safePlaces.filter(p => p.visited).length,
        pending: safePlaces.filter(p => !p.visited).length
    };

    return (
        <div className="w-full md:w-80 bg-white shadow-xl h-full overflow-y-auto border-r border-gray-200">
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Viaje</h1>
                    <p className="text-sm text-gray-600">Italia • Francia • Brujas</p>
                </div>

                {/* Estadísticas */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Estadísticas</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total lugares:</span>
                            <span className="font-bold text-gray-800">{stats.total}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Visitados:</span>
                            <span className="font-bold text-green-600">{stats.visited}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Por visitar:</span>
                            <span className="font-bold text-orange-600">{stats.pending}</span>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="space-y-6">
                    {/* Filtro por País */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Por País</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleCountryChange('all')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${selectedCountry === 'all'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Todos los países
                            </button>
                            {countries.map(country => (
                                <button
                                    key={country}
                                    onClick={() => handleCountryChange(country)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${selectedCountry === country
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {country}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtro por Categoría */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Por Categoría</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleCategoryChange('all')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === 'all'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Todas las categorías
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryChange(category)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === category
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtro por Ciudad */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Por Ciudad</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            <button
                                onClick={() => handleCityChange('all')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${selectedCity === 'all'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Todas las ciudades
                            </button>
                            {cities.map(city => (
                                <button
                                    key={city}
                                    onClick={() => handleCityChange(city)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${selectedCity === city
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {city}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtro por Estado */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Estado</h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => handleStatusChange('all')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${selectedStatus === 'all'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => handleStatusChange('visited')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${selectedStatus === 'visited'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Visitados
                            </button>
                            <button
                                onClick={() => handleStatusChange('pending')}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${selectedStatus === 'pending'
                                        ? 'bg-blue-500 text-white shadow-md'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                Por visitar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Lugares */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Lugares ({safeFilteredPlaces.length})
                    </h3>
                    
                    {/* PROTECCIÓN 4: Mensaje si no hay resultados */}
                    {safeFilteredPlaces.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">
                            <p>No se encontraron lugares.</p>
                            <p className="text-xs">Intenta cambiar los filtros.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {safeFilteredPlaces.map(place => (
                                <button
                                    key={place.id}
                                    onClick={() => onPlaceClick && onPlaceClick(place)}
                                    className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-2 transition flex gap-3 items-start text-left group"
                                >
                                    {/* Thumbnail */}
                                    <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                                        {place.image ? (
                                            <img
                                                src={place.image}
                                                alt={place.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                                                Sin foto
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono text-gray-400">#{place.id}</span>
                                            <h4 className="font-semibold text-sm text-gray-800 truncate">
                                                {place.name}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate mb-2">
                                            {place.city}
                                        </p>
                                        <div className="flex items-center gap-1 flex-wrap">
                                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                                                {place.category}
                                            </span>
                                            {place.visited ? (
                                                <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full border border-green-200 font-bold">
                                                    ✓
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full border border-orange-200">
                                                    •
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}