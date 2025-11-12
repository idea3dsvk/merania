export type MeasurementType = 'temperature_humidity' | 'luminosity' | 'dustiness_iso6' | 'dustiness_iso5' | 'torque' | 'surface_resistance' | 'grounding_resistance' | 'ionizer';

export const MEASUREMENT_TYPES: MeasurementType[] = ['temperature_humidity', 'luminosity', 'dustiness_iso6', 'dustiness_iso5', 'torque', 'surface_resistance', 'grounding_resistance', 'ionizer'];

export interface BaseMeasurement {
  id: string;
  date: string;
  location: string;
  type: MeasurementType;
  deviceId?: string; // Optional device ID for tracking equipment
  notes?: string;
}

export interface TemperatureHumidityMeasurement extends BaseMeasurement {
  type: 'temperature_humidity';
  temperature: number; // Celsius
  humidity: number; // percentage (%)
  limits: {
    temperatureMin: number;
    temperatureMax: number;
    humidityMin: number;
    humidityMax: number;
  };
}

export interface LuminosityMeasurement extends BaseMeasurement {
  type: 'luminosity';
  luminosity: number; // Lux
  limits: {
    min: number;
    max: number;
  };
}

export interface DustinessISO6Measurement extends BaseMeasurement {
  type: 'dustiness_iso6';
  particles_0_5um: number; // count
  particles_5um: number; // count
  limits: {
    particles_0_5um_min: number;
    particles_0_5um_max: number;
    particles_5um_min: number;
    particles_5um_max: number;
  };
}

export interface DustinessISO5Measurement extends BaseMeasurement {
  type: 'dustiness_iso5';
  particles_0_5um: number; // count
  particles_5um: number; // count
  limits: {
    particles_0_5um_min: number;
    particles_0_5um_max: number;
    particles_5um_min: number;
    particles_5um_max: number;
  };
}

export interface TorqueMeasurement extends BaseMeasurement {
  type: 'torque';
  screwdriverId: string;
  torqueValue: number; // Nm
  limits: {
    min: number;
    max: number;
  };
}

export interface SurfaceResistanceMeasurement extends BaseMeasurement {
  type: 'surface_resistance';
  material: string;
  resistance: number; // Ohms
  limits: {
    min: number;
    max: number;
  };
}

export interface GroundingResistanceMeasurement extends BaseMeasurement {
  type: 'grounding_resistance';
  pointId: string;
  resistance: number; // Ohms
  limits: {
    min: number;
    max: number;
  };
}

export interface IonizerMeasurement extends BaseMeasurement {
  type: 'ionizer';
  ionizerId: string;
  decayTimePositive: number; // seconds
  decayTimeNegative: number; // seconds
  balance: number; // Volts
  limits: { decayTime: number; balance: number; };
}

export type Measurement = TemperatureHumidityMeasurement | LuminosityMeasurement | DustinessISO6Measurement | DustinessISO5Measurement | TorqueMeasurement | SurfaceResistanceMeasurement | GroundingResistanceMeasurement | IonizerMeasurement;

// ISO Standards and Specifications
export interface ISOSpecification {
  measurementType: MeasurementType;
  isoStandard: string; // e.g., "ISO 14644-1"
  standardTitle: string; // e.g., "Classification of air cleanliness"
  description: string; // Detailed description
  requirements: string; // Specific requirements
  testingProcedure?: string; // Optional testing procedure
  referenceDocument?: string; // Optional reference document
  lastUpdated: string; // ISO date string
}

// Authentication & Authorization
export type UserRole = 'admin' | 'moderator';

export interface User {
  username: string;
  role: UserRole;
}

export interface UserCredentials {
  username: string;
  password: string;
}