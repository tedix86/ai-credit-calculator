/**
 * Fetch latest Azure OpenAI model pricing
 * Uses Azure Retail Prices API
 */

// Azure API endpoint
const AZURE_PRICING_API = 'https://prices.azure.com/api/retail/prices';

// Mapping between our model names and Azure's product names
const MODEL_MAPPING = {
  // GPT-4 models
  'GPT-4 2024-05-13 Global': {
    searchTerms: ['gpt-4o', 'gpt-4', '2024-05-13'],
    excludeTerms: ['mini', 'nano', 'turbo', 'vision', '32k']
  },
  'GPT-4 2024-05-13 Global mini': {
    searchTerms: ['gpt-4o-mini', 'gpt-4-mini', '2024-05-13', 'mini'],
    excludeTerms: ['nano']
  },
  'GPT-4 2024-05-13 Global nano': {
    searchTerms: ['gpt-4-nano', 'nano', '2024-05-13'],
    excludeTerms: []
  },
  'GPT-4 2024-05-13 Global chat': {
    searchTerms: ['gpt-4', 'chat', '2024-05-13'],
    excludeTerms: ['mini', 'nano', 'turbo', 'vision']
  },

  // GPT-4.1 models
  'GPT-4.1 2025-02-01 Global': {
    searchTerms: ['gpt-4.1', '2025-02-01'],
    excludeTerms: ['mini', 'nano']
  },
  'GPT-4.1 2025-02-01 Global mini': {
    searchTerms: ['gpt-4.1-mini', 'gpt-4.1', 'mini', '2025-02-01'],
    excludeTerms: ['nano']
  },
  'GPT-4.1 2025-02-01 Global nano': {
    searchTerms: ['gpt-4.1-nano', 'gpt-4.1', 'nano', '2025-02-01'],
    excludeTerms: []
  },
  'GPT-4.1 2025-02-01 Global chat': {
    searchTerms: ['gpt-4.1', 'chat', '2025-02-01'],
    excludeTerms: ['mini', 'nano']
  },

  // GPT-5 models
  'GPT-5 2025-08-07 Global': {
    searchTerms: ['gpt-5', '2025-08-07'],
    excludeTerms: ['mini', 'nano']
  },
  'GPT-5 2025-08-07 Global mini': {
    searchTerms: ['gpt-5-mini', 'gpt-5', 'mini', '2025-08-07'],
    excludeTerms: ['nano']
  },
  'GPT-5 2025-08-07 Global nano': {
    searchTerms: ['gpt-5-nano', 'gpt-5', 'nano', '2025-08-07'],
    excludeTerms: []
  },
  'GPT-5 2025-08-07 Global chat': {
    searchTerms: ['gpt-5', 'chat', '2025-08-07'],
    excludeTerms: ['mini', 'nano']
  }
};

/**
 * Fetch Azure OpenAI pricing data
 * @param {string} region - Azure region (default: 'eastus')
 * @returns {Promise<Object>} Pricing data by model
 */
