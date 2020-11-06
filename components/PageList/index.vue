<template>
  <div>
    <page-list-header
      :id="id"
      :show-group-actions="showGroupActions"
      :loading="loading"
      :group-actions="groupActions"
      :tag-manager-instance="tagManagerInstance"
      :show-tag-filter="showTagFilter"
      :tag-filter="tagFilter"
      :resource="resource"
      :show-searchbox="showSearchbox"
      :filter-options="filterOptions"
      :filter="filter"
      :default-search-key="defaultSearchKey"
      :on-manager="onManager"
      :params="params"
      :export-data-options="exportDataOptions"
      :refresh-method="refreshMethod"
      :config="config"
      :show-tag-columns="showTagColumns"
      :get-grid="getGrid"
      :total="total"
      :selected="selected"
      :api-version="apiVersion"
      :update-config="updateConfig"
      :fetch-distinct-field="fetchDistinctField"
      :before-show-menu-loaded="beforeShowMenuLoaded"
      @refresh="refresh"
      @clear-selected="clearSelected"
      @tag-filter-change="tagFilterChange"
      @filter-change="filterChange">
      <slot name="group-actions-append" slot="group-actions-append" />
      <slot name="right-tools-prepend" slot="right-tools-prepend" />
    </page-list-header>
    <!-- header和table中间内容插槽 -->
    <slot name="table-prepend" />
    <!-- 列表待config加载完成后呈现 -->
    <template v-if="configLoaded">
      <page-list-table
        ref="table"
        :id="id"
        :id-key="idKey"
        :data="finalData"
        :columns="columns"
        :loading="loading"
        :group-actions="groupActions"
        :single-actions="singleActions"
        :show-checkbox="showCheckbox"
        :show-single-actions="showSingleActions"
        :get-limit="getLimit"
        :limit="limit"
        :offset="offset"
        :total="total"
        :pager-layout="pagerLayout"
        :expand-config="expandConfig"
        :config="config"
        :next-marker="nextMarker"
        :selection-type="selectionType"
        :inBaseSidePage="inBaseSidePage"
        :isSidepageOpen="isSidepageOpen"
        :noDataText="noDataText"
        :show-page="showPage"
        :span-method="spanMethod"
        :before-show-menu-loaded="beforeShowMenuLoaded"
        @change-current-page="changeCurrentPage"
        @change-page-size="changePageSize"
        @do-sort="doSort"
        @change-selected="changeSelected"
        @clear-selected="clearSelected"
        @change-next-marker="changeNextMarker"
        @radio-change="radioChange" />
    </template>
    <template v-if="!loading && !configLoaded">
      <loader :loading="loading" :noDataText="noDataText" />
    </template>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import PageListHeader from './components/Header'
import PageListTable from './components/Table'

