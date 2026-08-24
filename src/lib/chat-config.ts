import { ImageSettings, Model, RunSettings } from "@/types/chat";

export const DEFAULT_SYSTEM_INSTRUCTION =
  "Your task is to assist in coding by providing optimized and well-structured code solutions for various programming challenges...";

export const DEFAULT_MODEL: Model = {
  version: "3.1",
  name: "Gemini 3.1 Pro Preview",
  id: "gemini-3.1-pro-preview",
  description:
    "Our latest SOTA reasoning model with unprecedented depth and nuance, and powerful multimodal understanding and coding capabilities.",
  features: [],
  mode: "text",
  pricing: [
    "<=200K tokens • Input: $2.00 / Output: $12.00",
    "> 200K tokens • Input: $4.00 / Output: $18.00",
  ],
  knowledgeCutoff: "Jan 2025",
  releaseDate: "Feb 12, 2026",
  docsUrl: "https://ai.google.dev/gemini-api/docs/gemini-3",
  starred: true,
};

export const DEFAULT_IMAGE_SETTINGS: ImageSettings = {
  numberOfImages: 4,
  aspectRatio: "1:1",
  personGeneration: "allow_adult",
};

export const DEFAULT_RUN_SETTINGS: RunSettings = {
  systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
  maxOutputTokens: 8192,
  temperature: 1,
  topP: 0.55,
};

export const SYSTEM_INSTRUCTION_TEMPLATES: Record<string, string> = {
  Default: DEFAULT_SYSTEM_INSTRUCTION,
  "Creative Writing":
    "You are a creative writing assistant. Help users craft engaging stories, develop characters, and improve their writing style.",
  "Data Analysis":
    "You are a data analysis expert. Help users interpret data, create visualizations, and derive meaningful insights.",
  "Technical Documentation":
    "You are a technical documentation specialist. Help users create clear, comprehensive documentation.",
  "Educational Tutor":
    "You are an educational tutor. Explain complex concepts in simple terms, provide examples, and guide learning.",
  "Business Consultant":
    "You are a business consultant. Provide strategic advice, help with decision-making, and offer insights.",
};

const GEMINI_35_FLASH: Model = {
  version: "3.5",
  name: "Gemini 3.5 Flash",
  id: "gemini-3.5-flash",
  description:
    "Our most intelligent model for sustained frontier performance in agentic and coding tasks.",
  features: [],
  mode: "text",
  badges: ["New"],
  pricing: ["All context lengths • Input: $1.50 / Output: $9.00"],
  knowledgeCutoff: "Jan 2025",
  releaseDate: "May 19, 2026",
  docsUrl: "https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash",
};

const GEMINI_35_LIVE_TRANSLATE: Model = {
  version: "3.5",
  name: "Gemini 3.5 Live Translate Preview",
  id: "gemini-3.5-live-translate-preview",
  description:
    "A real-time speech-to-speech translation model delivering low latency translation for 70+ languages.",
  features: [],
  mode: "audio",
  badges: ["New"],
  pricing: ["Audio • Input: $3.50 / Output: $21.00"],
  knowledgeCutoff: "Jan 2025",
  releaseDate: "Jun 9, 2026",
  docsUrl: "https://ai.google.dev/gemini-api/docs/live-api/live-translate",
};

const GEMINI_31_FLASH_LITE: Model = {
  version: "3.1",
  name: "Gemini 3.1 Flash Lite",
  id: "gemini-3.1-flash-lite",
  description:
    "Our most cost-efficient model, optimized for high-volume agentic tasks, translation, and simple data processing.",
  features: [],
  mode: "text",
  pricing: [
    "Text, image and video • Input: $0.25 / Output: $1.50",
    "Audio • Input: $0.50 / Output: $1.50",
  ],
  knowledgeCutoff: "Jan 2025",
  releaseDate: "May 7, 2026",
  docsUrl: "https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite",
};

const GEMINI_3_FLASH: Model = {
  version: "3",
  name: "Gemini 3 Flash Preview",
  id: "gemini-3-flash-preview",
  description:
    "Our most intelligent model built for speed, combining frontier intelligence with superior search and grounding.",
  features: [],
  mode: "text",
  pricing: ["All context lengths • Input: $0.50 / Output: $3.00"],
  knowledgeCutoff: "Jan 2025",
  releaseDate: "Dec 17, 2025",
  docsUrl: "https://ai.google.dev/gemini-api/docs/gemini-3",
  starred: true,
};

