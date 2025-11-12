import { Injectable, inject, computed } from '@angular/core';
import { DataService } from './data.service';
import { Measurement, MeasurementType } from '../models';

export interface StatisticsData {
  totalMeasurements: number;
  measurementsByType: Map<MeasurementType, number>;
  outOfSpecCount: number;
  outOfSpecPercentage: number;
  measurementsByLocation: Map<string, number>;
  recentTrends: {
    type: MeasurementType;
    trend: 'improving' | 'worsening' | 'stable';
    changePercent: number;
  }[];
  averagesByType: Map<MeasurementType, number>;
}

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private dataService = inject(DataService);

  statistics = computed<StatisticsData>(() => {
    const measurements = this.dataService.measurements();
    
    // Total measurements
    const totalMeasurements = measurements.length;
    
    // Count by type
    const measurementsByType = new Map<MeasurementType, number>();
    const measurementsByLocation = new Map<string, number>();
    let outOfSpecCount = 0;
    
    for (const m of measurements) {
      measurementsByType.set(m.type, (measurementsByType.get(m.type) || 0) + 1);
      measurementsByLocation.set(m.location, (measurementsByLocation.get(m.location) || 0) + 1);
      
      if (this.isOutOfSpec(m)) {
        outOfSpecCount++;
      }
    }
    
    const outOfSpecPercentage = totalMeasurements > 0 
      ? (outOfSpecCount / totalMeasurements) * 100 
      : 0;
    
    // Calculate averages by type
    const averagesByType = this.calculateAverages(measurements);
    
    // Calculate recent trends
    const recentTrends = this.calculateRecentTrends(measurements);
    
    return {
      totalMeasurements,
      measurementsByType,
      outOfSpecCount,
      outOfSpecPercentage,
      measurementsByLocation,
      recentTrends,
      averagesByType,
    };
  });

  private isOutOfSpec(m: Measurement): boolean {
    switch (m.type) {
      case 'temperature_humidity':
        return m.temperature < m.limits.temperatureMin || m.temperature > m.limits.temperatureMax ||
               m.humidity < m.limits.humidityMin || m.humidity > m.limits.humidityMax;
      case 'luminosity':
        return m.luminosity < m.limits.min || m.luminosity > m.limits.max;
      case 'dustiness_iso6':
        return m.particles_0_5um < m.limits.particles_0_5um_min || m.particles_0_5um > m.limits.particles_0_5um_max ||
               m.particles_5um < m.limits.particles_5um_min || m.particles_5um > m.limits.particles_5um_max;
      case 'dustiness_iso5':
        return m.particles_0_5um < m.limits.particles_0_5um_min || m.particles_0_5um > m.limits.particles_0_5um_max ||
               m.particles_5um < m.limits.particles_5um_min || m.particles_5um > m.limits.particles_5um_max;
      case 'torque':
        return m.torqueValue < m.limits.min || m.torqueValue > m.limits.max;
      case 'surface_resistance':
        return m.resistance < m.limits.min || m.resistance > m.limits.max;
      case 'grounding_resistance':
        return m.resistance < m.limits.min || m.resistance > m.limits.max;
      case 'ionizer':
        return m.balance > m.limits.balance || 
               m.decayTimePositive > m.limits.decayTime || 
               m.decayTimeNegative > m.limits.decayTime;
      default:
        return false;
    }
  }

  private calculateAverages(measurements: Measurement[]): Map<MeasurementType, number> {
    const averages = new Map<MeasurementType, number>();
    const sums = new Map<MeasurementType, { total: number; count: number }>();
    
    for (const m of measurements) {
      let value = 0;
      switch (m.type) {
        case 'temperature_humidity':
          value = m.temperature;
          break;
        case 'luminosity':
          value = m.luminosity;
          break;
        case 'dustiness_iso6':
        case 'dustiness_iso5':
          value = (m.particles_0_5um + m.particles_5um) / 2;
          break;
        case 'torque':
          value = m.torqueValue;
          break;
        case 'surface_resistance':
        case 'grounding_resistance':
          value = m.resistance;
          break;
        case 'ionizer':
          value = m.balance;
          break;
      }
      
      const current = sums.get(m.type) || { total: 0, count: 0 };
      sums.set(m.type, { total: current.total + value, count: current.count + 1 });
    }
    
    for (const [type, data] of sums.entries()) {
      averages.set(type, data.total / data.count);
    }
    
    return averages;
  }

  private calculateRecentTrends(measurements: Measurement[]): StatisticsData['recentTrends'] {
    const trends: StatisticsData['recentTrends'] = [];
    const typeGroups = new Map<MeasurementType, Measurement[]>();
    
    // Group by type
    for (const m of measurements) {
      if (!typeGroups.has(m.type)) {
        typeGroups.set(m.type, []);
      }
      typeGroups.get(m.type)!.push(m);
    }
    
    // Calculate trend for each type
    for (const [type, group] of typeGroups.entries()) {
      if (group.length < 2) {
        // Not enough data for trend, show as stable
        trends.push({ type, trend: 'stable', changePercent: 0 });
        continue;
      }
      
      // Sort by date (newest first)
      const sorted = [...group].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      // Split into two halves - recent and older
      const midPoint = Math.floor(sorted.length / 2);
      const recent = sorted.slice(0, midPoint);
      const older = sorted.slice(midPoint);
      
      if (recent.length === 0 || older.length === 0) {
        trends.push({ type, trend: 'stable', changePercent: 0 });
        continue;
      }
      
      const recentAvg = this.getAverageValue(recent);
      const olderAvg = this.getAverageValue(older);
      
      const changePercent = olderAvg !== 0 
        ? ((recentAvg - olderAvg) / olderAvg) * 100 
        : 0;
      
      let trend: 'improving' | 'worsening' | 'stable';
      if (Math.abs(changePercent) < 5) {
        trend = 'stable';
      } else if (changePercent < 0) {
        trend = 'improving'; // Lower values are better for most measurements
      } else {
        trend = 'worsening';
      }
      
      trends.push({ type, trend, changePercent });
    }
    
    return trends;
  }

  private getAverageValue(measurements: Measurement[]): number {
    if (measurements.length === 0) return 0;
    
    let sum = 0;
    for (const m of measurements) {
      switch (m.type) {
        case 'temperature_humidity':
          sum += m.temperature;
          break;
        case 'luminosity':
          sum += m.luminosity;
          break;
        case 'dustiness_iso6':
        case 'dustiness_iso5':
          sum += (m.particles_0_5um + m.particles_5um) / 2;
          break;
        case 'torque':
          sum += m.torqueValue;
          break;
        case 'surface_resistance':
        case 'grounding_resistance':
          sum += m.resistance;
          break;
        case 'ionizer':
          sum += m.balance;
          break;
      }
    }
    
    return sum / measurements.length;
  }
}
