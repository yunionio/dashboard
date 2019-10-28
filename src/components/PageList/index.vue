<template>
  <div>
    <page-toolbar>
      <div class="mb-2 d-flex">
        <refresh-button :loading="loading" @refresh="refresh" />
        <template v-if="groupActions">
          <actions :options="groupActions" class="ml-2" @action-click="handleClearSelected" />
        </template>
      </div>
      <search-box v-if="filterOptions" :options="filterOptions" :value="filter" @input="handleFilterChange" />
    </page-toolbar>
    <vxe-grid
      ref="grid"
      highlight-hover-row
      show-header-overflow="title"
      :data="data"
      :columns="tableColumns"
      :pager-config="tablePage"
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
import { mapGetters } from 'vuex'
import Actions from './Actions'
import RefreshButton from './RefreshButton'
import Loader from './Loader'

export default {
  name: 'PageList',
  components: {
    Actions,
    RefreshButton,
    Loader,
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
      let defaultColumns = []
      if (this.groupActions && this.groupActions.length > 0) {
        defaultColumns.push({ type: 'selection', width: 60 })
      }
      defaultColumns = defaultColumns.concat(this.columns)
      if (this.singleActions && this.singleActions.length) {
        defaultColumns = defaultColumns.concat([{
          field: 'action',
          title: '操作',
          slots: {
            default: ({ row }, h) => {
              return [<Actions options={ this.singleActions } row={ row } buttonMode={ false } />]
            },
          },
        }])
      }
      return defaultColumns
    },
    tablePage () {
      const limit = this.list.getLimit()
      if (this.data.length <= 0) return null
      const currentPage = limit ? Math.floor(this.list.offset / limit) + 1 : 1
      return {
        total: this.list.total,
        currentPage,
        pageSize: limit,
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
  },
}
</script>
