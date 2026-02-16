// Default Azure OpenAI model pricing (per 1M tokens)
// Note: These are placeholder values - users should update with actual Azure pricing
// PTU capacity is measured in tokens/second per PTU
export const DEFAULT_MODEL_PRICING = {
  // GPT-4 models (2024-05-13 Global)
  'GPT-4 2024-05-13 Global': {
    input: 30.0,
    output: 60.0,
    ptuCapacity: 4000 // tokens/sec per PTU
  },
  'GPT-4 2024-05-13 Global mini': {
    input: 0.15,
    output: 0.6,
    ptuCapacity: 8000 // tokens/sec per PTU (smaller models have higher throughput)
  },
  'GPT-4 2024-05-13 Global nano': {
    input: 0.075,
    output: 0.3,
    ptuCapacity: 12000 // tokens/sec per PTU
  },
  'GPT-4 2024-05-13 Global chat': {
    input: 30.0,
    output: 60.0,
    ptuCapacity: 4000 // tokens/sec per PTU
  },

  // GPT-4.1 models (2025-02-01 Global)
  'GPT-4.1 2025-02-01 Global': {
    input: 10.0,
    output: 30.0,
    ptuCapacity: 4500 // tokens/sec per PTU
  },
  'GPT-4.1 2025-02-01 Global mini': {
    input: 0.15,
    output: 0.6,
    ptuCapacity: 9000 // tokens/sec per PTU
  },
  'GPT-4.1 2025-02-01 Global nano': {
    input: 0.075,
    output: 0.3,
    ptuCapacity: 13000 // tokens/sec per PTU
  },
  'GPT-4.1 2025-02-01 Global chat': {
    input: 10.0,
    output: 30.0,
    ptuCapacity: 4500 // tokens/sec per PTU
  },

  // GPT-5 models (2025-08-07 Global)
  'GPT-5 2025-08-07 Global': {
    input: 15.0,
    output: 45.0,
    ptuCapacity: 4200 // tokens/sec per PTU
  },
  'GPT-5 2025-08-07 Global mini': {
    input: 0.2,
    output: 0.8,
    ptuCapacity: 8500 // tokens/sec per PTU
  },
  'GPT-5 2025-08-07 Global nano': {
    input: 0.1,
    output: 0.4,
    ptuCapacity: 12500 // tokens/sec per PTU
  },
  'GPT-5 2025-08-07 Global chat': {
    input: 15.0,
    output: 45.0,
    ptuCapacity: 4200 // tokens/sec per PTU
  }
};

export const AVAILABLE_MODELS = [
  'GPT-4 2024-05-13 Global',
  'GPT-4 2024-05-13 Global mini',
  'GPT-4 2024-05-13 Global nano',
  'GPT-4 2024-05-13 Global chat',
  'GPT-4.1 2025-02-01 Global',
  'GPT-4.1 2025-02-01 Global mini',
  'GPT-4.1 2025-02-01 Global nano',
  'GPT-4.1 2025-02-01 Global chat',
  'GPT-5 2025-08-07 Global',
  'GPT-5 2025-08-07 Global mini',
  'GPT-5 2025-08-07 Global nano',
  'GPT-5 2025-08-07 Global chat'
];

// Global settings defaults
export const DEFAULT_SETTINGS = {
  // AI credit conversion
  aiCreditConversionRate: 200, // $1 = 200 credits

  // Reranker
  rerankerCostPerAction: 0.001, // $0.001 per action

  // Pay-as-You-Go settings
  payGoDiscountPercent: 20, // 20% discount

  // Caching settings
  inputTokenCachingPercent: 25, // 25% of input tokens are cached
  cachedTokenDiscountPercent: 75, // 75% discount on cached tokens

  // PTU settings
  yearlyPTUCost: 2652, // $2,652 per PTU per year
  ptuIncrements: 25, // PTUs come in increments of 25

  // Context
  contextWindow: 1000000 // 1M tokens
};

// Default customer metrics
export const DEFAULT_CUSTOMER_METRICS = {
  newCustomersPerYear: [1], // Number of new customers acquired each year (cohorts)
  avgUsersPerCustomer: 100,
  adoptionRateByYear: [10], // User adoption % based on customer tenure (Year 1 = 10%, Year 2 = 20%, etc.)
  avgActionsPerUser: 10 // per day
};

// Default AI action
export const DEFAULT_ACTION = {
  name: 'New AI Action',
  requests: [
    {
      id: crypto.randomUUID(),
      model: 'GPT-4.1 2025-02-01 Global mini',
      numRequests: 1,
      avgInputTokens: 1000,
      avgOutputTokens: 500
    }
  ],
  useReranker: false
};

// Create a default estimation view
export const createDefaultView = () => ({
  id: crypto.randomUUID(),
  name: 'Untitled Estimation',
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  modelPricing: { ...DEFAULT_MODEL_PRICING },
  action: {
    ...DEFAULT_ACTION,
    requests: [{
      id: crypto.randomUUID(),
      model: 'GPT-4.1 2025-02-01 Global mini',
      numRequests: 1,
      avgInputTokens: 1000,
      avgOutputTokens: 500
    }]
  },
  customerMetrics: { ...DEFAULT_CUSTOMER_METRICS },
  settings: { ...DEFAULT_SETTINGS }
});

// LocalStorage key
export const STORAGE_KEY = 'ai-credit-calculator-views';
