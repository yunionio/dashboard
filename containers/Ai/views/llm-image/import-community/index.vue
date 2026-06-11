<template>
  <div>
    <page-header :title="$t('aice.llm_image.import_community_image')" />
    <a-form-model class="mt-3 mb-2" v-bind="layout">
      <a-form-model-item>
        <a-radio-group v-model="form.llm_type" size="large">
          <a-radio-button v-for="item in typeList" :key="item.value" :value="item.value" style="width:80px;height:80px;text-align:center;line-height:80px;vertical-align:middle;padding:0;">
            <img v-if="item.icon" :src="item.icon" style="height:56px;" />
          </a-radio-button>
        </a-radio-group>
      </a-form-model-item>
    </a-form-model>
    <page-list
      :list="list"
      :columns="columns"
      :single-actions="singleActions"
      :showSearchbox="false"
      :showGroupActions="false"
      :showPage="false" />
  </div>
</template>

<script>
import axios from 'axios'
import yaml from 'js-yaml'
import marked from 'marked'
import { parseLlmImageRoute, getAllowedImageLlmTypes } from '@Ai/utils/llmRouteContext'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getDefaultPortMappingsForType, getDefaultSkuSpecForType } from '../../llm-sku/constants/llmTypeConfig'

const LLM_IMAGES_URL = 'https://www.cloudpods.org/llmimages.yaml'

const LLM_TYPE_ICONS = {
  openclaw: require('@/assets/images/llm-images/openclaw.svg'),
  'hermes-agent': require('@/assets/images/llm-images/hermes-agent.svg'),
  ollama: require('@/assets/images/llm-images/ollama.svg'),
  vllm: require('@/assets/images/llm-images/vllm.svg'),
  dify: require('@/assets/images/llm-images/dify.svg'),
  comfyui: require('@/assets/images/llm-images/comfyui.svg'),
  desktop: require('@/assets/images/llm-images/linuxserver.png'),
}
const DEFAULT_ICON = require('@/assets/images/llm-images/default.svg')

function getTypeIcon (llmType) {
  return LLM_TYPE_ICONS[llmType] || DEFAULT_ICON
}

function parseImageField (imageStr) {
  const idx = imageStr.lastIndexOf(':')
  if (idx > 0) {
    return { image_name: imageStr.substring(0, idx), image_label: imageStr.substring(idx + 1) }
  }
  return { image_name: imageStr, image_label: 'latest' }
}

/** 导入时 generate_name：桌面镜像以 app_name 开头，其它类型仍为 llm_type-image_label */
function buildImportGenerateName (record) {
  const label = record.image_label || 'latest'
  if (record.llm_type === 'desktop' && record.app_name) {
    return `${record.app_name}-${label}`
  }
  return `${record.llm_type}-${label}`
}

