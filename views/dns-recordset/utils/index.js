import { dnsTypes } from '../constants'

export const getDnsTypes = () => {
  return dnsTypes
}

export const getDnsProviders = (providers, { zone_type }) => {
  const publicZonesProvider = ['Aws']
  return providers.filter((item) => {
    if (zone_type === 'PublicZone') {
      return !publicZonesProvider.includes(item.value)
    }
    return publicZonesProvider.includes(item.value)
  })
}
