import pricingData from "@/assets/pricing.json";

// Helper function to map model ID to pricing key
const getModelPricingKey = (modelId: string): string => {
  // Map model IDs to pricing.json keys
  const modelMappings: { [key: string]: string } = {
    'gemini-3.1-pro-preview': 'gemini-2.5-pro-preview',
    'gemini-3-flash-preview': 'gemini-2.5-flash-preview',
    'gemini-3.1-flash-lite-preview': 'gemini-2.5-flash-preview',
    'gemini-2.5-pro': 'gemini-2.5-pro-preview',
    'gemini-2.5-flash': 'gemini-2.5-flash-preview',
    'gemini-2.5-flash-lite': 'gemini-2.5-flash-preview',
    'gemini-2.5-flash-live-preview': 'gemini-2.5-flash-native-audio',
    'gemini-3-pro-image-preview': 'imagen-3',
    'gemini-3.1-flash-image-preview': 'imagen-3',
    'gemini-2.5-flash-image': 'imagen-3',
    'imagen-4.0-generate-preview-06-06': 'imagen-3',
    'veo-3.1-generate-preview': 'veo-2',
    'gemini-embedding-001': 'text-embedding-004',
    'gemini-2.5-pro-preview-05-06': 'gemini-2.5-pro-preview',
    'gemini-2.5-flash-preview-05-20': 'gemini-2.5-flash-preview',
    'gemini-2.5-flash-preview-tts': 'gemini-2.5-flash-preview-tts',
    'gemini-2.5-pro-preview-tts': 'gemini-2.5-pro-preview-tts',
    'gemini-2.5-flash-preview-native-audio-dialog': 'gemini-2.5-flash-native-audio',
    'gemini-2.0-flash-001': 'gemini-2.0-flash',
    'gemini-2.0-flash-lite-001': 'gemini-2.0-flash-lite',
    'gemini-2.0-flash-preview-image-generation': 'gemini-2.0-flash',
    'imagen-3.0-generate-002': 'imagen-3',
    'veo-2.0-generate-001': 'veo-2',
    'gemini-1.5-flash-002': 'gemini-1.5-flash',
    'gemini-1.5-flash-8b-001': 'gemini-1.5-flash-8b',
    'gemini-1.5-pro-002': 'gemini-1.5-pro',
    'models/text-embedding-004': 'text-embedding-004',
  };
  
  return modelMappings[modelId] || modelId;
};

