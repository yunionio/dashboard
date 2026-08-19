import store from '@/store'
import { getCloudEnvOptions, typeClouds } from '@/utils/common/hypervisor'

export const IPSET_IDC_BRANDS = ['OneCloud']
export const IPSET_PRIVATE_BRANDS = ['Cloudpods']
export const IPSET_PUBLIC_BRANDS = ['Aliyun', 'Qcloud']
export const IPSET_BRANDS = [...IPSET_IDC_BRANDS, ...IPSET_PRIVATE_BRANDS, ...IPSET_PUBLIC_BRANDS]

function getCapabilityBrands () {
  const capability = store.getters.capability || {}
  return [
    ...(capability.brands || []),
    ...(capability.read_only_brands || []),
    ...(capability.disabled_brands || []),
  ]
}

export function getIpSetSupportBrands () {
  const capabilityBrands = getCapabilityBrands().map(item => String(item).toLowerCase())
  return IPSET_BRANDS.filter(brand => capabilityBrands.includes(brand.toLowerCase()))
}

export function getIpSetCloudEnvOptions () {
  const envSet = new Set([''])
  getIpSetSupportBrands().forEach(brand => {
    const env = typeClouds.brandMap[brand] && typeClouds.brandMap[brand].cloud_env
    if (env) {
      envSet.add(env)
    }
  })
  return getCloudEnvOptions('brands').filter(item => envSet.has(item.key))
}
