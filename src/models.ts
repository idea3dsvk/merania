export const MEASUREMENT_TYPE_VALUES = [
  'temperature_humidity',
  'luminosity',
  'dustiness_iso6',
  'dustiness_iso5',
  'torque',
  'surface_resistance',
  'grounding_resistance',
  'ionizer',
] as const;

export type KnownMeasurementType = (typeof MEASUREMENT_TYPE_VALUES)[number];
export type DustinessMeasurementType = `dustiness_iso${number}`;
export type DynamicLuminosityMeasurementType = `luminosity_${string}`;
export type LuminosityMeasurementType = 'luminosity' | DynamicLuminosityMeasurementType;
export type MeasurementType = KnownMeasurementType | DustinessMeasurementType | DynamicLuminosityMeasurementType;

export const MEASUREMENT_TYPES: KnownMeasurementType[] = [...MEASUREMENT_TYPE_VALUES];

export type SpecificationType = MeasurementType | (string & {});

export function isDustinessMeasurementType(type: string): type is DustinessMeasurementType {
  return /^dustiness_iso\d+$/.test(type);
}

export function isLuminosityMeasurementType(type: string): type is LuminosityMeasurementType {
  return type === 'luminosity' || /^luminosity_[a-z0-9_]+$/.test(type);
}

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
  type: LuminosityMeasurementType;
  luminosity: number; // Lux
  limits: {
    min: number;
    max: number;
  };
}

export interface DustinessMeasurement extends BaseMeasurement {
  type: DustinessMeasurementType;
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

export type Measurement = TemperatureHumidityMeasurement | LuminosityMeasurement | DustinessMeasurement | TorqueMeasurement | SurfaceResistanceMeasurement | GroundingResistanceMeasurement | IonizerMeasurement;

export function isDustinessMeasurement(measurement: Measurement): measurement is DustinessMeasurement {
  return isDustinessMeasurementType(measurement.type);
}

export function isLuminosityMeasurement(measurement: Measurement): measurement is LuminosityMeasurement {
  return isLuminosityMeasurementType(measurement.type);
}

// ISO Standards and Specifications
export interface ISOSpecification {
  measurementType: SpecificationType;
  displayName?: string;
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

// Audit Trail
export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import';
export type AuditEntityType = 'measurement' | 'limit' | 'specification' | 'user' | 'system';

export interface AuditLog {
  id: string;
  timestamp: string; // ISO date string
  userId: string;
  userEmail: string;
  userName: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string; // ID of the affected entity (measurement, specification, etc.)
  changes?: AuditChange[]; // Details of what changed
  metadata?: Record<string, any>; // Additional context (e.g., IP address, device info)
}

export interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
}