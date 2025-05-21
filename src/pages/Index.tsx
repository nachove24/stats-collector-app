import React from 'react';
import { useHistory } from 'react-router-dom';
import { Volleyball, ClipboardList, Book, Settings } from 'lucide-react';

const Index: React.FC = () => {
  const history = useHistory();

  const menuOptions = [
    {
      title: 'Iniciar Partido',
      description: 'Configura y comienza un nuevo partido',
      icon: < Volleyball className="w-10 h-10 text-orange-500" />,
      path: '/setup',
    },
    {
      title: 'Historial de Partidos',
      description: 'Ver todos los partidos registrados',
      icon: <ClipboardList className="w-10 h-10 text-blue-500" />,
      path: '/record',
    },
    {
      title: 'Tutorial',
      description: 'Aprende a usar la aplicación',
      icon: <Book className="w-10 h-10 text-green-500" />,
      path: '/tutorial',
    },
    {
      title: 'Ajustes',
      description: 'Configura las opciones de la aplicación',
      icon: <Settings className="w-10 h-10 text-purple-500" />,
      path: '/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center my-8">
          <h1 className="text-4xl font-bold text-gray-800">Stats Collector</h1>
          <p className="text-xl text-gray-600 mt-2">Seguimiento de estadísticas de baloncesto en tiempo real</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuOptions.map((option, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer flex items-center"
              onClick={() => history.push(option.path)}
            >
              <div className="bg-gray-50 p-4 rounded-full mr-4">{option.icon}</div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{option.title}</h2>
                <p className="text-gray-600">{option.description}</p>
              </div>
            </div>
          ))}
        </div>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Stats Collector App. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;