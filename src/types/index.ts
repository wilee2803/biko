export interface Dog {
  id: string;
  userId: string;
  ownerName: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  expanderSize: string;
  cuffSize: string;
  createdAt: Date;
}

export interface GeoPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Training {
  id: string;
  dogId: string;
  userId: string;
  bandStrength: 1 | 2;
  startTime: Date;
  endTime: Date;
  duration: number;
  distance: number;
  route: GeoPoint[];
  createdAt: Date;
}

export interface DogFormData {
  ownerName: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  expanderSize: string;
  cuffSize: string;
}
