<template>
  <div>
    <page-toolbar>
      <div class="mb-2 d-flex" v-if="showGroupActions">
        <div class="d-flex flex-fill">
          <refresh-button :disabled="disabledRefreshBtn"  class="flex-shrink-0" :loading="loading" @refresh="refresh" />
          <template v-if="groupActions">
            <actions class="flex-shrink-0" :options="groupActions" button-type="default" @clear-selected="handleClearSelected" group />
          </template>
          <slot name="group-actions-append" />
          <tag-filter
            :tagManagerInstance="tagManagerInstance"
            v-if="showTagFilter"
            :list="list" />
        </div>
        <div class="ml-4 d-flex flex-shrink-0 justify-content-end">
          <slot name="right-tools-prepend" />
          <template v-if="exportDataOptions || list.id">
            <a-tooltip title="导出数据" v-if="exportDataOptions">
              <a-button icon="download" style="width: 40px;" @click="handleExportData" />
            </a-tooltip>
            <a-tooltip title="自定义列表项" v-if="list.id">
              <a-button class="ml-2" icon="setting" style="width: 40px;" @click="handleCustomList" />
            </a-tooltip>
          </template>
        </div>
      </div>
      <div class="d-flex" v-if="showSearchbox">
        <div class="flex-fill">
          <search-box
            v-if="filterOptions"
            :options="filterOptions"
            :value="filter"
            :list="list"
            :default-search-key="defaultSearchKey"
            @input="handleFilterChange" />
        </div>
      </div>
    </page-toolbar>
    <slot name="table-prepend" />
    <floating-scroll>
      <vxe-grid
        :row-id="rowId"
        class="page-list-grid"
        ref="grid"
        align="left"
        highlight-hover-row
        highlight-current-row
        :data="data"
        :style="{ width: gridWidth}"
        :columns="tableColumns"
        :pager-config="tablePage"
        :sort-config="{ sortMethod: () => {} }"
        :checkbox-config="checkboxConfig"
        :expand-config="expandConfig"
        @sort-change="handleSortChange"
        @page-change="handlePageChange"
        @checkbox-change="handleCheckboxChange"
        @checkbox-all="handleCheckboxChange">
        <template v-slot:empty>
          <loader :loading="loading" :noDataText="noDataText" />
        </template>
      </vxe-grid>
    </floating-scroll>
    <div  v-if="data.length > 0 && nextMarker" class="text-center mt-4">
      <a-button :loading="loading" type="link" @click="handleNextMarkerChange">{{ loading ? '加载中' : '加载更多' }}</a-button>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import debounce from 'lodash/debounce'
import Actions from './Actions'
import RefreshButton from './RefreshButton'
import TagFilter from './TagFilter'
import { getTagTitle, isUserTag } from '@/utils/common/tag'
import { addResizeListener, removeResizeListener } from '@/utils/resizeEvent'