export default {
  name: 'LlmImageImportCommunityPage',
  mixins: [WindowsMixin, ListMixin],
  data () {
    return {
      allItems: [],
      existingImages: {},
      layout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      },
      form: {
        llm_type: '',
      },
      list: this.$list.createList(this, {
        id: 'LlmImageImportCommunity',
        resource: 'llm_images',
        responseData: { data: [] },
      }),
    }
  },
  computed: {
    imageRouteCtx () {
      return parseLlmImageRoute(this.$route.path)
    },
    allowedImageLlmTypes () {
      return getAllowedImageLlmTypes(this.$route.path)
    },
    typeList () {
      const allowed = new Set(this.allowedImageLlmTypes)
      const seen = {}
      const ret = []
      this.allItems.forEach(item => {
        const t = item.llm_type
        if (t && allowed.has(t) && !seen[t]) {
          seen[t] = true
          ret.push({ value: t, label: t, icon: getTypeIcon(t) })
        }
      })
      return ret
    },
    llmTypeColumnTitle () {
      if (this.imageRouteCtx.isDesktopImageRoute) {
        return this.$t('aice.llm_type')
      }
      if (this.imageRouteCtx.isAgentImageRoute) {
        return this.$t('aice.llm_type.app')
      }
      return this.$t('aice.llm_type.llm')
    },
    columns () {
      return [
        {
          field: 'image',
          title: this.$t('aice.llm_image.name'),
          minWidth: 300,
          showOverflow: 'tooltip',
        },
        {
          field: 'llm_type',
          title: this.llmTypeColumnTitle,
          width: 120,
          slots: {
            default: ({ row }, h) => {
              return [h('span', this.$t(`aice.llm_type.${(row.llm_type || '').replace(/-/g, '_')}`) || row.llm_type)]
            },
          },
        },
        ...(this.imageRouteCtx.isDesktopImageRoute ? [{
          field: 'app_name',
          title: this.$t('aice.llm_image.app_name'),
          width: 160,
          showOverflow: 'tooltip',
        }] : []),
        {
          field: 'description',
          title: this.$t('common.description'),
          minWidth: 200,
          slots: {
            default: ({ row }, h) => {
              const html = this.renderMarkdown(row.description)
              return [h('div', { class: 'md-desc', domProps: { innerHTML: html } })]
            },
          },
        },
        {
          field: '_action_import',
          title: this.$t('common.action'),
          width: 100,
          resizable: false,
          slots: {
            default: ({ row }, h) => {
              if (this.isImported(row)) {
                return [h('a-button', { props: { size: 'small', disabled: true } }, this.$t('aice.llm_image.imported'))]
              }
              return [h('a-button', {
                props: { type: 'primary', size: 'small' },
                on: { click: () => this.handleImport(row) },
              }, this.$t('aice.import'))]
            },
          },
        },
      ]
    },
    singleActions () {
      return []
    },
  },
  watch: {
    'form.llm_type' (val) {
      this.fetchExistingByType(val).then(() => {
        this.refreshList()
      })
    },
    typeList (val) {
      if (val.length && !val.some(item => item.value === this.form.llm_type)) {
        this.form.llm_type = val[0].value
      }
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchExistingByType (llmType) {
      if (!llmType) return
      try {
        const manager = new this.$Manager('llm_images')
        const res = await manager.list({ params: { limit: 0, llm_type: llmType } })
        const images = res.data?.data || []
        // 先清除该类型旧数据
        const prefix = `${llmType}:`
        Object.keys(this.existingImages).forEach(key => {
          if (key.startsWith(prefix)) {
            this.$delete(this.existingImages, key)
          }
        })
        // 写入最新数据
        images.forEach(img => {
          const key = `${img.llm_type}:${img.image_name}:${img.image_label}`
          this.$set(this.existingImages, key, true)
        })
      } catch (e) {
        // ignore
      }
    },
    isImported (record) {
      return !!this.existingImages[`${record.llm_type}:${record.image_name}:${record.image_label}`]
    },
    getFilteredItems () {
      if (!this.form.llm_type) return this.allItems
      return this.allItems.filter(item => item.llm_type === this.form.llm_type)
    },
    refreshList () {
      const filtered = this.getFilteredItems()
      this.list.responseData = { data: filtered, total: filtered.length }
      this.list.fetchData()
    },
    async fetchData () {
      this.list.loading = true
      try {
        const res = await axios.get(LLM_IMAGES_URL)
        const items = yaml.safeLoad(res.data)
        if (!Array.isArray(items)) { this.list.loading = false; return }
        const allowed = new Set(this.allowedImageLlmTypes)
        this.allItems = items.filter(i => i?.image && i.llm_type && allowed.has(i.llm_type)).map((item, index) => {
          const { image_name, image_label } = parseImageField(item.image)
          return {
            id: String(index + 1),
            image: item.image,
            image_name,
            image_label,
            llm_type: item.llm_type || '',
            app_name: item.app_name || '',
            description: item.description || '-',
            desktop: item.desktop || null,
            icon: getTypeIcon(item.llm_type || ''),
          }
        })
        if (this.typeList.length > 0) {
          this.form.llm_type = this.typeList[0].value
        }
        // 查询当前选中类型的已导入镜像
        await this.fetchExistingByType(this.form.llm_type)
        this.refreshList()
      } catch (err) {
        this.list.loading = false
        this.$message.error(this.$t('aice.llm_image.community_image_fetch_failed'))
        throw err
      }
    },
    renderMarkdown (text) {
      if (!text || text === '-') return text || '-'
      return marked(text)
    },
    async handleImport (record) {
      // 先创建 llm_image，再用其 id 创建对应的默认 SKU。
      // SKU 默认规格取自 onecloud-operator 的 DefaultLLMSku（见 llmTypeConfig.js）。
      // dify 单镜像无法构造完整 spec，只创建 image 不建 SKU。
      // SKU 创建失败时仅警告，不回滚 image。
      let imageId = ''
      try {
        const createData = {
          generate_name: buildImportGenerateName(record),
          llm_type: record.llm_type,
          image_name: record.image_name,
          image_label: record.image_label,
        }
        if (record.desktop && typeof record.desktop === 'object') {
          createData.desktop_config = record.desktop
        }
        if (record.app_name) {
          createData.app_name = record.app_name
        }
        const imgRes = await new this.$Manager('llm_images').create({ data: createData })
        imageId = imgRes?.data?.id
        this.$set(this.existingImages, `${record.llm_type}:${record.image_name}:${record.image_label}`, true)
      } catch (err) {
        throw err
      }
      try {
        await this.maybeCreateDefaultSku(record, imageId)
        this.$message.success(this.$t('common.success'))
      } catch (err) {
        this.$message.warning(this.$t('aice.llm_image.sku_auto_create_failed', [err?.message || err]))
      }
    },
    async maybeCreateDefaultSku (record, imageId) {
      if (!imageId) return
      const spec = getDefaultSkuSpecForType(record.llm_type)
      if (!spec) return // dify 等无默认 SKU 模板的类型直接跳过
      const portMappings = getDefaultPortMappingsForType(record.llm_type)
      const data = {
        generate_name: buildImportGenerateName(record),
        llm_type: record.llm_type,
        llm_image_id: imageId,
        cpu: spec.cpu,
        memory: spec.memory,
        bandwidth: spec.bandwidth,
        volumes: [{ size_mb: spec.volume_size_mb }],
        disk_size: spec.volume_size_mb,
        llm_sku: { [record.llm_type]: {} },
      }
      if (portMappings.length > 0) {
        data.port_mappings = portMappings
      }
      await new this.$Manager('llm_skus').create({ data })
    },
  },
}
</script>

<style scoped>
.mt-3 {
  margin-top: 12px;
}
.mb-2 {
  margin-bottom: 8px;
}
</style>
<style>
.md-desc p {
  margin-bottom: 0;
}
.md-desc a {
  color: #1890ff;
}
</style>
