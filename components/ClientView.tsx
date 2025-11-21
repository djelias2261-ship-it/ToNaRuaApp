import React, { useState, useEffect } from 'react';
import { RideRequest, RideStatus, PaymentMethod, RideType } from '../types';
import { findPlace, calculateRouteInfo } from '../services/geminiService';
import { MapPin, Navigation, CreditCard, DollarSign, Wallet, Car, Package, Loader2 } from 'lucide-react';

interface ClientViewProps {
  onRideRequest: (req: RideRequest) => void;
  currentRide: RideRequest | null;
  onCancelRide: () => void;
}

const ClientView: React.FC<ClientViewProps> = ({ onRideRequest, currentRide, onCancelRide }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [estimation, setEstimation] = useState<{distance: string, duration: string, price: number, summary: string} | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PaymentMethod.CARD);
  const [rideType, setRideType] = useState<RideType>(RideType.RIDE);
  const [rideStep, setRideStep] = useState<'INPUT' | 'CONFIRM' | 'WAITING' | 'ACTIVE'>('INPUT');

  useEffect(() => {
    if (currentRide) {
      if (currentRide.status === RideStatus.PENDING || currentRide.status === RideStatus.ACCEPTED) {
        setRideStep('WAITING');
      } else if (currentRide.status === RideStatus.IN_PROGRESS) {
        setRideStep('ACTIVE');
      }
    } else {
      setRideStep('INPUT');
      setEstimation(null);
    }
  }, [currentRide]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;

    setIsProcessing(true);
    try {
      // Parallel requests for better UX
      const [originPlace, destPlace, routeInfo] = await Promise.all([
        findPlace(origin),
        findPlace(destination),
        calculateRouteInfo(origin, destination)
      ]);

      setEstimation(routeInfo);
      setRideStep('CONFIRM');
    } catch (err) {
      alert("Erro ao buscar rota. Tente novamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmRide = () => {
    if (!estimation) return;
    
    const newRide: RideRequest = {
      id: Math.random().toString(36).substr(2, 9),
      origin: { address: origin, lat: 0, lng: 0 }, // Simplified for state
      destination: { address: destination, lat: 0, lng: 0 },
      distance: estimation.distance,
      duration: estimation.duration,
      price: estimation.price,
      type: rideType,
      paymentMethod: selectedPayment,
      status: RideStatus.PENDING,
      createdAt: new Date(),
      customerName: "Usuário ToNaRua",
      routeSummary: estimation.summary
    };

    onRideRequest(newRide);
  };

  if (rideStep === 'INPUT') {
    return (
      <div className="bg-white p-6 rounded-t-3xl shadow-2xl animate-slide-up">
        <h2 className="text-xl font-bold mb-4 text-brand-900">Para onde vamos?</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-brand-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Ponto de partida (Sua localização)" 
              className="w-full pl-10 p-3 bg-slate-100 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
          </div>
          <div className="relative">
            <Navigation className="absolute left-3 top-3 text-brand-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Destino" 
              className="w-full pl-10 p-3 bg-slate-100 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-500 transition-colors flex justify-center items-center shadow-lg shadow-brand-500/30"
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : 'Ver Opções'}
          </button>
        </form>
      </div>
    );
  }

  if (rideStep === 'CONFIRM' && estimation) {
    return (
      <div className="bg-white p-6 rounded-t-3xl shadow-2xl animate-slide-up h-[60vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Escolha a viagem</h2>
            <button onClick={() => setRideStep('INPUT')} className="text-sm text-gray-500">Voltar</button>
        </div>

        <div className="bg-brand-50 p-4 rounded-xl mb-6 border border-brand-100">
            <div className="flex justify-between text-sm text-brand-900 mb-1">
                <span>Distância: {estimation.distance}</span>
                <span>Tempo: {estimation.duration}</span>
            </div>
            <p className="text-xs text-gray-500">{estimation.summary}</p>
        </div>

        {/* Ride Type Selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
                onClick={() => setRideType(RideType.RIDE)}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${rideType === RideType.RIDE ? 'border-brand-500 bg-brand-50' : 'border-gray-100'}`}
            >
                <Car className={rideType === RideType.RIDE ? 'text-brand-600' : 'text-gray-400'} />
                <span className="font-semibold text-sm">Motorista</span>
                <span className="font-bold">R$ {estimation.price.toFixed(2)}</span>
            </button>
             <button 
                onClick={() => setRideType(RideType.DELIVERY)}
                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${rideType === RideType.DELIVERY ? 'border-brand-500 bg-brand-50' : 'border-gray-100'}`}
            >
                <Package className={rideType === RideType.DELIVERY ? 'text-brand-600' : 'text-gray-400'} />
                <span className="font-semibold text-sm">Entrega</span>
                <span className="font-bold">R$ {(estimation.price * 0.9).toFixed(2)}</span>
            </button>
        </div>

        {/* Payment Selector */}
        <h3 className="font-semibold mb-3">Forma de Pagamento</h3>
        <div className="space-y-2 mb-6">
            {[
                { type: PaymentMethod.CARD, icon: CreditCard, label: "Cartão de Crédito" },
                { type: PaymentMethod.PIX, icon: Wallet, label: "PIX (Instantâneo)" },
                { type: PaymentMethod.CASH, icon: DollarSign, label: "Dinheiro" },
            ].map((pm) => (
                <div 
                    key={pm.type}
                    onClick={() => setSelectedPayment(pm.type)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border ${selectedPayment === pm.type ? 'border-brand-500 bg-green-50' : 'border-gray-100'}`}
                >
                    <pm.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium">{pm.label}</span>
                </div>
            ))}
        </div>

        <button 
            onClick={handleConfirmRide}
            className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-500 shadow-lg shadow-brand-500/30"
        >
            Confirmar {rideType === RideType.RIDE ? 'Corrida' : 'Entrega'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-t-3xl shadow-2xl text-center">
        <h2 className="text-2xl font-bold mb-2">
            {currentRide?.status === RideStatus.PENDING ? "Procurando Motorista..." : "Viagem em Progresso"}
        </h2>
        <div className="flex justify-center my-6">
            <div className="relative">
                <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center animate-pulse">
                     <Car className="w-8 h-8 text-brand-600" />
                </div>
            </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-left mb-4">
            <p className="text-sm text-gray-500">Motorista</p>
            <p className="font-bold">Procurando...</p>
            <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-brand-500 w-1/2 animate-[shimmer_2s_infinite]"></div>
            </div>
        </div>
        <button onClick={onCancelRide} className="text-red-500 font-medium">Cancelar Solicitação</button>
    </div>
  );
};

export default ClientView;