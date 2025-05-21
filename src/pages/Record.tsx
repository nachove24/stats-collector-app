import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ArrowRight, Calendar, Users, Clock, Trash2, Edit, AlertCircle } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';


interface PartidoResumen {
  id: string;
  fecha: string;
  equipoLocal: string;
  equipoVisitante: string;
  puntajeLocal: number;
  puntajeVisitante: number;
  duracion: string;
  timestamp: number;
}

const Record: React.FC = () => {
  const [partidos, setPartidos] = useState<PartidoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const history = useHistory();

  useEffect(() => {
    cargarPartidos();
  }, []);
  
  const cargarPartidos = async () => {
    try {
      console.log('Iniciando carga de partidos...');
      // Solo buscamos en la colección 'partidos' que es donde están los datos según las imágenes
      const partidosRef = collection(db, 'partidos');
      const q = query(partidosRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      
      console.log('Cantidad de documentos encontrados:', snapshot.docs.length);
      
      const partidosData: PartidoResumen[] = [];
      
      snapshot.docs.forEach(doc => {
        console.log('Procesando documento ID:', doc.id);
        console.log('Datos del documento:', doc.data());
        
        const data = doc.data();
        
        // Manejo de la fecha usando el campo timestamp que está en tu esquema
        let fechaFormateada = 'Fecha desconocida';
        if (data.timestamp) {
          try {
            // Si es un timestamp de Firestore
            if (data.timestamp.toDate && typeof data.timestamp.toDate === 'function') {
              fechaFormateada = data.timestamp.toDate().toLocaleDateString();
            } 
            // Si es un número (timestamp en milisegundos)
            else if (typeof data.timestamp === 'number') {
              fechaFormateada = new Date(data.timestamp).toLocaleDateString();
            }
          } catch (e) {
            console.error('Error al parsear fecha:', e);
          }
        }
        
        // Extracción de datos según la estructura exacta de tu base de datos (vista en las imágenes)
        const equipoA = data.equipoA || {};
        const equipoB = data.equipoB || {};
        
        // En la imagen se ve que los nombres y puntos están en esta estructura
        const partidoObj: PartidoResumen = {
          id: doc.id,
          fecha: fechaFormateada,
          equipoLocal: equipoA.nombre || 'Equipo Local',
          equipoVisitante: equipoB.nombre || 'Equipo Visitante',
          puntajeLocal: equipoA.puntos !== undefined ? equipoA.puntos : 0,
          puntajeVisitante: equipoB.puntos !== undefined ? equipoB.puntos : 0,
          duracion: `${data.duracionPeriodo || 0}s`, // La duración está en el campo duracionPeriodo según las imágenes
          timestamp: data.timestamp || 0
        };
        
        console.log('Objeto partido procesado:', partidoObj);
        partidosData.push(partidoObj);
      });
      
      console.log('Partidos cargados:', partidosData);
      setPartidos(partidosData);
    } catch (error) {
      console.error('Error al cargar los partidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = (partidoId: string) => {
    history.push(`/summary/${partidoId}`);
  };
  
  const mostrarConfirmacionBorrado = (partidoId: string) => {
    setConfirmDelete(partidoId);
  };
  
  const cancelarBorrado = () => {
    setConfirmDelete(null);
  };



const eliminarSubcoleccionEventos = async (partidoId: string) => {
  const eventosRef = collection(db, 'partidos', partidoId, 'eventos');
  const eventosSnap = await getDocs(eventosRef);

  const eliminaciones = eventosSnap.docs.map((eventoDoc) =>
    deleteDoc(doc(db, 'partidos', partidoId, 'eventos', eventoDoc.id))
  );

  await Promise.all(eliminaciones);
};

  
  const confirmarBorrado = async (partidoId: string) => {
  try {
    setEliminando(true);

    // 1. 🔥 Borrar eventos primero
    await eliminarSubcoleccionEventos(partidoId);

    // 2. 🧹 Borrar documento de partido
    await deleteDoc(doc(db, 'partidos', partidoId));

    // 3. 🧼 Limpiar de la UI
    setPartidos(partidos.filter(partido => partido.id !== partidoId));
    setConfirmDelete(null);
  } catch (error) {
    console.error('Error al eliminar el partido y sus eventos:', error);
    alert('Error al eliminar el partido y sus eventos.');
  } finally {
    setEliminando(false);
  }
};

  
  const editarPartido = (partidoId: string) => {
    // Esta función se implementará en el futuro
    console.log('Editar partido con ID:', partidoId);
    // Aquí se redireccionaría a la pantalla de edición
    // history.push(`/edit/${partidoId}`);
    alert('Funcionalidad de edición en desarrollo');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <button 
        onClick={() => history.push('/')} 
        className="absolute left-4 md:left-8 flex items-center px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full shadow transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Volver
      </button>
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col items-center justify-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Historial de Partidos</h1>
        </header>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando partidos...</p>
          </div>
        ) : partidos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-xl">No hay partidos registrados</p>
            <button 
              className="mt-4 bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
              onClick={() => history.push('/setup')}
            >
              Iniciar un partido nuevo
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {partidos.map((partido) => (
              <div key={partido.id} className="bg-white rounded-lg shadow p-6 relative">
                {/* Modal de confirmación de borrado */}
                {confirmDelete === partido.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-lg">
                      <div className="flex items-center text-orange-500 mb-4">
                        <AlertCircle className="w-6 h-6 mr-2" />
                        <h3 className="text-lg font-bold">Confirmar eliminación</h3>
                      </div>
                      <p className="mb-6">
                        ¿Estás seguro que deseas eliminar el partido entre <span className="font-semibold">{partido.equipoLocal}</span> y <span className="font-semibold">{partido.equipoVisitante}</span>? Esta acción no se puede deshacer.
                      </p>
                      <div className="flex justify-end space-x-3">
                        <button
                          className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                          onClick={cancelarBorrado}
                          disabled={eliminando}
                        >
                          Cancelar
                        </button>
                        <button
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
                          onClick={() => confirmarBorrado(partido.id)}
                          disabled={eliminando}
                        >
                          {eliminando ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                              Eliminando...
                            </>
                          ) : (
                            <>Eliminar</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <div className="flex items-center text-gray-500 mb-2">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{partido.fecha}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <h2 className="text-xl font-semibold">{partido.equipoLocal}</h2>
                      <div className="flex items-center">
                        <span className="text-2xl font-bold text-orange-500">{partido.puntajeLocal}</span>
                        <span className="mx-2">-</span>
                        <span className="text-2xl font-bold text-orange-500">{partido.puntajeVisitante}</span>
                      </div>
                      <h2 className="text-xl font-semibold">{partido.equipoVisitante}</h2>
                    </div>
                    <div className="flex items-center text-gray-500 mt-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Duración: {partido.duracion}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {/* Botón de editar (para implementación futura) */}
                    <button 
                      className="bg-blue-100 hover:bg-blue-200 text-blue-800 p-2 rounded transition-colors"
                      onClick={() => editarPartido(partido.id)}
                      title="Editar partido"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    
                    {/* Botón de borrar */}
                    <button 
                      className="bg-red-100 hover:bg-red-200 text-red-800 p-2 rounded transition-colors"
                      onClick={() => mostrarConfirmacionBorrado(partido.id)}
                      title="Eliminar partido"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    
                    {/* Botón de ver detalle */}
                    <button 
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center"
                      onClick={() => verDetalle(partido.id)}
                    >
                      <span>Ver más</span>
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Record;