// Get pricing rates for a specific model
const getModelPricing = (modelId: string, tokenCount: number = 0) => {
  const currentTextPricing: Record<string, { inputRate: number; outputRate: number }> = {
    'gemini-3.5-flash': { inputRate: 1.5 / 1000000, outputRate: 9 / 1000000 },
    'gemini-flash-latest': { inputRate: 1.5 / 1000000, outputRate: 9 / 1000000 },
    'gemini-3.1-pro-preview': {
      inputRate: (tokenCount <= 200000 ? 2 : 4) / 1000000,
      outputRate: (tokenCount <= 200000 ? 12 : 18) / 1000000,
    },
    'gemini-pro-latest': {
      inputRate: (tokenCount <= 200000 ? 2 : 4) / 1000000,
      outputRate: (tokenCount <= 200000 ? 12 : 18) / 1000000,
    },
    'gemini-3-flash-preview': { inputRate: 0.5 / 1000000, outputRate: 3 / 1000000 },
    'gemini-3.1-flash-lite': { inputRate: 0.25 / 1000000, outputRate: 1.5 / 1000000 },
    'gemini-flash-lite-latest': { inputRate: 0.25 / 1000000, outputRate: 1.5 / 1000000 },
    'gemini-3.5-live-translate-preview': { inputRate: 3.5 / 1000000, outputRate: 21 / 1000000 },
  };
  const currentPricing = currentTextPricing[modelId];
  if (currentPricing) return { ...currentPricing, unit: 'per 1M tokens' };

  const pricingKey = getModelPricingKey(modelId);
  const pricing = pricingData[pricingKey as keyof typeof pricingData];
  
  if (!pricing) {
    // Fallback to basic rates if model not found
    return {
      inputRate: 0.000001,
      outputRate: 0.000003,
      unit: 'per 1M tokens'
    };
  }

  // Handle models with no paid tier pricing
  if ('paid_tier_pricing' in pricing) {
    return {
      inputRate: 0,
      outputRate: 0,
      unit: 'free'
    };
  }

  // Handle image generation models
  if ('image_price_usd' in pricing) {
    return {
      inputRate: 0,
      outputRate: pricing.image_price_usd,
      unit: pricing.unit || 'per image'
    };
  }

  // Handle video generation models
  if ('video_price_usd' in pricing) {
    return {
      inputRate: 0,
      outputRate: pricing.video_price_usd,
      unit: pricing.unit || 'per second'
    };
  }

  // Handle models with input_price_usd and output_price_usd
  if ('input_price_usd' in pricing && 'output_price_usd' in pricing) {
    // Handle different pricing structures
    if (typeof pricing.input_price_usd === 'number') {
      // Simple pricing structure
      return {
        inputRate: pricing.input_price_usd / 1000000,
        outputRate: (typeof pricing.output_price_usd === 'number' ? pricing.output_price_usd : 0) / 1000000,
        unit: pricing.unit || 'per 1M tokens'
      };
    } else if (typeof pricing.input_price_usd === 'object') {
      // Complex pricing structure - choose appropriate rate
      let inputRate = 0;
      let outputRate = 0;

      // Handle input pricing
      if ('text_image_video' in pricing.input_price_usd) {
        inputRate = pricing.input_price_usd.text_image_video / 1000000;
      } else if ('prompts_<=_128k_tokens' in pricing.input_price_usd) {
        // Tiered pricing based on token count
        inputRate = tokenCount <= 128000 
          ? pricing.input_price_usd['prompts_<=_128k_tokens'] / 1000000
          : pricing.input_price_usd['prompts_>_128k_tokens'] / 1000000;
      } else if ('prompts_<=_200k_tokens' in pricing.input_price_usd) {
        // Tiered pricing for 2.5 Pro
        inputRate = tokenCount <= 200000 
          ? pricing.input_price_usd['prompts_<=_200k_tokens'] / 1000000
          : pricing.input_price_usd['prompts_>_200k_tokens'] / 1000000;
      } else if ('text' in pricing.input_price_usd) {
        inputRate = pricing.input_price_usd.text / 1000000;
      }

      // Handle output pricing
      if (typeof pricing.output_price_usd === 'number') {
        outputRate = pricing.output_price_usd / 1000000;
      } else if (typeof pricing.output_price_usd === 'object') {
        if ('non_thinking' in pricing.output_price_usd) {
          // Use non-thinking rate as default
          outputRate = pricing.output_price_usd.non_thinking / 1000000;
        } else if ('prompts_<=_128k_tokens' in pricing.output_price_usd) {
          outputRate = tokenCount <= 128000 
            ? pricing.output_price_usd['prompts_<=_128k_tokens'] / 1000000
            : pricing.output_price_usd['prompts_>_128k_tokens'] / 1000000;
        } else if ('prompts_<=_200k_tokens' in pricing.output_price_usd) {
          outputRate = tokenCount <= 200000 
            ? pricing.output_price_usd['prompts_<=_200k_tokens'] / 1000000
            : pricing.output_price_usd['prompts_>_200k_tokens'] / 1000000;
        } else if ('text' in pricing.output_price_usd) {
          outputRate = pricing.output_price_usd.text / 1000000;
        }
      }

      return {
        inputRate,
        outputRate,
        unit: pricing.unit || 'per 1M tokens'
      };
    }
  }

  // Fallback
  return {
    inputRate: 0.000001,
    outputRate: 0.000003,
    unit: 'per 1M tokens'
  };
};

// Calculate token count (rough estimation)
export const calculateTokens = (text: string) => {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
};

// Calculate detailed cost estimation with breakdown
export const calculateDetailedCost = (
  inputTokenCount: number,
  outputTokenCount: number,
  modelId: string,
  outputUnitCount: number = 1
) => {
  const totalTokens = inputTokenCount + outputTokenCount;
  const modelPricing = getModelPricing(modelId, totalTokens);
  
  // Handle special cases for image/video generation
  if (modelPricing.unit === 'per image') {
    const imageCost = modelPricing.outputRate * outputUnitCount;
    return {
      inputTokens: inputTokenCount,
      outputTokens: outputTokenCount,
      totalTokens,
      inputCost: 0,
      outputCost: imageCost,
      totalCost: imageCost
    };
  }

  if (modelPricing.unit === 'per second') {
    const videoCost = modelPricing.outputRate * outputUnitCount;
    return {
      inputTokens: inputTokenCount,
      outputTokens: outputTokenCount,
      totalTokens,
      inputCost: 0,
      outputCost: videoCost,
      totalCost: videoCost
    };
  }

  // Standard token-based pricing
  const inputCost = inputTokenCount * modelPricing.inputRate;
  const outputCost = outputTokenCount * modelPricing.outputRate;
  const totalCost = inputCost + outputCost;
  
  return {
    inputTokens: inputTokenCount,
    outputTokens: outputTokenCount,
    totalTokens,
    inputCost,
    outputCost,
    totalCost
  };
};
