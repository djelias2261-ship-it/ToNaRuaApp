export enum UserRole {
  CLIENT = 'CLIENT',
  DRIVER = 'DRIVER'
}

export enum RideStatus {
  IDLE = 'IDLE',
  SEARCHING = 'SEARCHING', // Looking for location/route via Gemini
  QUOTED = 'QUOTED', // Price shown
  PENDING = 'PENDING', // Waiting for driver
  ACCEPTED = 'ACCEPTED', // Driver on the way
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'DINHEIRO',
  CARD = 'CARTAO',
  PIX = 'PIX'
}

export enum RideType {
  RIDE = 'CORRIDA',
  DELIVERY = 'ENTREGA'
}

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  description?: string;
}

export interface RideRequest {
  id: string;
  origin: LocationData;
  destination: LocationData;
  distance: string;
  duration: string;
  price: number;
  type: RideType;
  paymentMethod: PaymentMethod;
  status: RideStatus;
  createdAt: Date;
  customerName: string;
  routeSummary?: string; // From Gemini
}

export interface DriverStats {
  todayEarnings: number;
  totalRides: number;
  rating: number;
}