import React, { useState, useEffect } from 'react';
import Spinner from './Spinner';

const DEFAULT_MESSAGES = [
  "Analizando ingredientes...",
  "Consultando gustos de la familia...", 
  "Balanceando sabores y especias...", 
  "Redactando receta detallada...",
  "Calculando información nutricional...",
  "Optimizando tiempos de cocción..."
];

export default function LoadingMessage({ messages = DEFAULT_MESSAGES, title = "El Chef IA está trabajando" }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000); // Cambia mensaje cada 3 segundos

    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-fadeIn">
      <div className="bg-brand-50 p-6 rounded-full mb-6">
        <Spinner size="xl" className="text-brand-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-lg min-h-[1.75rem] transition-opacity duration-300 ease-in-out">
        {messages[currentMessageIndex]}
      </p>
    </div>
  );
}
