import { Manager } from '@/utils/manager'

export const objectsModel = {
  async getAcl (resId, key) {
    let bucketsManager = new Manager('buckets', 'v2')
    try {
      const { data = {} } = await bucketsManager.getSpecific({ id: resId, spec: 'acl', params: { key } })
      return data
    } catch (err) {
      throw err
    } finally {
      bucketsManager = null
    }
  },
  async getUrl (row, resId, accessUrl) {
    const { key } = row
    // const { acl } = await this.getAcl(resId, key)
    let bucketsManager = new Manager('buckets', 'v2')
    try {
      const params = {
        key,
        method: 'GET',
      }
      // 链接有效时间 秒
      if (row.expire_seconds) {
        params.expire_seconds = row.expire_seconds
      }
      const { data = {} } = await bucketsManager.performAction({
        id: resId,
        action: 'temp-url',
        data: params,
      })
      const { url } = data
      if (url) {
        if (!url.startsWith('http')) {
          return `http://${url}`
        }
        return url
      } else if (accessUrl) {
        if (!accessUrl.startsWith('http')) {
          return `http://${accessUrl}/${key}`
        }
        return `${accessUrl}/${key}`
      }
      return null
    } catch (err) {
      throw err
    } finally {
      bucketsManager = null
    }
  },
}
