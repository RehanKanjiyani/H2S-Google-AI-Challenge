import React, { useState } from 'react';
import { CarbonCalculatorInput, CarbonLog } from '../types';
import { calculateCO2Breakdown, createEmptyInput, getCO2PerformanceText, CO2_GOAL_DAILY } from '../utils/carbonCalculator';
import { Car, Zap, Utensils, Trash2, ShoppingBag, Leaf, Save, Sparkles, CheckCircle } from 'lucide-react';

interface CarbonCalculatorProps {
  onSaveLog: (input: CarbonCalculatorInput) => void;
  selectedDate: string;
  currentLogForDate?: CarbonLog;
}

export default function CarbonCalculator({ onSaveLog, selectedDate, currentLogForDate }: CarbonCalculatorProps) {
  // Initialize state from existing log if available, else empty structure
  const [input, setInput] = useState<CarbonCalculatorInput>(() => {
    if (currentLogForDate) {
      return JSON.parse(JSON.stringify(currentLogForDate.input));
    }
    return createEmptyInput();
  });

  const [activeTab, setActiveTab] = useState<'transport' | 'electricity' | 'food' | 'waste' | 'shopping'>('transport');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Instant calculation based on current state
  const liveBreakdown = calculateCO2Breakdown(input);
  const perf = getCO2PerformanceText(liveBreakdown.total);

  const handleSave = () => {
    onSaveLog(input);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  // Helper to quickly update deep properties
  const updateTransportation = (field: keyof CarbonCalculatorInput['transportation'], value: any) => {
    setInput(prev => ({
      ...prev,
      transportation: { ...prev.transportation, [field]: value }
    }));
  };

  const updateElectricity = (field: keyof CarbonCalculatorInput['electricity'], value: any) => {
    setInput(prev => ({
      ...prev,
      electricity: { ...prev.electricity, [field]: value }
    }));
  };

  const updateFood = (field: keyof CarbonCalculatorInput['food'], value: any) => {
    setInput(prev => ({
      ...prev,
      food: { ...prev.food, [field]: value }
    }));
  };

  const updateWaste = (field: keyof CarbonCalculatorInput['waste'], value: any) => {
    setInput(prev => ({
      ...prev,
      waste: { ...prev.waste, [field]: value }
    }));
  };

  const updateShopping = (field: keyof CarbonCalculatorInput['shopping'], value: any) => {
    setInput(prev => ({
      ...prev,
      shopping: { ...prev.shopping, [field]: value }
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="calculator-root">
      {/* Settings Panel Inputs (Tabs) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 font-display">Daily Activity Logs</h2>
          <p className="text-xs text-slate-400">
            Log your consumption metrics for <strong className="text-emerald-700">{selectedDate}</strong>. Live feedback updates automatically.
          </p>
        </div>

        {/* Tab Selection */}
        <div 
          className="flex border-b border-slate-100 space-x-1 overflow-x-auto pb-1Scrollbar p-1 bg-slate-50 rounded-xl"
          role="tablist"
          aria-label="Activity input categories"
        >
          <button
            id="tab-transport"
            role="tab"
            aria-selected={activeTab === 'transport'}
            aria-controls="pane-transport"
            onClick={() => setActiveTab('transport')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold transition shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'transport' 
                ? 'bg-white text-slate-800 shadow-3xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Car className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            <span>Transportation</span>
          </button>
          <button
            id="tab-electricity"
            role="tab"
            aria-selected={activeTab === 'electricity'}
            aria-controls="pane-electricity"
            onClick={() => setActiveTab('electricity')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold transition shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'electricity' 
                ? 'bg-white text-slate-800 shadow-3xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span>Electricity</span>
          </button>
          <button
            id="tab-food"
            role="tab"
            aria-selected={activeTab === 'food'}
            aria-controls="pane-food"
            onClick={() => setActiveTab('food')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold transition shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'food' 
                ? 'bg-white text-slate-800 shadow-3xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Utensils className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span>Food Habits</span>
          </button>
          <button
            id="tab-waste"
            role="tab"
            aria-selected={activeTab === 'waste'}
            aria-controls="pane-waste"
            onClick={() => setActiveTab('waste')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold transition shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'waste' 
                ? 'bg-white text-slate-800 shadow-3xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trash2 className="w-4 h-4 text-teal-500" aria-hidden="true" />
            <span>Waste Gen</span>
          </button>
          <button
            id="tab-shopping"
            role="tab"
            aria-selected={activeTab === 'shopping'}
            aria-controls="pane-shopping"
            onClick={() => setActiveTab('shopping')}
            className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-semibold transition shrink-0 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeTab === 'shopping' 
                ? 'bg-white text-slate-800 shadow-3xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-rose-500" aria-hidden="true" />
            <span>Shopping</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="pt-2 min-h-64 flex flex-col justify-between">
          <div className="space-y-6">
            {/* 1. TRANSPORT */}
            {activeTab === 'transport' && (
              <div className="space-y-4" id="pane-transport" role="tabpanel" aria-labelledby="tab-transport">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-50">
                  <Car className="w-5 h-5 text-indigo-500" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-slate-700">Transit & Car Commutes</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="car-km-input" className="text-xs font-bold text-slate-500 block mb-1">Car Travel (km)</label>
                    <input 
                      type="number" 
                      id="car-km-input"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.transportation.carKm || ''}
                      onChange={(e) => updateTransportation('carKm', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 15"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Your daily commute in gasoline/electric light vehicles.</span>
                  </div>

                  <div>
                    <label htmlFor="fuel-type-select" className="text-xs font-bold text-slate-500 block mb-1">Engine Fuel Classification</label>
                    <select 
                      id="fuel-type-select"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.transportation.fuelType}
                      onChange={(e) => updateTransportation('fuelType', e.target.value as any)}
                    >
                      <option value="petrol">Unleaded Unleashed (Petrol)</option>
                      <option value="diesel">Standard Diesel</option>
                      <option value="hybrid">Clean Hybrid Engine</option>
                      <option value="electric">100% Electric Vehicle (EV)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="transit-km-input" className="text-xs font-bold text-slate-500 block mb-1">Public Transit / Trains (km)</label>
                    <input 
                      type="number" 
                      id="transit-km-input"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.transportation.transitKm || ''}
                      onChange={(e) => updateTransportation('transitKm', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 8"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Buses, subways, regional rail travel. Highly eco-efficient.</span>
                  </div>

                  <div>
                    <label htmlFor="flight-hrs-input" className="text-xs font-bold text-slate-500 block mb-1">Flight Hours Today</label>
                    <input 
                      type="number" 
                      id="flight-hrs-input"
                      min="0"
                      step="0.5"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.transportation.flightHrs || ''}
                      onChange={(e) => updateTransportation('flightHrs', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 1.5"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Cruising hours in domestic/international airplanes.</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. ELECTRICITY */}
            {activeTab === 'electricity' && (
              <div className="space-y-4" id="pane-electricity" role="tabpanel" aria-labelledby="tab-electricity">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-50">
                  <Zap className="w-5 h-5 text-amber-500" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-slate-700">Residential Grid Energy Draw</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="electricity-kwh-input" className="text-xs font-bold text-slate-500 block mb-1">Electricity Used Today (kWh)</label>
                    <input 
                      type="number" 
                      id="electricity-kwh-input"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.electricity.kwh || ''}
                      onChange={(e) => updateElectricity('kwh', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 10 (average US home uses ~30 kWh)"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Check your smart electricity tracker or energy bill.</span>
                  </div>

                  <div>
                    <label htmlFor="renewable-pct-slider" className="text-xs font-bold text-slate-500 block mb-1">Renewables or Green Contract (%)</label>
                    <div className="space-y-2 mt-2">
                      <input 
                        type="range" 
                        id="renewable-pct-slider"
                        min="0" 
                        max="100" 
                        className="w-full sm:accent-emerald-600 block accent-emerald-500 cursor-pointer"
                        value={input.electricity.renewablePct}
                        onChange={(e) => updateElectricity('renewablePct', parseInt(e.target.value) || 0)}
                      />
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Solar/Wind contribution</span>
                        <strong className="text-emerald-700 font-bold">{input.electricity.renewablePct}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. FOOD HABITS */}
            {activeTab === 'food' && (
              <div className="space-y-4" id="pane-food" role="tabpanel" aria-labelledby="tab-food">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-50">
                  <Utensils className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-slate-700">Daily Food & Meal Preferences</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="meat-meals-input" className="text-xs font-bold text-slate-500 block mb-1">Meat-Heavy Meals</label>
                    <input 
                      type="number" 
                      id="meat-meals-input"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.food.meatMeals || ''}
                      onChange={(e) => updateFood('meatMeals', parseInt(e.target.value) || 0)}
                      placeholder="Beef, chicken, pork, etc."
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Meat-heavy, high impact food.</span>
                  </div>

                  <div>
                    <label htmlFor="veg-meals-input" className="text-xs font-bold text-slate-500 block mb-1">Vegetarian Meals</label>
                    <input 
                      type="number" 
                      id="veg-meals-input"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.food.vegMeals || ''}
                      onChange={(e) => updateFood('vegMeals', parseInt(e.target.value) || 0)}
                      placeholder="Cheese/egg but no meat"
                    />
                  </div>

                  <div>
                    <label htmlFor="vegan-meals-input" className="text-xs font-bold text-slate-500 block mb-1">Vegan Meals</label>
                    <input 
                      type="number" 
                      id="vegan-meals-input"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.food.veganMeals || ''}
                      onChange={(e) => updateFood('veganMeals', parseInt(e.target.value) || 0)}
                      placeholder="Pure plants, grains, legumes"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label htmlFor="local-food-slider" className="text-xs font-bold text-slate-500 block mb-1">What percentage was sourced locally? (Under 100km)</label>
                  <div className="space-y-1">
                    <input 
                      type="range" 
                      id="local-food-slider"
                      min="0" 
                      max="100" 
                      className="w-full accent-emerald-500 cursor-pointer"
                      value={input.food.localFoodPct}
                      onChange={(e) => updateFood('localFoodPct', parseInt(e.target.value) || 0)}
                    />
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Reduces transportation food overheads</span>
                      <strong className="text-emerald-700 font-bold">{input.food.localFoodPct}% Local</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. WASTE */}
            {activeTab === 'waste' && (
              <div className="space-y-4" id="pane-waste" role="tabpanel" aria-labelledby="tab-waste">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-50">
                  <Trash2 className="w-5 h-5 text-teal-500" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-slate-700">Waste Generation & Compost</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="organic-waste-input" className="text-xs font-bold text-slate-500 block mb-1">Organic Waste Generated (kg)</label>
                    <input 
                      type="number" 
                      id="organic-waste-input"
                      min="0"
                      step="0.1"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.waste.organicKg || ''}
                      onChange={(e) => updateWaste('organicKg', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 0.8"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Peels, leftovers, degradable materials.</span>
                  </div>

                  <div>
                    <label htmlFor="non-recyclable-waste-input" className="text-xs font-bold text-slate-500 block mb-1">Non-recyclable / Landfill (kg)</label>
                    <input 
                      type="number" 
                      id="non-recyclable-waste-input"
                      min="0"
                      step="0.1"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.waste.nonRecyclableKg || ''}
                      onChange={(e) => updateWaste('nonRecyclableKg', parseFloat(e.target.value) || 0)}
                      placeholder="e.g. 0.4"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <label htmlFor="waste-recycled-slider" className="text-xs font-bold text-slate-500 block mb-1">Estimated Recycling Rate (%)</label>
                    <div className="space-y-1">
                      <input 
                        type="range" 
                        id="waste-recycled-slider"
                        min="0" 
                        max="100" 
                        className="w-full accent-teal-600 block cursor-pointer"
                        value={input.waste.recycledPct}
                        onChange={(e) => updateWaste('recycledPct', parseInt(e.target.value) || 0)}
                      />
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Paper, plastic, aluminum cans, cardboard recycled</span>
                        <strong className="text-teal-700 font-bold">{input.waste.recycledPct}%</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SHOPPING */}
            {activeTab === 'shopping' && (
              <div className="space-y-4" id="pane-shopping" role="tabpanel" aria-labelledby="tab-shopping">
                <div className="flex items-center space-x-2 pb-2 border-b border-slate-50">
                  <ShoppingBag className="w-5 h-5 text-rose-500" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-slate-700">Luxury Shopping & Consumer Purchases</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="clothing-items-input" className="text-xs font-bold text-slate-500 block mb-1">Clothing Items Bought</label>
                    <input 
                      type="number" 
                      id="clothing-items-input"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.shopping.clothingItems || ''}
                      onChange={(e) => updateShopping('clothingItems', parseInt(e.target.value) || 0)}
                      placeholder="e.g. 0"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">T-shirts, trousers, footwear (high chemical water footprint).</span>
                  </div>

                  <div>
                    <label htmlFor="electronics-items-input" className="text-xs font-bold text-slate-500 block mb-1">Electronics Items Bought</label>
                    <input 
                      type="number" 
                      id="electronics-items-input"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.shopping.electronicsItems || ''}
                      onChange={(e) => updateShopping('electronicsItems', parseInt(e.target.value) || 0)}
                      placeholder="e.g. 0"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Phones, gadget screens, cords (heavy rare earth metal extraction).</span>
                  </div>

                  <div>
                    <label htmlFor="general-items-input" className="text-xs font-bold text-slate-500 block mb-1">General Purchases / Furniture</label>
                    <input 
                      type="number" 
                      id="general-items-input"
                      min="0"
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500"
                      value={input.shopping.generalItems || ''}
                      onChange={(e) => updateShopping('generalItems', parseInt(e.target.value) || 0)}
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {currentLogForDate ? "🔄 This will update existing logged entries" : "📝 This will insert a new daily carbon card"}
            </span>

            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2.5 px-5 rounded-xl transition duration-200"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 animate-ping" />
                  <span>Log Recorded Successfully!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Log Entry</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Calculator Live Output Preview card */}
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-6 flex flex-col justify-between" id="calclive-sidebar">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Analysis Console</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">Real-time</span>
          </div>

          <div className="mt-6 text-center">
            <span className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold block">Total Estimated CO2</span>
            <span className="text-4xl font-black font-display text-white mt-1 block">{liveBreakdown.total}</span>
            <span className="text-xs text-slate-400 block mt-1">kilograms CO2e</span>
          </div>

          {/* Quick Bar Breakdown inside dark panel */}
          <div className="mt-8 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 font-display">Sector Composition</h4>
            
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Transportation:</span>
                <span className="text-slate-200 font-semibold">{liveBreakdown.transportation} kg</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-400" style={{ width: `${Math.min((liveBreakdown.transportation/Math.max(liveBreakdown.total, 1))*100, 100)}%` }} />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Electricity & Home:</span>
                <span className="text-slate-200 font-semibold">{liveBreakdown.electricity} kg</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400" style={{ width: `${Math.min((liveBreakdown.electricity/Math.max(liveBreakdown.total, 1))*100, 100)}%` }} />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Food & Intake:</span>
                <span className="text-slate-200 font-semibold">{liveBreakdown.food} kg</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: `${Math.min((liveBreakdown.food/Math.max(liveBreakdown.total, 1))*100, 100)}%` }} />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Waste Management:</span>
                <span className="text-slate-200 font-semibold">{liveBreakdown.waste} kg</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400" style={{ width: `${Math.min((liveBreakdown.waste/Math.max(liveBreakdown.total, 1))*100, 100)}%` }} />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Shopping Goods:</span>
                <span className="text-slate-200 font-semibold">{liveBreakdown.shopping} kg</span>
              </div>
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-rose-400" style={{ width: `${Math.min((liveBreakdown.shopping/Math.max(liveBreakdown.total, 1))*100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 bg-slate-800/40 p-4 rounded-xl space-y-1.5">
          <div className="flex items-center space-x-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-emerald-400">AI Assessment:</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-normal">
            Your live footprint of <strong>{liveBreakdown.total}kg</strong> is 
            {liveBreakdown.total <= CO2_GOAL_DAILY ? (
              <span className="text-emerald-400 font-bold"> safely under </span>
            ) : (
              <span className="text-rose-400 font-bold"> exceeding </span>
            )} 
            the ideal target threshold metric ({CO2_GOAL_DAILY}kg). Hit save above to persist.
          </p>
        </div>
      </div>
    </div>
  );
}
