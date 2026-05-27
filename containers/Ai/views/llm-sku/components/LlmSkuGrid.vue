<template>
  <div ref="root" class="llm-sku-grid">
    <a-spin :spinning="loading" class="llm-sku-grid__spin">
      <a-empty v-if="!loading && items.length === 0" />
      <div v-else class="catalog-grid-scroll" :style="scrollStyle">
        <div class="catalog-grid">
        <a-card
          v-for="item in items"
          :key="item.id"
          hoverable
          class="catalog-card"
          :class="{ 'catalog-card--selected': isSelected(item) }">
          <div class="catalog-card-header">
            <div class="catalog-card-title">
              <div class="catalog-card-name" @click.stop>
                <list-body-cell-wrap
                  copy
                  hide-field
                  field="name"
                  :row="item"
                  :message="item.name"
                  :on-manager="onManager"
                  :edit="true"
                  :steady-status="steadyStatus">
                  <side-page-trigger @trigger="$emit('open-sidepage', item)">
                    {{ item.name }}
                  </side-page-trigger>
                </list-body-cell-wrap>
              </div>
              <div class="catalog-subtitle">
                <status
                  v-if="item.status"
                  :status="item.status"
                  status-module="llmSku" />
                <span v-if="item.llm_type" class="llm-type-text">{{ llmTypeLabel(item.llm_type) }}</span>
              </div>
            </div>
          </div>
          <div class="catalog-meta" @click="$emit('open-sidepage', item)">
            <div class="meta-row meta-row--specs">
              <span>CPU {{ item.cpu || '-' }}</span>
              <span>{{ $t('aice.memory') }} {{ formatMemory(item.memory) }}</span>
              <span>{{ $t('aice.disk') }} {{ formatDisk(item) }}</span>
              <span v-if="!isApplyType && item.bandwidth != null">
                {{ $t('aice.bandwidth') }} {{ formatBandwidth(item.bandwidth) }}
              </span>
            </div>
            <div v-if="item.image" class="meta-row meta-row--copy" @click.stop>
              <span class="meta-label">{{ $t('aice.image') }}：</span>
              <list-body-cell-wrap
                copy
                hide-field
                field="image"
                :row="item"
                :message="item.image">
                <side-page-trigger
                  permission="llm_images_get"
                  name="LlmImageSidePage"
                  :id="item.llm_image_id"
                  :vm="vm">
                  <span class="meta-ellipsis-text">{{ item.image }}</span>
                </side-page-trigger>
              </list-body-cell-wrap>
            </div>
            <div
              v-if="isApplyType && mountedModelText(item)"
              class="meta-row meta-ellipsis"
              :title="mountedModelText(item)">
              {{ $t('aice.model') }}：{{ mountedModelText(item) }}
            </div>
            <div v-if="item.description" class="catalog-desc">{{ shortDesc(item.description) }}</div>
            <div v-if="item.tenant || domainName(item)" class="meta-row meta-scope" @click.stop>
              <list-body-cell-wrap
                v-if="item.tenant"
                copy
                field="tenant"
                :row="{ tenant: item.tenant }" />
              <list-body-cell-wrap
                v-if="domainName(item)"
                hide-field
                copy
                field="domain"
                :row="{ domain: domainName(item) }">
                <span class="text-weak">{{ domainName(item) }}</span>
              </list-body-cell-wrap>
            </div>
          </div>
          <div class="catalog-card-footer" @click.stop>
            <a-checkbox
              :checked="isSelected(item)"
              @change="() => $emit('toggle-select', item)" />
            <actions
              class="catalog-card-actions"
              :options="singleActions"
              :row="item"
              button-type="link"
              button-size="small" />
          </div>
        </a-card>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script>
import * as R from 'ramda'
import { sizestr } from '@/utils/utils'
import expectStatus from '@/constants/expectStatus'
import { LLM_TYPE_OPTIONS } from '../constants/llmTypeConfig'
import Actions from '@/components/PageList/Actions'

import Status from '@/components/Status'

