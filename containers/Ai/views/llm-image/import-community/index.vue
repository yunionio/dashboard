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
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

const LLM_IMAGES_URL = 'http://localhost:3000/llmimages.yaml'

const LLM_TYPE_ICONS = {
  openclaw: require('@/assets/images/llm-images/openclaw.svg'),
  ollama: require('@/assets/images/llm-images/ollama.svg'),
  vllm: require('@/assets/images/llm-images/vllm.svg'),
  dify: require('@/assets/images/llm-images/dify.svg'),
  comfyui: require('@/assets/images/llm-images/comfyui.svg'),
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
    typeList () {
      const seen = {}
      const ret = []
      this.allItems.forEach(item => {
        const t = item.llm_type
        if (t && !seen[t]) {
          seen[t] = true
          ret.push({ value: t, label: t, icon: getTypeIcon(t) })
        }
      })
      return ret
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
          title: this.$t('aice.llm_type.app'),
          width: 120,
          slots: {
            default: ({ row }, h) => {
              return [h('span', this.$t(`aice.llm_type.${row.llm_type}`) || row.llm_type)]
            },
          },
        },
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
        this.allItems = items.filter(i => i?.image).map((item, index) => {
          const { image_name, image_label } = parseImageField(item.image)
          return {
            id: String(index + 1),
            image: item.image,
            image_name,
            image_label,
            llm_type: item.llm_type || '',
            description: item.description || '-',
            icon: getTypeIcon(item.llm_type || ''),
          }
        })
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
      try {
        const createData = {
          generate_name: `${record.llm_type}-${record.image_label}`,
          llm_type: record.llm_type,
          image_name: record.image_name,
          image_label: record.image_label,
        }
        await new this.$Manager('llm_images').create({ data: createData })
        this.$set(this.existingImages, `${record.llm_type}:${record.image_name}:${record.image_label}`, true)
        this.$message.success(this.$t('common.success'))
      } catch (err) {
        throw err
      }
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
