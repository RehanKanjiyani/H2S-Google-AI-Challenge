import { describe, it, expect } from 'vitest';
import { calculateCO2Breakdown, createEmptyInput, getCO2PerformanceText } from './carbonCalculator';

describe('Carbon Calculator', () => {
  it('creates an empty input correctly', () => {
    const empty = createEmptyInput();
    expect(empty.transportation.carKm).toBe(0);
    expect(empty.transportation.fuelType).toBe('petrol');
    expect(empty.electricity.kwh).toBe(0);
    expect(empty.food.meatMeals).toBe(0);
    expect(empty.waste.organicKg).toBe(0);
    expect(empty.shopping.clothingItems).toBe(0);
  });

  it('calculates zero CO2 breakdown for empty input', () => {
    const empty = createEmptyInput();
    const breakdown = calculateCO2Breakdown(empty);
    expect(breakdown.transportation).toBe(0);
    expect(breakdown.electricity).toBe(0);
    expect(breakdown.food).toBe(0);
    expect(breakdown.waste).toBe(0);
    expect(breakdown.shopping).toBe(0);
    expect(breakdown.total).toBe(0);
  });

  it('calculates transportation emissions with different fuel types correctly', () => {
    const input = createEmptyInput();
    input.transportation.carKm = 100;
    
    // Petrol
    input.transportation.fuelType = 'petrol';
    expect(calculateCO2Breakdown(input).transportation).toBe(19.2); // 100 * 0.192

    // Diesel
    input.transportation.fuelType = 'diesel';
    expect(calculateCO2Breakdown(input).transportation).toBe(17.1); // 100 * 0.171

    // Hybrid
    input.transportation.fuelType = 'hybrid';
    expect(calculateCO2Breakdown(input).transportation).toBe(10.4); // 100 * 0.104

    // Electric
    input.transportation.fuelType = 'electric';
    expect(calculateCO2Breakdown(input).transportation).toBe(4.7); // 100 * 0.047
  });

  it('calculates transit and flight emissions correctly', () => {
    const input = createEmptyInput();
    input.transportation.transitKm = 50;
    input.transportation.flightHrs = 2;
    const breakdown = calculateCO2Breakdown(input);
    // 50 * 0.041 + 2 * 90.0 = 2.05 + 180.0 = 182.05
    expect(breakdown.transportation).toBe(182.05);
  });

  it('calculates electricity with renewable discounts correctly', () => {
    const input = createEmptyInput();
    input.electricity.kwh = 100;
    
    // 0% renewable
    input.electricity.renewablePct = 0;
    expect(calculateCO2Breakdown(input).electricity).toBe(38.5); // 100 * 0.385

    // 50% renewable
    input.electricity.renewablePct = 50;
    expect(calculateCO2Breakdown(input).electricity).toBe(19.25); // 38.5 * 0.5

    // 100% renewable
    input.electricity.renewablePct = 100;
    expect(calculateCO2Breakdown(input).electricity).toBe(0); // 38.5 * 0
  });

  it('calculates organic and food meals with local food reductions correctly', () => {
    const input = createEmptyInput();
    input.food.meatMeals = 2; // 2 * 2.5 = 5.0
    input.food.vegMeals = 3;  // 3 * 0.8 = 2.4
    input.food.veganMeals = 1; // 1 * 0.4 = 0.4
    // Raw sum = 7.8
    
    // 0% local
    input.food.localFoodPct = 0;
    expect(calculateCO2Breakdown(input).food).toBe(7.8);

    // 100% local (gives maximum 15% discount)
    input.food.localFoodPct = 100;
    // 7.8 * (1 - 0.15) = 7.8 * 0.85 = 6.63
    expect(calculateCO2Breakdown(input).food).toBe(6.63);
  });

  it('calculates waste with recycling reductions', () => {
    const input = createEmptyInput();
    input.waste.organicKg = 10; // 10 * 0.4 = 4.0
    input.waste.nonRecyclableKg = 5; // 5 * 1.2 = 6.0
    // Raw sum = 10.0

    // 0% recycling
    input.waste.recycledPct = 0;
    expect(calculateCO2Breakdown(input).waste).toBe(10);

    // 50% recycling cuts waste footprint by up to 20%
    input.waste.recycledPct = 50;
    expect(calculateCO2Breakdown(input).waste).toBe(8);

    // 100% recycling cuts waste footprint by up to 40%
    input.waste.recycledPct = 100;
    expect(calculateCO2Breakdown(input).waste).toBe(6);
  });

  it('calculates shopping emissions correctly', () => {
    const input = createEmptyInput();
    input.shopping.clothingItems = 2; // 2 * 8.0 = 16.0
    input.shopping.electronicsItems = 1; // 1 * 45 = 45.0
    input.shopping.generalItems = 3; // 3 * 3 = 9.0
    // Total = 70.0
    expect(calculateCO2Breakdown(input).shopping).toBe(70.0);
  });

  it('returns appropriate quality descriptions for CO2 performance', () => {
    expect(getCO2PerformanceText(0).label).toContain('No Data');
    expect(getCO2PerformanceText(5).label).toContain('Excellent');
    expect(getCO2PerformanceText(11).label).toContain('Eco Friendly');
    expect(getCO2PerformanceText(15).label).toContain('Moderate');
    expect(getCO2PerformanceText(35).label).toContain('High Carbon Footprint');
  });
});