const NANO_BANANA_2_LITE: Model = {
  version: "3.1",
  name: "Nano Banana 2 Lite",
  id: "gemini-3.1-flash-lite-image",
  description:
    "Our smallest and most cost effective image generation and editing model, built for at scale usage.",
  features: ["Gemini 3.1 Flash Lite Image"],
  mode: "image-content",
  badges: ["New"],
  pricing: [
    "Text • Input: $0.25 / Output: $1.50",
    "Image (*Output per image) • Input: $0.25 / Output: $0.0336",
  ],
  knowledgeCutoff: "Jan 2025",
  releaseDate: "Jun 30, 2026",
  docsUrl: "https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite-image",
};

const NANO_BANANA_2: Model = {
  version: "3.1",
  name: "Nano Banana 2",
  id: "gemini-3.1-flash-image",
  description:
    "Pro-level visual intelligence with Flash-speed efficiency and reality-grounded generation capabilities.",
  features: ["Gemini 3.1 Flash Image"],
  mode: "image-content",
  badges: ["New", "Paid"],
  pricing: [
    "Text • Input: $0.50 / Output: $3.00",
    "Image (*Output per image) • Input: $0.50 / Output: $0.0672",
  ],
  knowledgeCutoff: "Jan 2025",
  releaseDate: "May 28, 2026",
  docsUrl: "https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-image",
};

const NANO_BANANA_PRO: Model = {
  version: "3",
  name: "Nano Banana Pro",
  id: "gemini-3-pro-image",
  description: "State-of-the-art image generation and editing model.",
  features: ["Gemini 3 Pro Image"],
  mode: "image-content",
  badges: ["New", "Paid"],
  pricing: [
    "Text • Input: $2.00 / Output: $12.00",
    "Image (*Output per image) • Input: $2.00 / Output: $0.134",
  ],
  knowledgeCutoff: "Jan 2025",
  releaseDate: "May 28, 2026",
  docsUrl: "https://ai.google.dev/gemini-api/docs/models/gemini-3-pro-image",
};

const GEMINI_PRO_LATEST: Model = {
  version: "Latest",
  name: "Gemini Pro Latest",
  id: "gemini-pro-latest",
  description: "An alias to our latest Pro model which changes over time.",
  features: ["Points to gemini-3.1-pro-preview"],
  mode: "text",
  pricing: DEFAULT_MODEL.pricing,
  knowledgeCutoff: "Jan 2025",
  releaseDate: "Feb 12, 2026",
  docsUrl: "https://ai.google.dev/gemini-api/docs/gemini-3",
};

const GEMINI_FLASH_LATEST: Model = {
  version: "Latest",
  name: "Gemini Flash Latest",
  id: "gemini-flash-latest",
  description: "An alias to our latest Flash model which changes over time.",
  features: ["Points to gemini-3.5-flash"],
  mode: "text",
  pricing: GEMINI_35_FLASH.pricing,
  knowledgeCutoff: "Jan 2025",
  releaseDate: "Dec 17, 2025",
  docsUrl: "https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash",
};

const GEMINI_FLASH_LITE_LATEST: Model = {
  version: "Latest",
  name: "Gemini Flash-Lite Latest",
  id: "gemini-flash-lite-latest",
  description: "An alias to our latest Flash-Lite model which changes over time.",
  features: ["Points to gemini-3.1-flash-lite"],
  mode: "text",
  pricing: GEMINI_31_FLASH_LITE.pricing,
  knowledgeCutoff: "Jan 2025",
  releaseDate: "May 7, 2026",
  docsUrl: "https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite",
};

const IMAGEN_4: Model = {
  version: "4",
  name: "Imagen 4",
  id: "imagen-4.0-generate-001",
  description:
    "Our latest image generation model, with significantly better text rendering and better overall image quality.",
  features: [],
  mode: "image-endpoint",
  badges: ["Paid"],
  pricing: ["Image (*Output per image) • Output: $0.04"],
  knowledgeCutoff: "Unknown",
  docsUrl: "https://ai.google.dev/gemini-api/docs/imagen#imagen-4",
};

const IMAGEN_4_ULTRA: Model = {
  ...IMAGEN_4,
  name: "Imagen 4 Ultra",
  id: "imagen-4.0-ultra-generate-001",
  pricing: ["Image (*Output per image) • Output: $0.06"],
};

const GEMINI_OMNI_FLASH: Model = {
  version: "Omni",
  name: "Gemini Omni Flash Preview",
  id: "gemini-omni-flash-preview",
  description:
    "Gemini Omni Flash: Powerful video generation and conversational editing. Bring text and images to life as stunning video, and effortlessly refine your outputs through simple natural language.",
  features: [],
  mode: "video",
  badges: ["New", "Paid"],
  pricing: [
    "Text, Audio, Video • Input: $1.50 / Output: $9.00",
    "Video • Output: $17.50",
  ],
  knowledgeCutoff: "Jan 2025",
  releaseDate: "Jun 30, 2026",
};

