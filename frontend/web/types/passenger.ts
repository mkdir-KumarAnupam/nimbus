export type CabinClass =
  | "economy"
  | "premium_economy"
  | "business"
  | "first";


export interface PassengerState {
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
}
export interface CreatePassengerRequest {
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;

  email: string;
  phone: string;

  passportNumber?: string;
  passportExpiry?: string;
  passportCountry?: string;

  mealPreference?: string;
  specialAssistance?: string;
  frequentFlyerNumber?: string;
}

export interface PassengerResponse {
  id: string;
  reservationId: string;

  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;

  email: string;
  phone: string;

  passportNumber?: string;
  passportExpiry?: string;
  passportCountry?: string;

  mealPreference?: string;
  specialAssistance?: string;
  frequentFlyerNumber?: string;

  createdAt: string;
  updatedAt: string;
}

export interface SavedPassenger {
  id: string;
  userId: string;

  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;

  email: string;
  phone: string;

  passportNumber?: string;
  passportExpiry?: string;
  passportCountry?: string;

  mealPreference?: string;
  specialAssistance?: string;
  frequentFlyerNumber?: string;

  createdAt: string;
  updatedAt: string;
}
