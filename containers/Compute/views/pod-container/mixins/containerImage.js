import { uuid } from '@/utils/utils'

// 容器镜像 id -> name 的跨页面缓存，避免重复请求
const metaCache = new Map()

export default {
  data () {
    return {
      // 容器镜像 id -> name，取回后驱动单元格重新渲染
      containerImageNameMap: {},
    }
  },
  methods: {
    containerImageName (id) {
      if (!id) return ''
      return this.containerImageNameMap[id] || ''
    },
    /**
     * 批量拉取容器镜像名称
     * 取不到时留空，由调用方回退展示 spec.image，单个失败不影响列表
     */
    async fetchContainerImageNames (ids) {
      const uniqueIds = [...new Set((ids || []).filter(Boolean))]
      if (!uniqueIds.length) return

      const nameMap = {}
      const missing = []
      uniqueIds.forEach(id => {
        if (metaCache.has(id)) {
          nameMap[id] = metaCache.get(id)
        } else {
          missing.push(id)
        }
      })

      if (missing.length) {
        try {
          const manager = new this.$Manager('container_images', 'v1')
          const { data: { data = [] } } = await manager.list({
            params: {
              scope: this.$store.getters.scope,
              limit: missing.length,
              filter: `id.in(${missing.map(id => `'${id}'`).join(',')})`,
              // 与其它 container_images 列表请求区分，避免同 url 并发被 http 层 cancel
              $t: uuid(),
            },
          })
          ;(data || []).forEach((item) => {
            if (!item?.id) return
            const name = item.name || ''
            metaCache.set(item.id, name)
            if (name) nameMap[item.id] = name
          })
        } catch (e) {
          // 拉取失败时保持空值，回退展示 spec.image
        }
      }

      if (this._isDestroyed) return
      if (!Object.keys(nameMap).length) return
      // 整体替换，保证响应式
      this.containerImageNameMap = { ...this.containerImageNameMap, ...nameMap }
    },
    /** 列表 fetchDataCb：从行数据里收集 container_image_id 并批量取名称 */
    fetchContainerImageNamesForRows (res) {
      const rows = res?.data?.data
      if (!Array.isArray(rows) || !rows.length) return
      const ids = rows.map(row => row.spec?.container_image_id).filter(Boolean)
      return this.fetchContainerImageNames(ids)
    },
  },
}
