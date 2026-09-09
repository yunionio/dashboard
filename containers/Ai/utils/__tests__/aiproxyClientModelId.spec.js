import { buildRoutingClientModelOptions } from '../aiproxyClientModelId'

jest.mock('@/utils/manager', () => ({ Manager: class {} }), { virtual: true })
jest.mock('@Ai/constants/aiproxyResources', () => ({ getAiproxyResourceScope: () => '' }), { virtual: true })
jest.mock('@Ai/utils/aiProviderKind', () => ({ fetchRoutingModelsForRouting: async () => [] }), { virtual: true })

describe('buildRoutingClientModelOptions', () => {
  const routing = { model_key: 'qwen38-Qwen3.8-27B-NVFP4' }
  const catalogModelsById = {
    'model-a': { model_key: 'Qwen3.8-27B-NVFP4' },
    'model-b': { model_key: 'Qwen3.8-27B-NVFP4' },
    'model-c': { model_key: 'Qwen3.8-27B-Instruct' },
  }

  it('emits only the flat id for a single routing model with model_key', () => {
    const options = buildRoutingClientModelOptions({
      routing,
      routingModels: [{ ai_model_id: 'model-a', enabled: true, priority: 10 }],
      catalogModelsById,
    })
    expect(options.map(o => o.id)).toEqual(['qwen38-Qwen3.8-27B-NVFP4'])
    expect(options[0].kind).toBe('flat')
  })

  it('emits only the flat id for replica rows that share the same catalog', () => {
    const options = buildRoutingClientModelOptions({
      routing,
      routingModels: [
        { ai_model_id: 'model-a', enabled: true, priority: 10 },
        { ai_model_id: 'model-b', enabled: true, priority: 20 },
      ],
      catalogModelsById,
    })
    expect(options.map(o => o.id)).toEqual(['qwen38-Qwen3.8-27B-NVFP4'])
    expect(options[0].kind).toBe('flat')
  })

  it('emits flat plus hierarchical ids when routing binds distinct catalogs', () => {
    const options = buildRoutingClientModelOptions({
      routing,
      routingModels: [
        { ai_model_id: 'model-a', enabled: true, priority: 10 },
        { ai_model_id: 'model-c', enabled: true, priority: 20 },
      ],
      catalogModelsById,
    })
    expect(options.map(o => ({ id: o.id, kind: o.kind }))).toEqual([
      { id: 'qwen38-Qwen3.8-27B-NVFP4', kind: 'flat' },
      { id: 'qwen38-Qwen3.8-27B-NVFP4/Qwen3.8-27B-NVFP4', kind: 'hierarchical' },
      { id: 'qwen38-Qwen3.8-27B-NVFP4/Qwen3.8-27B-Instruct', kind: 'hierarchical' },
    ])
  })
})
