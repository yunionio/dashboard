<template>
  <div>
    <page-toolbar>
      <div class="mb-2 d-flex">
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
      <div class="d-flex">
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
    <vxe-grid
      ref="grid"
      align="left"
      highlight-hover-row
      highlight-current-row
      :data="data"
      :columns="tableColumns"
      :pager-config="tablePage"
      :customs.sync="customs"
      :sort-method="() => {}"
      :checkbox-config="checkboxConfig"
      @sort-change="handleSortChange"
      @current-page-change="handleCurrentPageChange"
      @page-size-change="handlePageSizeChange"
      @select-change="handleSelectChange"
      @select-all="handleSelectChange">
      <template v-slot:empty>
        <loader :loading="loading" />
      </template>
    </vxe-grid>
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
  },
  data () {
    return {
      customs: this.list.config.hiddenColumns.map(item => ({ field: item, visible: false })),
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
      return this.list.filterOptions
    },
    filter () {
      return this.list.filter
    },
    tableColumns () {
      let defaultColumns = this.columns.filter(item => {
        if (R.is(Function, item.hidden)) return !item.hidden()
        return !item.hidden
      })
      if ((this.groupActions && this.groupActions.length > 0) || this.showSelection) {
        defaultColumns.unshift({ type: 'checkbox', width: 40, fixed: 'left' })
      }
      if (this.singleActions && this.singleActions.length) {
        defaultColumns.push({
          field: 'action',
          title: '操作',
          minWidth: 120,
          fixed: 'right',
          slots: {
            default: ({ row }, h) => {
              return [<Actions options={ this.singleActions } row={ row } button-type='link' button-size='small' button-style={{ fontSize: '12px' }} />]
            },
          },
        })
      }
      return defaultColumns
    },
    tablePage () {
      const limit = this.list.getLimit()
      if (this.list.total <= 0) return null
      const currentPage = limit ? Math.floor(this.list.offset / limit) + 1 : 1
      return {
        total: this.list.total,
        currentPage,
        pageSize: limit,
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
        for (let i = 0, len = this.customs.length; i < len; i++) {
          const item = this.customs[i]
          if (item.type !== 'checkbox' && item.property !== 'action' && val.includes(item.property)) {
            this.customs[i]['visible'] = false
          } else {
            this.customs[i]['visible'] = true
          }
        }
        this.$refs.grid.reloadCustoms(this.customs)
      }
    },
  },
  beforeDestroy () {
    this.list.clearWaitJob()
  },
  methods: {
    refresh () {
      this.list.refresh()
    },
    reset () {
      this.list.reset()
    },
    handleCurrentPageChange (currentPage) {
      this.list.changeCurrentPage(currentPage)
      this.handleClearSelected()
    },
    handlePageSizeChange (pageSize) {
      this.list.changePageSize(pageSize)
    },
    handleFilterChange (filter) {
      this.list.changeFilter(filter)
    },
    handleSelectChange ({ selection }) {
      this.list.changeSelected(selection)
    },
    handleClearSelected () {
      this.list.clearSelected()
      this.$refs.grid.clearSelection()
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
        customs: this.customs,
      })
    },
    handleSortChange ({ property, order }) {
      this.list.doSort(property, order)
    },
  },
}
</script>
