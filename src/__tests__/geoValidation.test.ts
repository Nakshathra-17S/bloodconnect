import { describe, it, expect } from './testRunner';
import { validateMysuruLocation, calculateDistanceKm, MYSURU_CENTER } from '../services/geoService';

describe('Mysuru District Geospatial Restriction Engine', () => {
  it('accepts Mysuru City Palace coordinates within the district boundary', () => {
    const res = validateMysuruLocation(12.3051, 76.6551);
    expect(res.isValid).toBe(true);
  });

  it('accepts K.R. Hospital coordinates in Mysuru', () => {
    const res = validateMysuruLocation(12.3168, 76.6508);
    expect(res.isValid).toBe(true);
  });

  it('accepts Nanjangud town coordinates within Mysuru district', () => {
    const res = validateMysuruLocation(12.1193, 76.6806);
    expect(res.isValid).toBe(true);
  });

  it('accepts Hunsur town coordinates within Mysuru district', () => {
    const res = validateMysuruLocation(12.3090, 76.2917);
    expect(res.isValid).toBe(true);
  });

  it('rejects Bengaluru coordinates outside Mysuru district', () => {
    const res = validateMysuruLocation(12.9716, 77.5946);
    expect(res.isValid).toBe(false);
    expect(res.message).toContain('BloodConnect is currently available only within Mysuru district, Karnataka');
  });

  it('rejects Mandya town coordinates outside Mysuru district', () => {
    const res = validateMysuruLocation(12.5242, 76.8958);
    expect(res.isValid).toBe(false);
  });

  it('rejects Kerala / Wayanad coordinates outside Karnataka and Mysuru district', () => {
    const res = validateMysuruLocation(11.6854, 76.1320);
    expect(res.isValid).toBe(false);
  });

  it('accurately computes approximate distance within Mysuru district', () => {
    // Distance between Mysuru City (12.3051, 76.6551) and Nanjangud (12.1193, 76.6806) is ~21 km
    const dist = calculateDistanceKm(12.3051, 76.6551, 12.1193, 76.6806);
    expect(dist).toBeGreaterThan(18);
    expect(dist).toBeLessThan(25);
  });
});
