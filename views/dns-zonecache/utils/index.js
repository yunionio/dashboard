import { PROVIDER_MAP } from '@/constants/index'

export const getProviders = () => {
  const supports = ['Aws', 'Qcloud']
  const _providers = []
  console.log(PROVIDER_MAP)
  for (const k in PROVIDER_MAP) {
    if (supports.includes(k)) {
      _providers.push(PROVIDER_MAP[k])
    }
  }
  return _providers
}
