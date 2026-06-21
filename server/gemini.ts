import { GoogleGenAI, Type } from '@google/genai';
import { AICoachFeedback, EcoChallenge } from '../src/types';

// Let's create a lazy initializer for GoogleGenAI
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    console.warn("GEMINI_API_KEY is not defined. EcoTrack AI will use smart local fallback coach.");
    return null;
  }

  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// Generates personalized eco coach feedback based on user logs
export async function getAICoachFeedback(
  logsSummary: string,
  userStats: string
): Promise<AICoachFeedback> {
  const ai = getAI();
  if (!ai) {
    return getLocalFallbackFeedback(logsSummary);
  }

  try {
    const prompt = `You are EcoTrack AI, an encouraging and expert Sustainability & Carbon Footprint Coach.
Analyze the user's carbon metrics and statistics below and output a highly personalized sustainability report.

USER STATS:
${userStats}

USER RECENT CARBON DIARY SUMMARY:
${logsSummary}

Find their highest emission categories and suggest concrete, actionable, and specific lifestyle adjustments starting with low-effort to high-impact. Give 3 personalizedSuggestions, 3 habitsRecommendations, and 3 sustainability tips. Ensure points/impact metrics are realistic.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are EcoTrack AI Coach. You speak with encouraging, friendly, and practical sustainability expertise. Speak in a helpful tone. Always return standard JSON conforming strictly to the requested schema. Do not output markdown codeblocks around JSON when responseMimeType is application/json.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sustainabilityScoreText: {
              type: Type.STRING,
              description: "A summary assessment of the user's progress (e.g. 'You are doing great on reducing transport, but focus is needed on household energy consumption.')"
            },
            scoreColor: {
              type: Type.STRING,
              description: "Must be one of: 'emerald', 'green', 'amber', 'rose' depending on their performance"
            },
            personalizedSuggestions: {
              type: Type.ARRAY,
              description: "Exactly 3 highly targeted suggestions tailored to the highest-emission categories",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "A punchy, clear action title" },
                  description: { type: Type.STRING, description: "Step-by-step instructions on how to do it" },
                  impact: { type: Type.STRING, description: "Estimated weekly offset, e.g., 'Saves ~4.5kg CO2/week'" },
                  category: {
                    type: Type.STRING,
                    description: "Category: 'transport', 'energy', 'food', 'waste', 'shopping'"
                  },
                  complexity: {
                    type: Type.STRING,
                    description: "'low', 'medium', or 'high'"
                  }
                },
                required: ['title', 'description', 'impact', 'category', 'complexity']
              }
            },
            habitsRecommendations: {
              type: Type.ARRAY,
              description: "Exactly 3 short eco habits the user should track daily (e.g. 'Turn off standby power', 'Eat 1 plant-based meal')",
              items: { type: Type.STRING }
            },
            tips: {
              type: Type.ARRAY,
              description: "3 bite-sized daily sustainability facts or tips",
              items: { type: Type.STRING }
            }
          },
          required: ['sustainabilityScoreText', 'scoreColor', 'personalizedSuggestions', 'habitsRecommendations', 'tips']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as AICoachFeedback;
    }
    throw new Error('Empty response from model');
  } catch (error) {
    console.error('Error invoking Gemini for Eco Coach:', error);
    return getLocalFallbackFeedback(logsSummary);
  }
}

// Generates 3 daily environmental challenges
export async function getAIDailyChallenges(
  highestCategory: string,
  completedIds: string[]
): Promise<EcoChallenge[]> {
  const ai = getAI();
  if (!ai) {
    return getLocalFallbackChallenges(highestCategory);
  }

  try {
    const prompt = `Generate exactly 3 custom daily eco challenges. 
Tailor at least one challenge specifically to address emissions in the "${highestCategory}" category.
Ensure these challenges are fun, engaging, and fit the gamification design. Exclude previous completed challenges: ${completedIds.join(', ')}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are EcoTrack AI. Always return JSON matching the specified schema exactly. Do not wrap JSON in markdown blocks when responseMimeType is application/json.",
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique string id (e.g. 'challenge-meat-free-monday')" },
              title: { type: Type.STRING, description: "Action-oriented title" },
              description: { type: Type.STRING, description: "Short description explaining how to complete" },
              points: { type: Type.INTEGER, description: "Suggested point reward (from 10 to 50 points, in multiples of 5)" },
              category: {
                type: Type.STRING,
                description: "Category: 'transport', 'energy', 'food', 'waste', 'shopping', 'general'"
              },
              difficulty: {
                type: Type.STRING,
                description: "Difficulty: 'easy', 'medium', 'hard'"
              },
              completed: { type: Type.BOOLEAN, description: "Defaults to false" }
            },
            required: ['id', 'title', 'description', 'points', 'category', 'difficulty', 'completed']
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as EcoChallenge[];
    }
    throw new Error('Empty challenge response');
  } catch (error) {
    console.error('Error invoking Gemini for Eco Challenges:', error);
    return getLocalFallbackChallenges(highestCategory);
  }
}

