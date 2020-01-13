import { Manager } from '@/utils/manager'
const bucketsManager = new Manager('buckets', 'v2')

export const objectsModel = {
  bucketsManager,
  async getAcl (resName, key) {
    try {
      const { data = {} } = await bucketsManager.getSpecific({ id: resName, spec: 'acl', params: { key } })
      return data
    } catch (err) {
      throw err
    }
  },
  async getUrl (row, resName) {
    const { key } = row
    const { acl } = await this.getAcl(resName, key)
    if (acl === 'private') {
      const params = {
        key,
        method: 'GET',
      }
      // 链接有效时间 秒
      if (row.expire_seconds) {
        params['expire_seconds'] = row.expire_seconds
      }
      const { data = {} } = await bucketsManager.performAction({
        id: resName,
        action: 'temp-url',
        data: params,
      })
      const { url } = data
      if (url) {
        if (!url.startsWith('http')) {
          return `http://${url}`
        }
        return url
      }
      return null
    }
    return null
  },
}
