<template>
  <div ref="listRoot" class="llm-sku-card-list" :style="listContainerStyle">
    <page-list
      class="llm-sku-list llm-sku-list--card"
      :list="list"
      :columns="columns"
      :group-actions="groupActions"
      :export-data-options="exportDataOptions"
      :show-single-actions="false"
      :hide-rowselect="true"
      :hidden-list-config="true">
      <template slot="table-prepend">
        <llm-sku-grid
          :items="listItems"
          :loading="list.loading"
          :is-apply-type="isApplyType"
          :is-desktop-type="isDesktopType"
          :selected="list.selected"
          :single-actions="singleActions"
          :on-manager="onManager"
          :vm="listVm"
          @open-sidepage="handleOpenSidepage"
          @toggle-select="toggleSelect" />
      </template>
    </page-list>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters, mapState } from 'vuex'
import { parseLlmRoute, getLlmSkuTypeFilter } from '@Ai/utils/llmRouteContext'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getLlmSkuListSteadyStatuses } from '@Ai/utils/llmSkuStatus'
import LlmSkuGrid from './LlmSkuGrid'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { filterOptions } from '../utils/filters'

const MIN_LIST_HEIGHT = 400
const BOTTOM_MARGIN = 15

export default {
  name: 'PhoneSpecList',
  components: {
    LlmSkuGrid,
  },
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      listContainerHeight: MIN_LIST_HEIGHT,
      heightTimers: [],
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'llm_skus',
        getParams: this.getParam,
        filterOptions,
        hiddenColumns: [],
        steadyStatus: {
          status: getLlmSkuListSteadyStatuses(),
        },
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.$router.push(this.llmRouteCtx.skuCreatePath)
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: true,
            }
          },
          hidden: () => {
            return !this.isApplyType && !this.isDesktopType
          },
        },
        {
          label: this.$t('aice.import_model'),
          actions: () => [
            {
              label: this.$t('aice.llm_deployment.deploy.from_catalog'),
              action: () => {
                this.$router.push({ path: this.llmRouteCtx.skuImportFromModelSetsPath })
              },
            },
            {
              label: this.$t('aice.llm_deployment.deploy.from_huggingface'),
              action: () => {
                this.$router.push({ path: this.llmRouteCtx.skuImportFromHuggingfacePath })
              },
            },
          ],
          meta: () => ({
            buttonType: 'primary',
            validate: true,
          }),
          hidden: () => !this.llmRouteCtx.isInferenceType,
        },
        {
          label: this.$t('aice.import'),
          action: () => {
            this.$router.push({ path: this.llmRouteCtx.skuImportFromCommunityPath })
          },
          meta: () => ({
            buttonType: 'primary',
            validate: true,
          }),
          hidden: () => !(this.isApplyType || this.isDesktopType),
        },
        {
          label: this.$t('table.action.delete'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('table.action.delete'),
              name: this.$t('aice.spec'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = { validate: this.list.selected.length }
            if (this.list.selectedItems.some(item => !item.can_delete)) {
              ret.validate = false
              return ret
            }
            return ret
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['isSidepageOpen']),
    ...mapState('common', {
      cloudShellHeight: state => (state.openCloudShell ? state.cloudShellHeight : 0),
    }),
    listContainerStyle () {
      return {
        height: `${this.listContainerHeight}px`,
        overflowX: 'hidden',
      }
    },
    llmRouteCtx () {
      return parseLlmRoute(this.$route.path)
    },
    isApplyType () {
      return this.llmRouteCtx.isApplyType
    },
    isDesktopType () {
      return this.llmRouteCtx.isDesktopType
    },
    listItems () {
      if (!this.list || !this.list.data) return []
      return Object.values(this.list.data)
        .sort((a, b) => a.index - b.index)
        .map(wrap => wrap.data)
    },
    listVm () {
      return this
    },
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('aice.spec'),
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
      }
    },
  },
  watch: {
    'list.loading' () {
      this.scheduleInitHeight()
    },
    listItems () {
      this.scheduleInitHeight()
    },
    cloudShellHeight () {
      this.initHeight()
    },
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  mounted () {
    this.$bus.$on('GlobalTopAlertUpdate', this.onGlobalTopAlertUpdate)
    this.scheduleInitHeight()
    window.addEventListener('resize', this.initHeight)
  },
  beforeDestroy () {
    this.$bus.$off('GlobalTopAlertUpdate', this.onGlobalTopAlertUpdate)
    window.removeEventListener('resize', this.initHeight)
    this.heightTimers.forEach(clearTimeout)
  },
  methods: {
    onGlobalTopAlertUpdate () {
      this.scheduleInitHeight()
    },
    scheduleInitHeight () {
      this.$nextTick(() => {
        this.initHeight()
        this.heightTimers.forEach(clearTimeout)
        this.heightTimers = [100, 500].map(delay => setTimeout(() => this.initHeight(), delay))
      })
    },
    initHeight () {
      const root = this.$refs.listRoot
      if (!root) return
      if (this.isSidepageOpen) {
        this.listContainerHeight = MIN_LIST_HEIGHT
        return
      }
      const rootTop = root.getBoundingClientRect().y
      const wH = document.body.offsetHeight
      const calculatedHeight = wH - rootTop - BOTTOM_MARGIN - this.cloudShellHeight
      this.listContainerHeight = calculatedHeight > MIN_LIST_HEIGHT ? calculatedHeight : MIN_LIST_HEIGHT
    },
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      ret.filter = R.is(Array, ret.filters) ? ret.filters : (R.is(String, ret.filters) ? [ret.filters] : [])
      ret.filter.push(getLlmSkuTypeFilter(this.llmRouteCtx))
      return ret
    },
    toggleSelect (row) {
      const items = [...this.list.selectedItems]
      const idx = items.findIndex(item => item.id === row.id)
      if (idx >= 0) {
        items.splice(idx, 1)
      } else {
        items.push(row)
      }
      this.list.changeSelected(items)
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'LlmSkuSidePage', {
        id: row.id,
        resource: 'llm_skus',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>

<style scoped>
.llm-sku-card-list {
  display: flex;
  flex-direction: column;
  min-height: 400px;
  overflow-x: hidden;
}

/* page-list 根节点同时带有 llm-sku-list--card */
.llm-sku-list--card {
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

.llm-sku-list--card ::v-deep .llm-sku-grid {
  flex: 1 1 auto;
  min-height: 200px;
  overflow: hidden;
}

.llm-sku-list--card ::v-deep .table-container,
.llm-sku-list--card ::v-deep #vxe-table {
  flex-shrink: 0;
  overflow: visible;
  position: relative;
  z-index: 2;
}

/* 隐藏表格区域，保留 page-list 分页、筛选 pin、列设置等能力 */
.llm-sku-list--card ::v-deep #vxe-table .page-list-grid .vxe-table,
.llm-sku-list--card ::v-deep #vxe-table .page-list-grid-virtual-scroll .vxe-table {
  display: none;
}

/* 隐藏表格后不再占用虚拟滚动计算出的空白高度，仅保留底部分页 */
.llm-sku-list--card ::v-deep #vxe-table .page-list-grid,
.llm-sku-list--card ::v-deep #vxe-table .page-list-grid-virtual-scroll,
.llm-sku-list--card ::v-deep #vxe-table .vxe-grid {
  max-height: none !important;
  min-height: 0 !important;
  height: auto !important;
}

.llm-sku-list--card ::v-deep #vxe-table .vxe-table--main-wrapper,
.llm-sku-list--card ::v-deep #vxe-table .vxe-table--body-wrapper {
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  overflow: hidden;
}

.llm-sku-list--card ::v-deep #vxe-table {
  width: 100%;
}

.llm-sku-list--card ::v-deep #vxe-table .vxe-grid--pager-wrapper,
.llm-sku-list--card ::v-deep #vxe-table .vxe-pager {
  display: flex;
  width: 100%;
  overflow: visible !important;
}

/* 分页每页条数等下拉不被外层裁切 */
.llm-sku-list--card ::v-deep .vxe-select--panel,
.llm-sku-list--card ::v-deep .vxe-pager--wrapper {
  overflow: visible !important;
}

/* 与表格列表一致：分页控件靠左，统计信息靠右 */
.llm-sku-list--card ::v-deep #vxe-table .vxe-pager {
  text-align: left !important;
  justify-content: flex-start !important;
}

.llm-sku-list--card ::v-deep #vxe-table .vxe-pager .vxe-pager--wrapper {
  flex-grow: 0 !important;
}

.llm-sku-list--card ::v-deep #vxe-table .vxe-pager .vxe-pager--right-wrapper {
  margin-left: auto;
}
</style>