// Offline high-fidelity fallbacks
function getLocalFallbackFeedback(logsSummary: string): AICoachFeedback {
  // Parse logs summary crude analysis to find highest category
  let highest = 'transport';
  if (logsSummary.toLowerCase().includes('electricity')) highest = 'energy';
  else if (logsSummary.toLowerCase().includes('food')) highest = 'food';
  else if (logsSummary.toLowerCase().includes('shopping')) highest = 'shopping';

  const fallbacks: Record<string, AICoachFeedback> = {
    transport: {
      sustainabilityScoreText: "It looks like transit and vehicle usage represent your main carbon impacts. Switching to light-commutes or carpooling could optimize your score significantly!",
      scoreColor: "amber",
      personalizedSuggestions: [
        {
          title: "Carpool or Remote Days",
          description: "Organize shared commutes with a colleague or ask for a work-from-home day to cut transport footprint in half.",
          impact: "Saves ~12.5kg CO2e/week",
          category: "transport",
          complexity: "low"
        },
        {
          title: "Bicycle or Walk for Under 3km",
          description: "Use muscle-power instead of motor-power for neighborhood runs and errands, enjoying crisp air and aerobic health.",
          impact: "Saves ~6.0kg CO2e/week",
          category: "transport",
          complexity: "low"
        },
        {
          title: "Eco-Driving Techniques",
          description: "Maintain proper tire inflation and smooth acceleration/deceleration. Speeding and heavy braking increases fuel burn by 30%.",
          impact: "Saves ~4.2kg CO2e/week",
          category: "transport",
          complexity: "medium"
        }
      ],
      habitsRecommendations: [
        "Record car travel details",
        "Opt for public bus/train",
        "Perform errands on foot"
      ],
      tips: [
        "Did you know? Leaving your car home just two days a week can reduce greenhouse gas emissions by up to 1,600 kg annually.",
        "A standard electric vehicle in the US averages 60% fewer emissions compared to standard internal combustion engines.",
        "Walking or bicycling promotes personal fitness while bringing direct road-level exhaust noise down immediately."
      ]
    },
    energy: {
      sustainabilityScoreText: "Electricity consumption is your primary area for optimization. Small changes in household appliance habits yield large compound improvements.",
      scoreColor: "amber",
      personalizedSuggestions: [
        {
          title: "Smart Thermostat Adjustments",
          description: "Lower the heating by 1-2 degrees Celsius or raise AC by 1-2 degrees. You will barely notice the difference, but your grid draw drops by 8%.",
          impact: "Saves ~15.0kg CO2e/week",
          category: "energy",
          complexity: "low"
        },
        {
          title: "Wash Clothes in Cold Water Only",
          description: "Up to 75% to 90% of an automatic washing machine's electricity consumption goes purely into heating the water reservoir.",
          impact: "Saves ~5.5kg CO2e/week",
          category: "energy",
          complexity: "low"
        },
        {
          title: "Eliminate Vampiric Power Outlets",
          description: "Connect TV, microwave, and media stations to a master power strip and flip it off at night. Standby power represents 10% of residential bills.",
          impact: "Saves ~3.8kg CO2e/week",
          category: "energy",
          complexity: "medium"
        }
      ],
      habitsRecommendations: [
        "Unplug desktop when idle",
        "Air dry clothes",
        "Turn off secondary lights"
      ],
      tips: [
        "Standard incandescent lightbulbs waste 90% of their energy as radiant heat. Switching to LEDs saves immediate cash and carbon.",
        "Regularly cleaning or replacing dusty HVAC refrigerator filters maximizes air system fluid mechanics, reducing power draw by 15%.",
        "A desktop PC left on 24/7 can eat over $80 in power bills and generate up to 250 kg of pure carbon dioxide a year."
      ]
    },
    food: {
      sustainabilityScoreText: "Your food intake patterns indicate meat intake represents a high relative carbon footprint. Integrating more greens drives powerful reductions.",
      scoreColor: "amber",
      personalizedSuggestions: [
        {
          title: "Incorporate 'Meatless Mondays'",
          description: "Declare one full day of the week to be purely plant-based foods, exploring rich beans, lentils, mushrooms, and complex grains.",
          impact: "Saves ~18.5kg CO2e/week",
          category: "food",
          complexity: "low"
        },
        {
          title: "Prefer Local Seasonal Produce",
          description: "Buy food from street markets or local cooperative farms rather than foods flown in in insulated cold-storage from across continents.",
          impact: "Saves ~6.0kg CO2e/week",
          category: "food",
          complexity: "low"
        },
        {
          title: "Zero-Food-Waste Meal Prep",
          description: "Audit your kitchen inventory before shopping. Freezing leftover vegetables for homemade stocks turns potential rot into tasty meals.",
          impact: "Saves ~10.4kg CO2e/week",
          category: "food",
          complexity: "medium"
        }
      ],
      habitsRecommendations: [
        "Prepared at least one plant meal",
        "Avoided animal products",
        "Stored leftovers appropriately"
      ],
      tips: [
        "Producing 1 kg of beef yields nearly 60 times more greenhouse gas emissions than producing 1 kg of standard garden peas.",
        "Food waste accounts for approximately 8% of all global climate-warming emissions. If it were a country, it would be the 3rd largest emitter.",
        "Local eating avoids massive shipping, fuel shipping, and transport-sector carbon, while ensuring fresher, nutrient-dense ingredients."
      ]
    }
  };

  // Default fallback if no match or default
  return fallbacks[highest] || fallbacks.transport;
}