export default {
  name: 'PageList',
  components: {
    PageListHeader,
    PageListTable,
  },
  props: {
    // 生成的list实例store
    list: {
      type: Object,
      required: true,
    },
    // 是否显示批量操作区域
    showGroupActions: {
      type: Boolean,
      default: true,
    },
    showSingleActions: {
      type: Boolean,
      default: true,
    },
    // 列表头部操作按钮
    groupActions: Array,
    // 单行操作配置
    singleActions: Array,
    // 提供给标签过滤器自定义获取标签数据的Manager实例
    tagManagerInstance: Object,
    // 开启标签过滤
    showTagFilter: Boolean,
    // 开启标签列
    showTagColumns: Boolean,
    // 是否显示搜索框
    showSearchbox: {
      type: Boolean,
      default: true,
    },
    // 不选择搜索类型情况下，默认搜索key
    defaultSearchKey: String,
    // 列配置
    columns: {
      type: Array,
      required: true,
    },
    // 是否显示列选择
    showCheckbox: Boolean,
    // 导出数据配置
    exportDataOptions: Object,
    // 分页布局
    pagerLayout: {
      type: Array,
      default: () => {
        return ['PrevJump', 'PrevPage', 'Jump', 'PageCount', 'NextPage', 'NextJump', 'Sizes', 'Total']
      },
    },
    // 展开行配置项
    expandConfig: Object,
    // 自定义刷新方法
    refreshMethod: Function,
    // 列表行选择类型，单选（radio）多选（checkbox）
    selectionType: {
      type: String,
      default: 'checkbox',
    },
    dataMapper: Function,
    noDataText: String,
    // 是否显示分页
    showPage: {
      type: Boolean,
      default: true,
    },
    spanMethod: {
      type: Function,
    },
    // 显示按钮之前要做的事情
    beforeShowMenu: {
      type: Function,
    },
  },
  provide: {
    // 声明在List中
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
      beforeShowMenuLoaded: R.isNil(this.beforeShowMenu) || R.isEmpty(this.beforeShowMenu),
    }
  },
  computed: {
    id () {
      return this.list.id
    },
    loading () {
      return this.list.loading
    },
    configLoaded () {
      return this.list.configLoaded
    },
    resource () {
      return this.list.resource
    },
    apiVersion () {
      return this.list.apiVersion
    },
    // 标签过滤项
    tagFilter () {
      return this.list.tagFilter
    },
    filterOptions () {
      return this.list.filterOptions
    },
    filter () {
      return this.list.filter
    },
    params () {
      return this.list.params
    },
    idKey () {
      return this.list.idKey
    },
    extraData () {
      return this.list.extraData
    },
    data () {
      return this.list.data
    },
    finalData () {
      if (!R.isNil(this.extraData) && !R.isEmpty(this.extraData) && this.dataMapper) {
        return this.dataMapper(this.data, this.extraData)
      }
      return this.data
    },
    limit () {
      return this.list.limit
    },
    total () {
      return this.list.total
    },
    offset () {
      return this.list.offset
    },
    // 列表配置信息
    config () {
      return this.list.config
    },
    selected () {
      return this.list.selected
    },
    nextMarker () {
      return this.list.nextMarker
    },
    ...mapGetters(['isSidepageOpen']),
  },
  beforeDestroy () {
    this.list.clearWaitJob()
  },
  async created () {
    if (this.beforeShowMenu) {
      await this.beforeShowMenu()
      this.beforeShowMenuLoaded = true
    }
  },
  methods: {
    async refresh () {
      const data = await this.list.refresh()
      this.$emit('refresh', data)
    },
    reset () {
      this.list.reset()
    },
    // 更改标签并重置刷新列表
    tagFilterChange (tagFilter) {
      this.list.changeTagFilter(tagFilter)
    },
    filterChange (filter) {
      this.list.changeFilter(filter)
    },
    onManager () {
      return this.list.onManager(...arguments)
    },
    getLimit () {
      return this.list.getLimit()
    },
    changeCurrentPage (currentPage) {
      if (this.loading) return
      this.list.changeCurrentPage(currentPage)
    },
    changePageSize (pageSize) {
      if (this.loading) return
      this.list.changePageSize(pageSize)
    },
    doSort (property, order) {
      this.list.doSort(property, order)
    },
    changeSelected (selection) {
      this.list.changeSelected(selection)
    },
    // 清除list中的选择项
    clearSelected () {
      this.list.clearSelected()
      if (this.selectionType === 'checkbox') {
        this.$refs.table.clearCheckbox()
      }
      if (this.selectionType === 'radio') {
        this.$refs.table.clearRadio()
      }
    },
    updateConfig (value) {
      return this.list.updateConfig(value)
    },
    getGrid () {
      return this.$refs.table.$refs.grid
    },
    changeNextMarker () {
      this.list.changeNextMarker()
    },
    radioChange (data) {
      this.$emit('radio-change', data)
    },
    fetchDistinctField (item) {
      return this.list.fetchDistinctField(item)
    },
  },
}
</script>
