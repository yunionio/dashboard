<template>
  <div>
    <page-toolbar>
      <div class="mb-2 d-flex" v-if="showGroupActions">
        <div class="d-flex flex-fill">
          <refresh-button class="flex-shrink-0" :loading="loading" @refresh="refresh" />
          <template v-if="groupActions">
            <actions class="flex-shrink-0" :options="groupActions" @clear-selected="handleClearSelected" button-type="default" group />
          </template>
          <tag-filter
            v-if="showTagFilter"
            :list="list" />
        </div>
        <div class="ml-4 d-flex flex-shrink-0 justify-content-end" v-if="exportDataOptions || list.id">
          <a-tooltip title="导出数据" v-if="exportDataOptions">
            <a-button icon="download" style="width: 40px;" @click="handleExportData" />
          </a-tooltip>
          <a-tooltip title="自定义列" v-if="list.id">
            <a-button class="ml-2" icon="setting" style="width: 40px;" @click="handleCustomList" />
          </a-tooltip>
        </div>
      </div>
      <div class="d-flex" v-if="showSearchbox">
        <div class="flex-fill">
          <search-box
            v-if="filterOptions"
            :options="filterOptions"
            :value="filter"
            :list="list"
            @input="handleFilterChange" />
        </div>
      </div>
    </page-toolbar>
    <slot name="table-prepend" />
    <vxe-grid
      ref="grid"
      align="left"
      highlight-hover-row
      highlight-current-row
      :data="data"
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
        <loader :loading="loading" />
      </template>
    </vxe-grid>
    <div  v-if="data.length > 0 && nextMarker" class="text-center mt-4">
      <a-button :loading="loading" type="link" @click="handleNextMarkerChange">{{ loading ? '加载中' : '加载更多' }}</a-button>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import Actions from './Actions'
import RefreshButton from './RefreshButton'
import TagFilter from './TagFilter'
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
    showSearchbox: {
      type: Boolean,
      default: true,
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
      if (this.list.total <= 0) return null
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
      }
    },
  },
  watch: {
    'list.config.hiddenColumns' (val, oldVal) {
      if (!R.equals(val, oldVal)) {
        for (let i = 0, len = this.tableColumns.length; i < len; i++) {
          this.tableColumns[i].visible = !val.includes(this.tableColumns[i].property)
        }
        this.$refs.grid.refreshColumn()
      }
    },
  },
  updated () {
    this.setWrapMinWidth()
  },
  beforeDestroy () {
    this.list.clearWaitJob()
    this.clearWrapMinWidth()
  },
  created () {
    this.tableColumns = this.genTableColumns()
    this.$nextTick(() => {
      this.tableColumns = this.$refs.grid.getColumns()
    })
  },
  methods: {
    refresh () {
      this.list.refresh()
    },
    reset () {
      this.list.reset()
    },
    handleNextMarkerChange () {
      this.list.changeNextMarker()
    },
    handlePageChange ({ type, currentPage, pageSize }) {
      if (type === 'current-change') {
        this.list.changeCurrentPage(currentPage)
        this.handleClearSelected()
      }
      if (type === 'size-change') {
        this.list.changePageSize(pageSize)
      }
    },
    handleFilterChange (filter) {
      this.list.changeFilter(filter)
    },
    handleCheckboxChange ({ selection }) {
      this.list.changeSelected(selection)
    },
    handleClearSelected () {
      this.list.clearSelected()
      this.$refs.grid.clearCheckboxRow()
    },
    handleExportData () {
      this.$parent.createDialog('ExportListDataDialog', {
        title: '导出数据',
        list: this.list,
        options: this.exportDataOptions,
      })
    },
    handleCustomList () {
      this.$parent.createDialog('CustomListDialog', {
        title: '自定义列表',
        list: this.list,
        customs: this.tableColumns,
      })
    },
    handleSortChange ({ property, order }) {
      this.list.doSort(property, order)
    },
    genTableColumns () {
      let defaultColumns = this.columns.filter(item => {
        if (R.is(Function, item.hidden)) return !item.hidden()
        return !item.hidden
      })
      if ((this.groupActions && this.groupActions.length > 0) || this.showSelection) {
        defaultColumns.unshift({ type: 'checkbox', width: 40 })
      }
      if (this.singleActions && this.singleActions.length) {
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
    setWrapMinWidth () {
      const gridEl = this.$refs.grid.$el
      const tableBody = gridEl.querySelector('.vxe-table--body-wrapper .vxe-table--body')
      const tableBodyWidth = tableBody.getBoundingClientRect().width
      if (tableBodyWidth) {
        let container
        let padding = 0
        if (this.inBaseSidePage) {
          padding = 60
          container = document.getElementById('side-page-container')
        } else {
          padding = 30
          container = document.getElementById('app-page')
        }
        container.style.minWidth = `${tableBodyWidth + padding}px`
        container = null
      }
    },
    clearWrapMinWidth () {
      let container
      if (this.inBaseSidePage) {
        container = document.getElementById('side-page-container')
      } else {
        container = document.getElementById('app-page')
      }
      if (container) {
        container.style = ''
        container = null
      }
    },
  },
}
</script>
