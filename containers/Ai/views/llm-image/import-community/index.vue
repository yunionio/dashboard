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
import marked from 'marked'
import { parseLlmImageRoute, getAllowedImageLlmTypes } from '@Ai/utils/llmRouteContext'
import {
  createCommunityImageAndSku,
  fetchCommunityImageItems,
  fetchExistingCommunityImageKeys,
  getCommunityImageKey,
  getTypeIcon,
  isCommunityImageImported,
} from '@Ai/utils/communityImages'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

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
      imagesManager: new this.$Manager('llm_images'),
      skusManager: new this.$Manager('llm_skus'),
      catalogManager: new this.$Manager('llm_images_catalogs', 'v1'),
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
          title: this.$t('aice.llm_type'),
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
      const prefix = `${llmType}:`
      Object.keys(this.existingImages).forEach(key => {
        if (key.startsWith(prefix)) {
          this.$delete(this.existingImages, key)
        }
      })
      const partial = await fetchExistingCommunityImageKeys(
        [llmType],
        this.skusManager,
        this.allItems.filter(item => item.llm_type === llmType),
        {
          scope: this.$store.getters.scope,
          typeFilter: `llm_type.equals('${llmType}')`,
        },
      )
      Object.keys(partial).forEach(key => {
        this.$set(this.existingImages, key, true)
      })
    },
    isImported (record) {
      return isCommunityImageImported(record, this.existingImages)
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
        this.allItems = await fetchCommunityImageItems(this.allowedImageLlmTypes, this.catalogManager)
        if (this.typeList.length > 0) {
          this.form.llm_type = this.typeList[0].value
        }
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
        const { skuError } = await createCommunityImageAndSku(record, {
          imagesManager: this.imagesManager,
          skusManager: this.skusManager,
        })
        this.$set(this.existingImages, getCommunityImageKey(record), true)
        if (skuError) {
          this.$message.warning(this.$t('aice.llm_image.sku_auto_create_failed', [skuError?.message || skuError]))
        } else {
          this.$message.success(this.$t('common.success'))
        }
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