const MODEL_CATEGORIES: Record<string, Model[]> = {
  Featured: [GEMINI_35_FLASH, DEFAULT_MODEL, GEMINI_3_FLASH, NANO_BANANA_2],
  Gemini: [
    GEMINI_35_FLASH,
    GEMINI_31_FLASH_LITE,
    GEMINI_3_FLASH,
    DEFAULT_MODEL,
    NANO_BANANA_2_LITE,
    NANO_BANANA_2,
    NANO_BANANA_PRO,
    GEMINI_PRO_LATEST,
    GEMINI_FLASH_LATEST,
    GEMINI_FLASH_LITE_LATEST,
    GEMINI_OMNI_FLASH,
  ],
  Live: [GEMINI_35_LIVE_TRANSLATE],
  Images: [NANO_BANANA_2_LITE, NANO_BANANA_2, NANO_BANANA_PRO, IMAGEN_4, IMAGEN_4_ULTRA],
  Video: [GEMINI_OMNI_FLASH],
  Audio: [GEMINI_35_LIVE_TRANSLATE, GEMINI_OMNI_FLASH],
  Music: [],
  Agents: [],
  Gemma: [],
};

export const MODEL_FILTERS = [
  "Starred",
  "All",
  "Featured",
  "Gemini",
  "Live",
  "Images",
  "Video",
  "Audio",
  "Music",
  "Agents",
  "Gemma",
] as const;

export type ModelFilter = (typeof MODEL_FILTERS)[number];

const ALL_MODELS = [
  GEMINI_35_FLASH,
  GEMINI_35_LIVE_TRANSLATE,
  GEMINI_31_FLASH_LITE,
  GEMINI_3_FLASH,
  DEFAULT_MODEL,
  NANO_BANANA_2_LITE,
  NANO_BANANA_2,
  NANO_BANANA_PRO,
  GEMINI_PRO_LATEST,
  GEMINI_FLASH_LATEST,
  GEMINI_FLASH_LITE_LATEST,
  IMAGEN_4,
  IMAGEN_4_ULTRA,
  GEMINI_OMNI_FLASH,
];

const modelLookup = new Map(ALL_MODELS.map((model) => [model.id, model]));

export const getModelById = (modelId: string) => modelLookup.get(modelId);

export const getModelsForFilter = (filter: ModelFilter) =>
  filter === "All"
    ? ALL_MODELS
    : filter === "Starred"
      ? ALL_MODELS.filter((model) => model.starred)
      : MODEL_CATEGORIES[filter] ?? [];

export const isImageGenerationModel = (modelId: string) => {
  const model = getModelById(modelId);
  return model?.mode === "image-content" || model?.mode === "image-endpoint";
};

export const isSupportedRunModel = (modelId: string) => {
  const model = getModelById(modelId);
  return model?.mode === "text" || model?.mode === "image-content" || model?.mode === "image-endpoint";
};

// Matches live AI Studio "Explore Google models" cards 1:1 (titles, descriptions, icon colors)
export const MODEL_BROWSER_CATEGORIES = [
  {
    id: "featured",
    icon: "star",
    color: "rgb(252, 189, 0)",
    title: "Featured",
    description: "Test out our most advanced and newest models.",
    defaultModelId: DEFAULT_MODEL.id,
  },
  {
    id: "chat",
    icon: "chat",
    color: "rgb(135, 169, 255)",
    title: "Code and Chat",
    description: "Build chatbots, agents, and code with Gemini 3.",
    defaultModelId: DEFAULT_MODEL.id,
  },
  {
    id: "images",
    icon: "image",
    color: "rgb(197, 151, 255)",
    title: "Image Generation",
    description: "Create and edit images with Nano Banana and Imagen.",
    defaultModelId: "gemini-3.1-flash-image",
  },
  {
    id: "video",
    icon: "movie",
    color: "rgb(61, 219, 133)",
    title: "Video Generation",
    description: "Generate videos with Veo models, our state of the art video generation models.",
    defaultModelId: "gemini-omni-flash-preview",
  },
  {
    id: "audio",
    icon: "mic",
    color: "rgb(215, 58, 73)",
    title: "Speech and Music",
    description: "Explore our text to speech and music generation models.",
    defaultModelId: "gemini-3.5-live-translate-preview",
  },
  {
    id: "realtime",
    icon: "bolt",
    color: "rgb(255, 183, 77)",
    title: "Real-time",
    description: "Real-time voice and video with Live API.",
    defaultModelId: "gemini-3.5-live-translate-preview",
  },
] as const;

export const getTemplateNameForInstruction = (instruction: string) =>
  Object.entries(SYSTEM_INSTRUCTION_TEMPLATES).find(([, value]) => value === instruction)?.[0] ??
  "Default";
