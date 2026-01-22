<template>
  <div>
    <page-header :title="$t('aice.llm_image.import_community')" />
    <page-body>
      <a-alert type="info" class="mb-3">
        <span slot="message">
          {{ $t('aice.llm_image.community_registry') }}: {{ registryUrl }}
        </span>
      </a-alert>

      <page-card-list
        :list="cardList"
        :card-fields="cardFields"
        :showPageer="false"
        :isRefreshed="false"
        :singleActions="singleActions" />
    </page-body>
  </div>
</template>

<script>
import axios from 'axios'
import yaml from 'js-yaml'

const REGISTRY_URL = 'https://10.168.26.9:31512/ollama-registry.yaml'
const DEFAULT_ICON = (require('@/assets/images/invalidImg.svg') || {}).default || require('@/assets/images/invalidImg.svg')
const QIANWEN_SVG = '<svg t="1768898043404" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6328" width="32" height="32"><path d="M952.6 606.7L841.3 411.8l47.8-91.2c6.7-8.5 8.5-21.5 5.8-31.7l-61.2-110.4c-4.9-7.2-13-11.6-21.5-12.1H584.7L533.3 77c-3.6-7.2-10.3-11.6-18.3-12.5H394.8c-8.9 0-15.2 6.7-19.7 14.3l-1.8 3.1-113.5 194.9H150.7c-8.9 0-17.4 4.5-22.3 12.1L65.8 399.7c-4 8-4 17.5 0 25.5l113.1 196.2-51 88.9c-4 8-4 17.5 0 25.5l58.1 102c4.9 7.6 13 12.5 22.3 12.5h227.5l55 95.2c4 7.2 11.6 12.1 19.7 13h128.7c8.9 0 17-4.9 21.5-12.5l112.2-196.2H873c8.9-0.9 17-5.8 21.5-13.4L952.6 634c5.3-9 5.3-19.3 0-27.3z m-140.8 12.5l-58.1-107.3L515 932.1l-65.3-107.3H211.5l57.2-103.7h121.6L151.6 302.3h124.7L394.8 90.9 454.2 195 393 302.3h477.4l-59.9 106.4 120.2 210.5H811.8z m0 0" fill="#605BEC" p-id="6329"></path><path d="M509.6 659.4l148.8-238.2H359.9l149.7 238.2z m0 0" fill="#605BEC" p-id="6330"></path></svg>'
const QIANWEN_ICON_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(QIANWEN_SVG)}`

export default {
  name: 'LlmImageImportCommunity',
  data () {
    return {
      registryUrl: REGISTRY_URL,
      loadingList: false,
      keyword: '',
      rawList: [],
      cardFields: {
        url: 'icon',
        title: 'title',
        description: 'description',
        desc: 'desc',
      },
    }
  },
  computed: {
    filteredList () {
      const kw = (this.keyword || '').trim().toLowerCase()
      if (!kw) return this.rawList
      return this.rawList.filter(item => {
        return [
          item.full_name,
          item.model_name,
          item.tag_name,
          item.description,
          (item.capabilities || []).join(' '),
        ].some(v => (v || '').toString().toLowerCase().includes(kw))
      })
    },
    cardList () {
      return {
        data: this.filteredList.map(item => {
          const caps = Array.isArray(item.capabilities) ? item.capabilities : []
          const context = item.context_length || '-'
          const size = item.model_size || '-'
          return {
            data: {
              // page-card-list 固定用 data.url 做 copy，因此保留 url 为可复制的模型标识
              // url: item.full_name,
              icon: this.getModelIcon(item),
              title: item.full_name,
              description: item.description || '-',
              desc: `${caps.join(', ') || '-'} | ${context} | ${size}`,
              _raw: item,
            },
          }
        }),
        loading: this.loadingList,
      }
    },
    singleActions () {
      return [
        {
          label: this.$t('aice.import'),
          action: async (data) => {
            const raw = data?._raw || {}
            const fullName = raw.full_name || data?.url
            const createData = {
              generate_name: this.toSafeName(fullName),
              llm_type: 'ollama',
              model_name: raw.model_name,
              model_tag: raw.tag_name,
            }
            await new this.$Manager('llm_instant_models').create({ data: createData })
            this.$message.success(this.$t('common.success'))
            this.$router.push({ name: 'LlmInstantmodelList' })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ]
    },
  },
  created () {
    this.fetchRegistry()
  },
  methods: {
    noop () {},
    goBack () {
      this.$router.push({ name: 'LlmImageList' })
    },
    getModelIcon (item) {
      const name = `${item?.model_name || ''} ${item?.full_name || ''}`
      // Qwen / 千问系列（qwen3, qwen2.5-coder, qwen3-vl 等）
      if (/(\b|_|-)(qwen|qianwen)(\b|_|-)/i.test(name) || /^qwen/i.test(item?.model_name || '')) {
        return QIANWEN_ICON_URL
      }
      return DEFAULT_ICON
    },
    parseRegistry (text) {
      const doc = yaml.safeLoad(text) || {}
      const models = Array.isArray(doc.ollama) ? doc.ollama : []
      const ret = []
      models.forEach(model => {
        const modelName = model?.name
        const description = model?.description || ''
        const tags = Array.isArray(model?.tags) ? model.tags : []
        tags.forEach(tag => {
          const tagName = tag?.name
          if (!modelName || !tagName) return
          ret.push({
            full_name: `${modelName}:${tagName}`,
            model_name: modelName,
            tag_name: tagName,
            description,
            capabilities: tag?.capabilities || [],
            context_length: tag?.context_length,
            model_size: tag?.model_size,
            is_latest: !!tag?.is_latest,
          })
        })
      })
      return ret
    },
    async fetchRegistry () {
      this.loadingList = true
      try {
        const res = await axios.get(this.registryUrl, { responseType: 'text' })
        const text = res?.data || ''
        this.rawList = this.parseRegistry(text)
      } catch (e) {
        this.$message.error(this.$t('aice.llm_image.community_registry_fetch_failed'))
        throw e
      } finally {
        this.loadingList = false
      }
    },
    toSafeName (fullName) {
      return (fullName || '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '')
    },
  },
}
</script>

<style scoped>
.mb-3 {
  margin-bottom: 12px;
}
.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
}
.mr-2 {
  margin-right: 8px;
}
/* 隐藏复制链接功能 */
::v-deep .link_copy {
  display: none !important;
}
</style>
