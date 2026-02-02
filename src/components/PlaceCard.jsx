export default function PlaceCard({ place, onClose }) {
    if (!place) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-[600px] bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-lg">
                {/* Botón cerrar */}
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition z-10 font-bold"
                >
                    ✕
                </button>

                {/* Card sin flip - todo en una cara */}
                <div className="relative w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                    {/* Imagen */}
                    <div className="h-64 overflow-hidden bg-gray-200 flex items-center justify-center">
                        <img
                            src={place.image}
                            alt={place.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Contenido */}
                    <div className="p-6 max-h-[400px] overflow-y-auto">
                        {/* Tags */}
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                {place.category}
                            </span>
                            {place.visited && (
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                    ✓ Visitado
                                </span>
                            )}
                            {!place.visited && (
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                    Por visitar
                                </span>
                            )}
                        </div>

                        {/* Título y ubicación */}
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{place.name}</h2>
                        <p className="text-gray-600 mb-4 text-lg">
                            {place.city}, {place.country}
                        </p>

                        {/* Descripción */}
                        <p className="text-gray-700 leading-relaxed mb-6">{place.description}</p>

                        {/* Detalles */}
                        <div className="border-t border-gray-200 pt-4 space-y-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Coordenadas GPS</p>
                                <p className="font-mono text-sm font-semibold text-gray-800">
                                    {place.coordinates[0]}, {place.coordinates[1]}
                                </p>
                            </div>

                            {place.notes && (
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500 mb-1">Notas</p>
                                    <p className="text-sm text-gray-700">{place.notes}</p>
                                </div>
                            )}

                            {/* Botón Google Maps */}
                            <a
                                href={`https://www.google.com/maps?q=${place.coordinates[0]},${place.coordinates[1]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                            >
                                Abrir en Google Maps
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}