import { growthExperimentSchema } from '../../schemas/experiment'
import type { GrowthExperiment } from '../../types/experiment'
import {
  buildFullExperimentMessages,
  buildModuleMessages,
} from '../../prompts'
import { generateStructured } from './structured'
import type {
  ChatRequestOptions,
  ExperimentModule,
  GenerationInput,
  ModelConnectionConfig,
  SchemaLike,
  StructuredResult,
} from './types'

function createExperimentId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `experiment-${Date.now()}`
  }
}

export function generateFullExperiment(
  config: ModelConnectionConfig,
  input: GenerationInput,
  options: ChatRequestOptions = {},
): Promise<StructuredResult<GrowthExperiment>> {
  const now = new Date().toISOString()
  const schemaWithClientMetadata: SchemaLike<GrowthExperiment> = {
    safeParse(value) {
      const generated =
        value && typeof value === 'object' && !Array.isArray(value)
          ? (value as Record<string, unknown>)
          : {}
      return growthExperimentSchema.safeParse({
        ...generated,
        id: createExperimentId(),
        version: 1,
        createdAt: now,
        updatedAt: now,
        status: 'draft',
      })
    },
  }
  return generateStructured(
    config,
    buildFullExperimentMessages(input),
    schemaWithClientMetadata,
    options,
  )
}

export function generateExperimentModule<T>(
  config: ModelConnectionConfig,
  module: ExperimentModule,
  experiment: GrowthExperiment,
  schema: SchemaLike<T>,
  instruction = '',
  options: ChatRequestOptions = {},
): Promise<StructuredResult<T>> {
  return generateStructured(
    config,
    buildModuleMessages(module, experiment, instruction),
    schema,
    options,
  )
}
