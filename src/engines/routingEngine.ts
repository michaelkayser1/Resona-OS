import OpenAI from "openai";

/**
 * Routing Engine
 * Routes requests to appropriate AI models (OpenAI, Claude, etc.)
 * Handles retries, fallbacks, and model selection
 */

export interface ModelPrefs {
  primary_model?: string;
  fallback_model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface RoutingResult {
  text: string;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
  };
  latency_ms: number;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Route request to appropriate model
 */
export async function routeToModel(
  input: string,
  prefs: ModelPrefs = {},
  context?: any
): Promise<RoutingResult> {
  const startTime = Date.now();

  const model = prefs.primary_model || "gpt-4o";
  const maxTokens = prefs.max_tokens || 800;
  const temperature = prefs.temperature || 0.4;

  try {
    // Build messages array
    const messages = buildMessages(input, context);

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
    });

    const latency_ms = Date.now() - startTime;

    return {
      text: response.choices[0]?.message?.content || "",
      model,
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0
      },
      latency_ms
    };
  } catch (error: any) {
    // If primary fails, try fallback
    if (prefs.fallback_model) {
      console.warn(`Primary model ${model} failed, trying fallback ${prefs.fallback_model}`);
      return routeToFallback(input, prefs, context, startTime);
    }

    throw new Error(`Model routing failed: ${error.message}`);
  }
}

/**
 * Route to fallback model
 */
async function routeToFallback(
  input: string,
  prefs: ModelPrefs,
  context: any,
  startTime: number
): Promise<RoutingResult> {
  const model = prefs.fallback_model || "gpt-4o-mini";
  const maxTokens = prefs.max_tokens || 800;
  const temperature = prefs.temperature || 0.4;

  const messages = buildMessages(input, context);

  const response = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
  });

  const latency_ms = Date.now() - startTime;

  return {
    text: response.choices[0]?.message?.content || "",
    model,
    tokens: {
      prompt: response.usage?.prompt_tokens || 0,
      completion: response.usage?.completion_tokens || 0
    },
    latency_ms
  };
}

/**
 * Build messages array from input and context
 */
function buildMessages(input: string, context?: any): OpenAI.Chat.ChatCompletionMessageParam[] {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

  // System message
  messages.push({
    role: "system",
    content: buildSystemPrompt(context)
  });

  // Add conversation history if present
  if (context?.history && Array.isArray(context.history)) {
    context.history.forEach((msg: any) => {
      messages.push({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content
      });
    });
  }

  // Add current input
  messages.push({
    role: "user",
    content: input
  });

  return messages;
}

/**
 * Build system prompt based on context
 */
function buildSystemPrompt(context?: any): string {
  let prompt = "You are QOTE-aligned AI middleware, designed to provide coherent, grounded, and contextually appropriate responses.";

  // Add clinical context if present
  if (context?.patient_meta) {
    prompt += "\n\nYou are operating in a clinical context. Provide responses that are:";
    prompt += "\n- Clear and medically accurate";
    prompt += "\n- Compassionate and family-appropriate";
    prompt += "\n- Evidence-based when possible";
    prompt += "\n- Honest about uncertainty";
    prompt += "\n\nIMPORTANT: You are not replacing clinical judgment. Your role is to help explain and clarify.";
  }

  // Add channel-specific guidance
  if (context?.channel) {
    switch (context.channel) {
      case "guardian":
        prompt += "\n\nChannel: Guardian (family support)";
        prompt += "\nTone: Warm, supportive, clear";
        break;
      case "clinic":
        prompt += "\n\nChannel: Clinical";
        prompt += "\nTone: Professional, precise, compassionate";
        break;
      case "esp_lab":
        prompt += "\n\nChannel: ESP Research";
        prompt += "\nTone: Scientific, curious, open";
        break;
      case "econ":
        prompt += "\n\nChannel: Economic modeling";
        prompt += "\nTone: Analytical, structured";
        break;
    }
  }

  return prompt;
}

/**
 * Stream response from model
 * Used for chat-stream endpoint
 */
export async function streamFromModel(
  input: string,
  prefs: ModelPrefs = {},
  context?: any
): Promise<AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
  const model = prefs.primary_model || "gpt-4o";
  const maxTokens = prefs.max_tokens || 800;
  const temperature = prefs.temperature || 0.4;

  const messages = buildMessages(input, context);

  const stream = await openai.chat.completions.create({
    model,
    messages,
    max_tokens: maxTokens,
    temperature,
    stream: true
  });

  return stream;
}