function getLocalFallbackChallenges(highestCategory: string): EcoChallenge[] {
  const allFallbackChallenges: EcoChallenge[] = [
    {
      id: 'local-chal-no-car',
      title: 'Pedal Powered Day',
      description: 'Commute to work or run all of todays errands using a bicycle, skateboard, or by walking.',
      points: 40,
      category: 'transport',
      difficulty: 'medium',
      completed: false,
    },
    {
      id: 'local-chal-cold-shower',
      title: 'Quick Cold Refresh',
      description: 'Take a short, refreshing shower under 5 minutes, keeping it room-temperature or cold to save raw heating electricity.',
      points: 25,
      category: 'energy',
      difficulty: 'medium',
      completed: false,
    },
    {
      id: 'local-chal-all-veggies',
      title: 'Green Plate Hero',
      description: 'Consume only vegetarian or plant-based meals today. No beef, chicken, or pork products.',
      points: 30,
      category: 'food',
      difficulty: 'easy',
      completed: false,
    },
    {
      id: 'local-chal-repost-clothes',
      title: 'Mend and Wear',
      description: 'Repurpose, stitch, or mend an old piece of clothing instead of going online to order a new item.',
      points: 35,
      category: 'shopping',
      difficulty: 'hard',
      completed: false,
    },
    {
      id: 'local-chal-unplug-standby',
      title: 'Vampire Slayer',
      description: 'Locate and unplug 5 idle wall chargers, screens, or kitchen devices that drain standby electricity when not in use.',
      points: 20,
      category: 'energy',
      difficulty: 'easy',
      completed: false,
    }
  ];

  // Try to find challenges corresponding to the highestCategory
  const matching = allFallbackChallenges.filter(c => c.category === highestCategory);
  if (matching.length >= 2) {
    return [...matching.slice(0, 2), allFallbackChallenges.find(c => c.category !== highestCategory)!];
  }
  return allFallbackChallenges.slice(0, 3);
}