export default {
  name: 'LlmSkuGrid',
  components: {
    Actions,
    Status,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    isApplyType: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Array,
      default: () => [],
    },
    singleActions: {
      type: Array,
      default: () => [],
    },
    onManager: {
      type: Function,
    },
    vm: {
      type: Object,
    },
  },
  computed: {
    steadyStatus () {
      const module = expectStatus.llmSku
      return module ? R.uniq(R.flatten(Object.values(module))) : []
    },
    scrollStyle () {
      return {
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
      }
    },
  },
  methods: {
    isSelected (item) {
      return this.selected.includes(item.id)
    },
    domainName (item) {
      return item.project_domain || item.domain
    },
    llmTypeLabel (type) {
      const opt = LLM_TYPE_OPTIONS.find(o => o.id === type)
      return opt ? this.$t(opt.name) : type
    },
    formatMemory (memory) {
      if (memory == null) return '-'
      return sizestr(memory, 'M', 1024)
    },
    formatDisk (item) {
      const volumes = item.volumes || []
      if (!volumes.length) return '-'
      let size = 0
      volumes.forEach(v => { size += v.size_mb || 0 })
      return sizestr(size, 'M', 1024)
    },
    formatBandwidth (bandwidth) {
      if (bandwidth === 0) return `0(${this.$t('common.not_limited')})`
      return `${bandwidth}M`
    },
    mountedModelText (item) {
      const list = item.mounted_model_details || []
      if (!list.length) return ''
      return list.map(v => v.fullname).join(', ')
    },
    shortDesc (s) {
      if (!s) return ''
      const trimmed = String(s).trim()
      return trimmed.length > 80 ? trimmed.slice(0, 77) + '…' : trimmed
    },
  },
}
</script>

<style lang="less" scoped>
@import '@/styles/less/theme.less';

.llm-sku-grid {
  height: 100%;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.llm-sku-grid__spin {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.llm-sku-grid__spin ::v-deep .ant-spin-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.catalog-grid-scroll {
  flex: 1;
  min-height: 0;
  overflow-x: hidden;
}
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  min-width: 0;
}
@media (max-width: 1200px) {
  .catalog-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 992px) {
  .catalog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 576px) {
  .catalog-grid { grid-template-columns: 1fr; }
}
.catalog-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.catalog-card--selected {
  border-color: @primary-color;
}
.catalog-card-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
}
.catalog-card-title {
  flex: 1;
  min-width: 0;
}
.catalog-card-name {
  font-size: 14px;
  font-weight: 600;
  min-width: 0;
}
.catalog-card-name ::v-deep .list-body-cell-wrap {
  min-width: 0;
}
.catalog-card-name ::v-deep .slot-wrap {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.catalog-subtitle {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 6px;
  margin-top: 4px;
  min-width: 0;
}
.catalog-subtitle ::v-deep .status-wrapper {
  width: auto;
  flex: 0 0 auto;
}
.catalog-subtitle ::v-deep .status-wrapper > .d-flex {
  width: auto;
}
.catalog-subtitle ::v-deep .status-wrapper .flex-fill {
  flex: 0 0 auto;
}
.llm-type-text {
  flex-shrink: 0;
  font-size: 12px;
  color: #999;
  white-space: nowrap;
}
.catalog-meta {
  flex: 1;
  cursor: pointer;
}
.meta-row {
  font-size: 12px;
  color: #666;
  line-height: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.meta-row--copy {
  align-items: center;
  flex-wrap: nowrap;
  min-width: 0;
}
.meta-row--copy ::v-deep .list-body-cell-wrap {
  flex: 1;
  min-width: 0;
}
.meta-label {
  flex-shrink: 0;
}
.meta-ellipsis-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  max-width: 100%;
  vertical-align: bottom;
}
.meta-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}
.meta-row--specs {
  flex-wrap: wrap;
}
.meta-scope {
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
}
.meta-scope ::v-deep .list-body-cell-wrap {
  display: inline-flex;
}
.catalog-desc {
  font-size: 12px;
  color: #888;
  margin-top: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.catalog-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}
.catalog-card-actions {
  flex: 1;
  justify-content: flex-end;
}
</style>
