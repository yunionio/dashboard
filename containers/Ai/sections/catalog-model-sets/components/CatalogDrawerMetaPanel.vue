<!--
  Drawer 内模型介绍 + 元信息表格（model-sets / HF / 社区通用）
-->
<template>
  <div v-if="hasContent" class="catalog-drawer-meta">
    <p v-if="descriptionText" class="catalog-drawer-desc">{{ descriptionText }}</p>
    <a-descriptions v-if="hasTable" :column="1" size="small" bordered class="mb-3">
      <a-descriptions-item v-if="sizeText" :label="$t('aice.llm_catalog.size')">
        {{ sizeText }}
      </a-descriptions-item>
      <a-descriptions-item v-if="licenses.length > 0" :label="$t('aice.llm_catalog.license')">
        {{ licenses.join(', ') }}
      </a-descriptions-item>
      <a-descriptions-item v-if="releaseDate" :label="$t('aice.llm_catalog.release_date')">
        {{ releaseDate }}
      </a-descriptions-item>
      <a-descriptions-item v-if="capabilities.length > 0" :label="$t('aice.llm_catalog.capabilities')">
        <a-tag v-for="cap in capabilities" :key="cap">{{ cap }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item v-if="homeUrl" :label="$t('aice.llm_catalog.homepage')">
        <a :href="homeUrl" target="_blank" rel="noopener">{{ homeUrl }}</a>
      </a-descriptions-item>
    </a-descriptions>
  </div>
</template>

<script>
import {
  formatCatalogSetSize,
  getCatalogSetHomeUrl,
  normalizeCatalogSetMeta,
  buildMetaFromCommunityTag,
} from '@Ai/utils/catalogDrawerMeta'

export default {
  name: 'CatalogDrawerMetaPanel',
  props: {
    /** model-sets 的 set 对象 */
    set: {
      type: Object,
      default: null,
    },
    /** 社区 tag 项（与 set 二选一） */
    tag: {
      type: Object,
      default: null,
    },
  },
  computed: {
    meta () {
      if (this.set) return normalizeCatalogSetMeta(this.set)
      if (this.tag) return buildMetaFromCommunityTag(this.tag)
      return null
    },
    descriptionText () {
      return (this.meta?.description || '').trim()
    },
    sizeText () {
      if (!this.meta) return ''
      const formatted = formatCatalogSetSize(this.meta)
      if (formatted) return formatted
      const raw = this.meta.size
      return raw != null && raw !== '' ? String(raw) : ''
    },
    licenses () {
      return this.meta?.licenses || []
    },
    releaseDate () {
      return this.meta?.release_date || ''
    },
    capabilities () {
      return this.meta?.capabilities || []
    },
    homeUrl () {
      return getCatalogSetHomeUrl(this.meta)
    },
    hasTable () {
      return !!(this.sizeText ||
        this.licenses.length ||
        this.releaseDate ||
        this.capabilities.length ||
        this.homeUrl)
    },
    hasContent () {
      return !!(this.descriptionText || this.hasTable)
    },
  },
}
</script>

<style scoped>
.catalog-drawer-desc {
  color: #666;
  font-size: 13px;
  margin-bottom: 8px;
  white-space: pre-wrap;
  line-height: 1.55;
}
</style>