export default {
  name: 'PageList',
  components: {
    Actions,
    RefreshButton,
    TagFilter,
  },
  props: {
    // 生成的list实例store
    list: {
      type: Object,
      required: true,
    },
    // 列配置
    columns: {
      type: Array,
      required: true,
    },
    // 单行操作配置
    singleActions: {
      type: Array,
    },
    // 列表头部操作按钮
    groupActions: {
      type: Array,
    },
    // 导出数据配置
    exportDataOptions: {
      type: Object,
    },
    // 开启标签过滤
    showTagFilter: Boolean,
    // 开启标签列
    showTagColumns: Boolean,
    showSelection: Boolean,
    pagerLayout: {
      type: Array,
      default: () => {
        return ['PrevJump', 'PrevPage', 'Jump', 'PageCount', 'NextPage', 'NextJump', 'Sizes', 'Total']
      },
    },
    // 展开行配置项
    expandConfig: {
      type: Object,
    },
    showGroupActions: {
      type: Boolean,
      default: true,
    },
    showSingleActions: {
      type: Boolean,
      default: true,
    },
    showSearchbox: {
      type: Boolean,
      default: true,
    },
    tagManagerInstance: Object,
    disabledRefreshBtn: {
      type: Boolean,
      default: false,
    },
    defaultSearchKey: String,
    showPage: {
      type: Boolean,
      default: true,
    },
    noDataText: {
      type: String,
    },
  },
  provide: {
    inList: true,
  },
  inject: {
    // 是否处于SidePage中
    inBaseSidePage: {
      default: false,
    },
  },
  data () {
    return {
      tableColumns: [],
      gridWidth: 'auto',
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    loading () {
      return this.list.loading
    },
    data () {
      return Object.values(this.list.data).sort((a, b) => a.index - b.index).map(item => item.data)
    },
    rowId () {
      return this.list.idKey
    },
    filterOptions () {
      const { filterOptions } = this.list
      if (!filterOptions || R.isEmpty(filterOptions)) return null
      const filterSortKeys = ['name', 'brand', 'provider', 'ip', 'ips', 'status', 'enabled', 'sn', 'os_type', 'tenant', 'region', 'host', 'billing_type']
      const _filterOptions = {}
      filterSortKeys.forEach(k => {
        const _k = k.toLowerCase()
        if (filterOptions[_k]) {
          _filterOptions[_k] = filterOptions[_k]
        }
      })
      Object.keys(filterOptions).forEach(k => {
        const _k = k.toLowerCase()
        if (!_filterOptions[_k]) {
          _filterOptions[_k] = filterOptions[_k]
        }
      })
      return _filterOptions
    },
    filter () {
      return this.list.filter
    },
    nextMarker () {
      return this.list.nextMarker
    },
    tablePage () {
      const listLimit = this.list.limit
      const limit = this.list.getLimit() || listLimit
      if (this.list.total <= 0 || !this.showPage) return null
      const currentPage = limit ? Math.floor(this.list.offset / limit) + 1 : 1
      return {
        total: this.list.total,
        currentPage,
        pageSize: limit,
        layouts: this.pagerLayout,
      }
    },
    checkboxConfig () {
      return {
        reserve: true,
        highlight: true,
      }
    },
    // 是否渲染
    showCheckbox () {
      return (this.groupActions && this.groupActions.length > 0) || this.showSelection
    },
  },
  watch: {
    'list.config.hiddenColumns' (val, oldVal) {
      if (!R.equals(val, oldVal)) {
        this.$nextTick(() => {
          this.updateHiddenColumns()
        })
      }
    },
    'list.config.showTagKeys' (val, oldVal) {
      if (!R.equals(val, oldVal)) {
        this.$nextTick(() => {
          this.updateTagKeyColumns()
        })
      }
    },
  },
  beforeDestroy () {
    this.list.clearWaitJob()
  },
  created () {
    this.tableColumns = this.genTableColumns()
    this.$nextTick(() => {
      this.tableColumns = this.$refs.grid.getColumns()
    })
  },
  mounted () {
    this.initFloatingScrollListener()
  },
  methods: {
    refresh () {
      const { resource } = this.list
      if (resource === 'actions') {
        this.reset()
      }
      this.list.refresh()
      this.handleClearSelected()
    },
    reset () {
      this.list.reset()
    },
    handleNextMarkerChange () {
      this.list.changeNextMarker()
    },
    handlePageChange ({ type, currentPage, pageSize }) {
      if (type === 'current') {
        this.list.changeCurrentPage(currentPage)
        this.handleClearSelected()
      }
      if (type === 'size') {
        this.list.changePageSize(pageSize)
      }
    },
    handleFilterChange (filter) {
      this.handleClearSelected()
      this.list.changeFilter(filter)
    },
    handleCheckboxChange ({ selection }) {
      this.list.changeSelected(selection)
    },
    async handleClearSelected () {
      this.list.clearSelected()
      await this.$refs.grid.clearCheckboxReserve()
      await this.$refs.grid.clearCheckboxRow()
    },
    handleExportData () {
      this.$parent.createDialog('ExportListDataDialog', {
        title: '导出数据',
        list: this.list,
        options: this.exportDataOptions,
        showTagColumns: this.showTagColumns,
      })
    },
    handleCustomList () {
      this.$parent.createDialog('CustomListDialog', {
        title: '自定义列表项',
        list: this.list,
        customs: this.tableColumns,
        showTagColumns: this.showTagColumns,
      })
    },
    handleSortChange ({ property, order }) {
      this.handleClearSelected()
      this.list.doSort(property, order)
    },
    genTableColumns () {
      let defaultColumns = this.columns.filter(item => {
        if (R.is(Function, item.hidden)) return !item.hidden()
        return !item.hidden
      })
      if (this.showCheckbox) {
        defaultColumns.unshift({ type: 'checkbox', width: 40 })
      }
      if (this.showSingleActions && this.singleActions && this.singleActions.length) {
        defaultColumns.push({
          field: 'action',
          title: '操作',
          minWidth: 120,
          slots: {
            default: ({ row }, h) => {
              return [<Actions options={ this.singleActions } row={ row } button-type='link' button-size='small' button-style={{ fontSize: '12px' }} />]
            },
            header: ({ column }, h) => {
              return [
                <span style={{ paddingLeft: '7px' }}>操作</span>,
              ]
            },
          },
        })
      }
      return defaultColumns
    },
    // 初始化tbody监听器，发生变化更新虚拟滚动条，以保证宽度是正确的
    initFloatingScrollListener () {
      const gridEl = this.$refs.grid.$el
      const tableBodyEl = gridEl.querySelector('.vxe-table--body-wrapper .vxe-table--body')
      const debounceUpdateFloatingScroll = debounce(this.updateFloatingScroll, 500)
      addResizeListener(tableBodyEl, debounceUpdateFloatingScroll)
      this.$once('hook:beforeDestroy', () => {
        removeResizeListener(tableBodyEl, debounceUpdateFloatingScroll)
      })
    },
    // 更新虚拟滚动条
    updateFloatingScroll () {
      const gridEl = this.$refs.grid && this.$refs.grid.$el
      if (!gridEl) return
      const tableBodyEl = gridEl.querySelector('.vxe-table--body-wrapper .vxe-table--body')
      const tableBodyWidth = tableBodyEl.getBoundingClientRect().width
      if (tableBodyWidth) this.gridWidth = `${tableBodyWidth}px`
      gridEl && this.$bus.$emit('FloatingScrollUpdate', {
        sourceElement: gridEl,
      })
    },
    updateTagKeyColumns () {
      let tableColumns = this.genTableColumns()
      const showTagKeys = this.list.config.showTagKeys || []
      const tagsColumns = showTagKeys.map(item => {
        return {
          field: item,
          title: getTagTitle(item),
          showOverflow: 'title',
          minWidth: 70,
          sortable: true,
          slots: {
            default: ({ row }) => {
              const message = row.metadata && row.metadata[item]
              return [
                <list-body-cell-wrap copy field={item} row={row} message={message} hideField>{ message }</list-body-cell-wrap>,
              ]
            },
          },
        }
      })
      const insertIndex = this.showCheckbox ? 2 : 1
      tableColumns = R.insertAll(insertIndex, tagsColumns, tableColumns)
      this.$refs.grid.loadColumn(tableColumns)
      this.$nextTick(() => {
        this.tableColumns = this.$refs.grid.getColumns()
        this.updateHiddenColumns()
      })
    },
    updateHiddenColumns () {
      const hiddenColumns = this.list.config.hiddenColumns || []
      R.forEach(item => {
        if (item.property && (item.type !== 'checkbox' || item.property !== 'action') && !isUserTag(item.property)) {
          item.visible = !hiddenColumns.includes(item.property)
        }
      }, this.tableColumns)
      this.$refs.grid.refreshColumn()
    },
    updateColumns () { // 对于动态columns时，请在外部调用 this.refs.pagelist.updateColumns()
      const tableColumns = this.genTableColumns()
      this.$refs.grid.loadColumn(tableColumns)
      this.$nextTick(() => {
        this.tableColumns = this.$refs.grid.getColumns()
        this.updateHiddenColumns()
      })
    },
  },
}
</script>

<style lang="scss" scoped>
.page-list-grid {
  min-width: 100%;
  ::v-deep {
    > .vxe-table > .vxe-table--main-wrapper > .vxe-table--body-wrapper {
      overflow: hidden;
    }
    .vxe-table.is--empty .vxe-table--empty-block, .vxe-table.is--empty .vxe-table--empty-placeholder {
      height: auto !important;
    }
  }
}
</style>
