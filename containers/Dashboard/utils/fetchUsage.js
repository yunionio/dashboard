import { load } from '@Dashboard/utils/cache'
import { isIdentityUsageKey, needsImageUsageRequest, needsIdentityUsageRequest } from '@Dashboard/utils/usageSource'

function loadUsageByUrl (url, params) {
  return load({
    res: 'usages',
    actionArgs: {
      url,
      method: 'GET',
      params,
    },
    useManager: false,
    resPath: 'data',
  })
}

export async function fetchDashboardUsage (params, usageKeys = []) {
  const needImage = needsImageUsageRequest(...usageKeys)
  const needIdentity = needsIdentityUsageRequest(...usageKeys)
  const onlyIdentity = usageKeys.filter(Boolean).length > 0 &&
    usageKeys.filter(Boolean).every(key => isIdentityUsageKey(key))
  const requests = []
  if (!onlyIdentity) {
    requests.push(loadUsageByUrl('/v2/rpc/usages/general-usage', params))
  }
  if (needImage) {
    requests.push(loadUsageByUrl('/v2/rpc/usages/image-usage', params))
  }
  if (needIdentity) {
    requests.push(loadUsageByUrl('/v2/rpc/usages/identity-usage', params))
  }
  const results = await Promise.all(requests)
  return Object.assign({}, ...results)
}

export const fetchGeneralAndImageUsage = fetchDashboardUsage
