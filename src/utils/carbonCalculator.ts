import { CarbonCalculatorInput, CarbonLog } from '../types';

// Emission factors (in kg CO2e)
export const EMISSION_FACTORS = {
  transportation: {
    petrol: 0.192,  // kg CO2 per km
    diesel: 0.171,  // kg CO2 per km
    hybrid: 0.104,  // kg CO2 per km
    electric: 0.047, // kg CO2 per km
    transit: 0.041,  // kg CO2 per km
    flight: 90.0,   // kg CO2 per flight hour
  },
  electricity: {
    gridKwh: 0.385, // kg CO2 per kWh
  },
  food: {
    meatMeal: 2.5,   // kg CO2 per meal
    vegMeal: 0.8,    // kg CO2 per meal
    veganMeal: 0.4,  // kg CO2 per meal
    localDiscountMax: 0.15, // Up to 15% discount for 100% local food
  },
  waste: {
    organic: 0.4,    // kg CO2 per kg
    nonRecyclable: 1.2, // kg CO2 per kg
  },
  shopping: {
    clothing: 8.0,      // kg CO2 per item
    electronics: 45.0,  // kg CO2 per item
    general: 3.0,       // kg CO2 per item
  },
};

export function calculateCO2Breakdown(input: CarbonCalculatorInput) {
  // 1. Transportation
  const carFactor = EMISSION_FACTORS.transportation[input.transportation.fuelType];
  const carCO2 = input.transportation.carKm * carFactor;
  const transitCO2 = input.transportation.transitKm * EMISSION_FACTORS.transportation.transit;
  const flightCO2 = input.transportation.flightHrs * EMISSION_FACTORS.transportation.flight;
  const transportationTotal = carCO2 + transitCO2 + flightCO2;

  // 2. Electricity
  const baseElectricityCO2 = input.electricity.kwh * EMISSION_FACTORS.electricity.gridKwh;
  // Offset based on renewable green energy percentage
  const electricityTotal = baseElectricityCO2 * (1 - input.electricity.renewablePct / 100);

  // 3. Food habits
  const rawFoodCO2 = (input.food.meatMeals * EMISSION_FACTORS.food.meatMeal) +
                     (input.food.vegMeals * EMISSION_FACTORS.food.vegMeal) +
                     (input.food.veganMeals * EMISSION_FACTORS.food.veganMeal);
  // Apply local ingredients reduction (up to 15% discount)
  const localDiscount = (input.food.localFoodPct / 100) * EMISSION_FACTORS.food.localDiscountMax;
  const foodTotal = rawFoodCO2 * (1 - localDiscount);

  // 4. Waste
  // Recycling offset reduces the impact of waste
  const recycledPct = input.waste.recycledPct;
  const recycledMultiplier = 1 - (recycledPct / 100) * 0.4; // 100% recycling cuts waste footprint by up to 40%
  const organicCO2 = input.waste.organicKg * EMISSION_FACTORS.waste.organic;
  const nonRecyclableCO2 = input.waste.nonRecyclableKg * EMISSION_FACTORS.waste.nonRecyclable;
  const wasteTotal = (organicCO2 + nonRecyclableCO2) * recycledMultiplier;

  // 5. Shopping
  const clothingCO2 = input.shopping.clothingItems * EMISSION_FACTORS.shopping.clothing;
  const electronicsCO2 = input.shopping.electronicsItems * EMISSION_FACTORS.shopping.electronics;
  const generalCO2 = input.shopping.generalItems * EMISSION_FACTORS.shopping.general;
  const shoppingTotal = clothingCO2 + electronicsCO2 + generalCO2;

  const total = Number((transportationTotal + electricityTotal + foodTotal + wasteTotal + shoppingTotal).toFixed(2));

  return {
    transportation: Number(transportationTotal.toFixed(2)),
    electricity: Number(electricityTotal.toFixed(2)),
    food: Number(foodTotal.toFixed(2)),
    waste: Number(wasteTotal.toFixed(2)),
    shopping: Number(shoppingTotal.toFixed(2)),
    total,
  };
}