export async function fetchAzureOpenAIPricing(region = 'eastus') {
  try {
    // Build query for Azure Cognitive Services OpenAI
    const filter = `serviceName eq 'Cognitive Services' and armRegionName eq '${region}'`;
    const url = `${AZURE_PRICING_API}?$filter=${encodeURIComponent(filter)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch pricing: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Parse and organize pricing data
    return parsePricingData(data.Items);
  } catch (error) {
    console.error('Error fetching Azure pricing:', error);
    throw error;
  }
}

/**
 * Parse Azure pricing API response and extract model prices
 * @param {Array} items - Pricing items from Azure API
 * @returns {Object} Organized pricing by model
 */
function parsePricingData(items) {
  const modelPricing = {};

  // Filter for OpenAI items
  const openAIItems = items.filter(item =>
    item.productName &&
    (item.productName.toLowerCase().includes('openai') ||
     item.productName.toLowerCase().includes('gpt'))
  );

  // Process each model
  for (const [modelName, mapping] of Object.entries(MODEL_MAPPING)) {
    const modelItems = openAIItems.filter(item => {
      const productName = item.productName.toLowerCase();
      const meterName = (item.meterName || '').toLowerCase();

      // Check if it matches search terms
      const matchesSearch = mapping.searchTerms.some(term =>
        productName.includes(term.toLowerCase()) || meterName.includes(term.toLowerCase())
      );

      // Check if it should be excluded
      const shouldExclude = mapping.excludeTerms.some(term =>
        productName.includes(term.toLowerCase()) || meterName.includes(term.toLowerCase())
      );

      return matchesSearch && !shouldExclude;
    });

    // Extract input and output token prices
    const inputItem = modelItems.find(item =>
      (item.meterName || '').toLowerCase().includes('input') ||
      (item.meterName || '').toLowerCase().includes('prompt')
    );

    const outputItem = modelItems.find(item =>
      (item.meterName || '').toLowerCase().includes('output') ||
      (item.meterName || '').toLowerCase().includes('completion')
    );

    if (inputItem || outputItem) {
      modelPricing[modelName] = {
        input: inputItem ? parseFloat(inputItem.retailPrice) : 0,
        output: outputItem ? parseFloat(outputItem.retailPrice) : 0
      };
    }
  }

  return modelPricing;
}

/**
 * Get hardcoded latest known prices as fallback
 * Updated as of February 2026
 * Note: PTU capacity values are estimates - update with actual Azure documentation
 * @returns {Object} Model pricing
 */
export function getLatestKnownPrices() {
  return {
    // GPT-4 models (2024-05-13 Global)
    'GPT-4 2024-05-13 Global': {
      input: 30.0,   // $30 per 1M input tokens
      output: 60.0,  // $60 per 1M output tokens
      ptuCapacity: 4000 // tokens/sec per PTU
    },
    'GPT-4 2024-05-13 Global mini': {
      input: 0.15,   // $0.15 per 1M input tokens
      output: 0.6,   // $0.60 per 1M output tokens
      ptuCapacity: 8000 // tokens/sec per PTU
    },
    'GPT-4 2024-05-13 Global nano': {
      input: 0.075,  // $0.075 per 1M input tokens
      output: 0.3,   // $0.30 per 1M output tokens
      ptuCapacity: 12000 // tokens/sec per PTU
    },
    'GPT-4 2024-05-13 Global chat': {
      input: 30.0,   // $30 per 1M input tokens
      output: 60.0,  // $60 per 1M output tokens
      ptuCapacity: 4000 // tokens/sec per PTU
    },

    // GPT-4.1 models (2025-02-01 Global)
    'GPT-4.1 2025-02-01 Global': {
      input: 10.0,   // $10 per 1M input tokens
      output: 30.0,  // $30 per 1M output tokens
      ptuCapacity: 4500 // tokens/sec per PTU
    },
    'GPT-4.1 2025-02-01 Global mini': {
      input: 0.15,   // $0.15 per 1M input tokens
      output: 0.6,   // $0.60 per 1M output tokens
      ptuCapacity: 9000 // tokens/sec per PTU
    },
    'GPT-4.1 2025-02-01 Global nano': {
      input: 0.075,  // $0.075 per 1M input tokens
      output: 0.3,   // $0.30 per 1M output tokens
      ptuCapacity: 13000 // tokens/sec per PTU
    },
    'GPT-4.1 2025-02-01 Global chat': {
      input: 10.0,   // $10 per 1M input tokens
      output: 30.0,  // $30 per 1M output tokens
      ptuCapacity: 4500 // tokens/sec per PTU
    },

    // GPT-5 models (2025-08-07 Global)
    'GPT-5 2025-08-07 Global': {
      input: 15.0,   // $15 per 1M input tokens
      output: 45.0,  // $45 per 1M output tokens
      ptuCapacity: 4200 // tokens/sec per PTU
    },
    'GPT-5 2025-08-07 Global mini': {
      input: 0.20,   // $0.20 per 1M input tokens
      output: 0.80,  // $0.80 per 1M output tokens
      ptuCapacity: 8500 // tokens/sec per PTU
    },
    'GPT-5 2025-08-07 Global nano': {
      input: 0.10,   // $0.10 per 1M input tokens
      output: 0.40,  // $0.40 per 1M output tokens
      ptuCapacity: 12500 // tokens/sec per PTU
    },
    'GPT-5 2025-08-07 Global chat': {
      input: 15.0,   // $15 per 1M input tokens
      output: 45.0,  // $45 per 1M output tokens
      ptuCapacity: 4200 // tokens/sec per PTU
    }
  };
}

/**
 * Fetch pricing with fallback to known prices
 * @param {string} region - Azure region
 * @returns {Promise<Object>} Model pricing
 */
export async function fetchPricingWithFallback(region = 'eastus') {
  try {
    const pricing = await fetchAzureOpenAIPricing(region);

    // If no pricing data found, use fallback
    if (Object.keys(pricing).length === 0) {
      console.warn('No pricing data found from Azure API, using latest known prices');
      return getLatestKnownPrices();
    }

    return pricing;
  } catch (error) {
    console.warn('Failed to fetch Azure pricing, using latest known prices:', error);
    return getLatestKnownPrices();
  }
}
