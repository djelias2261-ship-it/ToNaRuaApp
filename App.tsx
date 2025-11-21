import React, { useState, useEffect } from 'react';
import { UserRole, RideRequest, RideStatus, DriverStats } from './types';
import ClientView from './components/ClientView';
import DriverView from './components/DriverView';
import MapVisualizer from './components/MapVisualizer';
import { Settings, User } from 'lucide-react';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>(UserRole.CLIENT);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  
  // State for Driver View
  const [availableRides, setAvailableRides] = useState<RideRequest[]>([]);
  const [driverStats, setDriverStats] = useState<DriverStats>({
    todayEarnings: 145.50,
    totalRides: 12,
    rating: 4.9
  });

  // Mock checking for rides effect for Driver
  useEffect(() => {
    if (role === UserRole.DRIVER && !activeRide) {
       const interval = setInterval(() => {
         if (availableRides.length < 3) {
            const mockRide: RideRequest = {
                id: Math.random().toString(36).substr(2, 9),
                origin: { address: "Av. Paulista, 1000 - São Paulo", lat: 0, lng: 0 },
                destination: { address: "Rua Augusta, 500 - São Paulo", lat: 0, lng: 0 },
                distance: "2.4 km",
                duration: "8 min",
                price: 12.50,
                type: Math.random() > 0.5 ? 'CORRIDA' : 'ENTREGA' as any,
                paymentMethod: 'PIX' as any,
                status: RideStatus.PENDING,
                createdAt: new Date(),
                customerName: "Cliente Teste"
            };
            setAvailableRides(prev => [...prev, mockRide]);
         }
       }, 5000);
       return () => clearInterval(interval);
    }
  }, [role, activeRide, availableRides.length]);

  const handleRideRequest = (req: RideRequest) => {
    setActiveRide(req);
    // Simulate broadcasting to drivers
    setTimeout(() => {
        setAvailableRides(prev => [...prev, req]);
    }, 1000);
  };

  const handleDriverAccept = (rideId: string) => {
    const ride = availableRides.find(r => r.id === rideId);
    if (ride) {
        const updatedRide = { ...ride, status: RideStatus.ACCEPTED };
        setActiveRide(updatedRide); // Set as active for driver
        setAvailableRides(prev => prev.filter(r => r.id !== rideId));
    }
  };

  const handleStatusUpdate = (newStatus: RideStatus) => {
    if (!activeRide) return;
    const updated = { ...activeRide, status: newStatus };
    setActiveRide(updated);

    if (newStatus === RideStatus.COMPLETED) {
        setDriverStats(prev => ({
            ...prev,
            todayEarnings: prev.todayEarnings + activeRide.price,
            totalRides: prev.totalRides + 1
        }));
        // Reset active ride after a delay
        setTimeout(() => setActiveRide(null), 3000);
    }
  };

  const handleCancel = () => {
    setActiveRide(null);
  };

  return (
    <div className="h-screen w-full flex flex-col relative overflow-hidden bg-gray-100">
        {/* Mobile Header / Role Switcher */}
        <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-start pointer-events-none">
            <div className="bg-white/90 backdrop-blur shadow-sm rounded-xl p-2 pointer-events-auto">
               <h1 className="font-black text-xl text-brand-600 tracking-tighter">ToNaRua</h1>
            </div>
            
            <button 
                onClick={() => setRole(role === UserRole.CLIENT ? UserRole.DRIVER : UserRole.CLIENT)}
                className="bg-black text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xl pointer-events-auto flex items-center gap-2 hover:scale-105 transition-transform"
            >
                {role === UserRole.CLIENT ? <User size={14} /> : <Settings size={14} />}
                {role === UserRole.CLIENT ? "Modo Motorista" : "Modo Cliente"}
            </button>
        </div>

        {/* Map Background Layer */}
        <div className="absolute inset-0 z-0">
            <MapVisualizer 
                status={activeRide?.status || RideStatus.IDLE} 
                isDriver={role === UserRole.DRIVER}
            />
        </div>

        {/* Foreground Content Layer */}
        <div className="relative z-10 flex-1 flex flex-col justify-end pointer-events-none">
            {/* The content views handle their own pointer events */}
            <div className="w-full max-w-md mx-auto pointer-events-auto">
                {role === UserRole.CLIENT ? (
                    <ClientView 
                        onRideRequest={handleRideRequest} 
                        currentRide={activeRide}
                        onCancelRide={handleCancel}
                    />
                ) : (
                    <DriverView 
                        availableRides={availableRides}
                        activeRide={activeRide}
                        onAcceptRide={handleDriverAccept}
                        onUpdateStatus={handleStatusUpdate}
                        stats={driverStats}
                    />
                )}
            </div>
        </div>
    </div>
  );
};

export default App;