export function createEmptyInput(): CarbonCalculatorInput {
  return {
    transportation: {
      carKm: 0,
      fuelType: 'petrol',
      transitKm: 0,
      flightHrs: 0,
    },
    electricity: {
      kwh: 0,
      renewablePct: 0,
    },
    food: {
      meatMeals: 0,
      vegMeals: 0,
      veganMeals: 0,
      localFoodPct: 0,
    },
    waste: {
      organicKg: 0,
      nonRecyclableKg: 0,
      recycledPct: 0,
    },
    shopping: {
      clothingItems: 0,
      electronicsItems: 0,
      generalItems: 0,
    },
  };
}

export function createDummyLogs(): CarbonLog[] {
  const categories: ('transportation' | 'electricity' | 'food' | 'waste' | 'shopping')[] = [
    'transportation', 'electricity', 'food', 'waste', 'shopping'
  ];

  const logs: CarbonLog[] = [];
  const today = new Date();
  
  // Format YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Generate logs for the last 30 days
  for (let i = 29; i >= 0; i--) {
    const logDate = new Date(today);
    logDate.setDate(today.getDate() - i);
    const dateStr = formatDate(logDate);

    // Add some random natural fluctuations
    const dayOfWeek = logDate.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const input: CarbonCalculatorInput = {
      transportation: {
        carKm: isWeekend ? Math.floor(Math.random() * 60) + 10 : Math.floor(Math.random() * 25) + 5,
        fuelType: 'petrol',
        transitKm: isWeekend ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 30) + 10,
        flightHrs: i === 15 ? 3 : 0, // 3 hours flight 15 days ago
      },
      electricity: {
        kwh: Math.floor(Math.random() * 5) + 8, // average 8-12 kwh a day
        renewablePct: 20,
      },
      food: {
        meatMeals: Math.floor(Math.random() * 2), // 0 to 1 meat meal
        vegMeals: Math.floor(Math.random() * 2) + 1, // 1 to 2 veg meal
        veganMeals: Math.floor(Math.random() * 2),
        localFoodPct: 30,
      },
      waste: {
        organicKg: Number((Math.random() * 1.5 + 0.5).toFixed(1)),
        nonRecyclableKg: Number((Math.random() * 1.0 + 0.2).toFixed(1)),
        recycledPct: 60,
      },
      shopping: {
        clothingItems: (i % 7 === 0) ? Math.floor(Math.random() * 2) : 0,
        electronicsItems: (i === 22) ? 1 : 0,
        generalItems: Math.floor(Math.random() * 3),
      },
    };

    const breakdown = calculateCO2Breakdown(input);
    logs.push({
      id: `log-${dateStr}`,
      date: dateStr,
      input,
      co2Breakdown: breakdown,
    });
  }

  return logs;
}

// Estimates
export const CO2_GOAL_DAILY = 12.0; // target 12 kg CO2 per day (vs Global Average of ~16kg, or U.S. average of ~40kg)

export function getCO2PerformanceText(co2Total: number) {
  if (co2Total === 0) return { label: 'No Data', color: 'text-gray-400', bg: 'bg-gray-100' };
  if (co2Total < CO2_GOAL_DAILY * 0.7) {
    return { label: 'Excellent (Green Hero)', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  } else if (co2Total <= CO2_GOAL_DAILY) {
    return { label: 'Eco Friendly (Good)', color: 'text-green-600', bg: 'bg-green-50' };
  } else if (co2Total <= CO2_GOAL_DAILY * 1.5) {
    return { label: 'Moderate', color: 'text-amber-600', bg: 'bg-amber-50' };
  } else {
    return { label: 'High Carbon Footprint', color: 'text-rose-600', bg: 'bg-rose-50' };
  }
}
