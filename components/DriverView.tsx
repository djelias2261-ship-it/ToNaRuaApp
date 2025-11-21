import React, { useState } from 'react';
import { RideRequest, RideStatus, DriverStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MapPin, Navigation, DollarSign, CheckCircle, XCircle } from 'lucide-react';

interface DriverViewProps {
  availableRides: RideRequest[];
  activeRide: RideRequest | null;
  onAcceptRide: (id: string) => void;
  onUpdateStatus: (status: RideStatus) => void;
  stats: DriverStats;
}

const DriverView: React.FC<DriverViewProps> = ({ availableRides, activeRide, onAcceptRide, onUpdateStatus, stats }) => {
  const [showStats, setShowStats] = useState(false);

  const earningsData = [
    { name: 'Seg', val: 150 },
    { name: 'Ter', val: 230 },
    { name: 'Qua', val: 180 },
    { name: 'Qui', val: stats.todayEarnings }, // Current day
    { name: 'Sex', val: 0 },
    { name: 'Sáb', val: 0 },
    { name: 'Dom', val: 0 },
  ];

  if (activeRide) {
    return (
      <div className="bg-white p-6 rounded-t-3xl shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center mb-6">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                Em Corrida
            </span>
            <span className="font-bold text-lg">R$ {activeRide.price.toFixed(2)}</span>
        </div>

        <div className="space-y-6">
            <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 mt-1">
                    <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-100"></div>
                    <div className="w-0.5 h-10 bg-gray-200"></div>
                    <div className="w-4 h-4 rounded-full bg-brand-500 ring-4 ring-brand-100"></div>
                </div>
                <div className="flex-1 space-y-4">
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Coleta</p>
                        <p className="font-semibold text-gray-800 leading-tight">{activeRide.origin.address}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase">Destino</p>
                        <p className="font-semibold text-gray-800 leading-tight">{activeRide.destination.address}</p>
                    </div>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
               {activeRide.status === RideStatus.ACCEPTED && (
                   <button 
                    onClick={() => onUpdateStatus(RideStatus.IN_PROGRESS)}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all"
                   >
                    Iniciar Viagem
                   </button>
               )}
               {activeRide.status === RideStatus.IN_PROGRESS && (
                   <button 
                    onClick={() => onUpdateStatus(RideStatus.COMPLETED)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all"
                   >
                    Concluir Viagem
                   </button>
               )}
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 relative">
      {/* Header Stats */}
      <div className="bg-white p-4 shadow-sm z-10">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-xs text-gray-500">Ganhos Hoje</p>
                <h2 className="text-2xl font-bold text-gray-800">R$ {stats.todayEarnings.toFixed(2)}</h2>
            </div>
            <button 
                onClick={() => setShowStats(!showStats)}
                className="text-brand-600 text-sm font-semibold bg-brand-50 px-3 py-1.5 rounded-lg"
            >
                {showStats ? 'Ver Mapa' : 'Ver Gráfico'}
            </button>
        </div>
      </div>

      {showStats ? (
          <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                  <h3 className="font-bold mb-4 text-gray-700">Resumo Semanal</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={earningsData}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                            <YAxis hide />
                            <Tooltip cursor={{fill: '#fef3c7'}} />
                            <Bar dataKey="val" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
          </div>
      ) : (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
              <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-2">
                Solicitações ({availableRides.length})
              </h3>
              
              {availableRides.length === 0 ? (
                  <div className="text-center text-gray-400 py-10">
                      <p>Nenhuma solicitação no momento.</p>
                      <p className="text-xs">Aguarde em uma área movimentada.</p>
                  </div>
              ) : (
                  availableRides.map(ride => (
                    <div key={ride.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                            <span className="bg-brand-100 text-brand-800 text-xs px-2 py-1 rounded font-bold">
                                {ride.type}
                            </span>
                            <span className="font-bold text-lg text-gray-800">R$ {ride.price.toFixed(2)}</span>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                                <span className="truncate">{ride.origin.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Navigation className="w-4 h-4 text-brand-500 shrink-0" />
                                <span className="truncate">{ride.destination.address}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-2 ml-6">
                                <span>{ride.distance}</span>
                                <span>•</span>
                                <span>{ride.paymentMethod}</span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="flex-1 py-2 text-gray-500 font-medium text-sm bg-gray-50 rounded-lg">Recusar</button>
                            <button 
                                onClick={() => onAcceptRide(ride.id)}
                                className="flex-1 py-2 bg-black text-white font-bold text-sm rounded-lg shadow-lg"
                            >
                                Aceitar
                            </button>
                        </div>
                    </div>
                  ))
              )}
          </div>
      )}
    </div>
  );
};

export default DriverView;