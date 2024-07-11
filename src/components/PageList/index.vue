<template>
  <div>
    <page-list-header
      :id="id"
      :show-sync="showSync"
      :show-group-actions="showGroupActions"
      :loading="loading"
      :group-actions="groupActions"
      :tag-manager-instance="tagManagerInstance"
      :tag-manager-instance2="tagManagerInstance2"
      :tag-manager-instance3="tagManagerInstance3"
      :show-tag-filter="showTagFilter"
      :show-tag-filter2="showTagFilter2"
      :show-tag-filter3="showTagFilter3"
      :tag-filter="tagFilter"
      :tag-filter2="tagFilter2"
      :tag-filter3="tagFilter3"
      :resource="resource"
      :show-searchbox="showSearchbox"
      :filter-options="filterOptions"
      :filter="filter"
      :default-search-key="defaultSearchKey"
      :placeholder="placeholder"
      :on-manager="onManager"
      :params="params"
      :export-data-options="exportDataOptions"
      :extra-export-params="extraExportParams"
      :refresh-method="refreshMethod"
      :config="config"
      :show-tag-columns="showTagColumns"
      :show-tag-columns2="showTagColumns2"
      :show-tag-columns3="showTagColumns3"
      :get-grid="getGrid"
      :total="total"
      :selected="selected"
      :selectedItems="selectedItems"
      :api-version="apiVersion"
      :update-config="updateConfig"
      :fetch-distinct-field="fetchDistinctField"
      :before-show-menu-loaded="beforeShowMenuLoaded"
      :extTagParams="extTagParams"
      :extTagParams2="extTagParams2"
      :extTagParams3="extTagParams3"
      :show-ext-tags="showExtTags"
      :show-tag-config="showTagConfigCheck"
      :tag-config-params="tagConfigParams"
      :treeToggleOpen="treeToggleOpen"
      :show-no-value="showNoValue"
      :show-no-value2="showNoValue2"
      :show-no-value3="showNoValue3"
      :tagFilterKeys="tagFilterKeys"
      :tagFilterKeys2="tagFilterKeys2"
      :tagFilterKeys3="tagFilterKeys3"
      :tagFilterResource="tagFilterResource"
      :tagFilterResource2="tagFilterResource2"
      :tagFilterResource3="tagFilterResource3"
      :ignoreWithUserMetaParam="ignoreWithUserMetaParam"
      :ignoreWithUserMetaParam2="ignoreWithUserMetaParam2"
      :ignoreWithUserMetaParam3="ignoreWithUserMetaParam3"
      :tagBtnText="tagBtnText"
      @refresh="refresh"
      @clear-selected="clearSelected"
      @tag-filter-change="tagFilterChange"
      @tag-filter-change2="tagFilterChange2"
      @tag-filter-change3="tagFilterChange3"
      @filter-change="filterChange"
      @treeToggleClick="treeToggleClick">
      <slot name="group-actions-prepend" slot="group-actions-prepend" />
      <slot name="group-actions-append" slot="group-actions-append" />
      <slot name="right-tools-prepend" slot="right-tools-prepend" />
    </page-list-header>
    <!-- header和table中间内容插槽 -->
    <slot name="table-prepend" />
    <!-- 列表待config加载完成后呈现 -->
    <template v-if="configLoaded">
      <component
        :is="tableName"
        :fixed="fixed"
        ref="table"
        :id="id"
        :id-key="idKey"
        :list="list"
        :data="finalData"
        :columns="columns"
        :loading="loading"
        :group-actions="groupActions"
        :single-actions="singleActions"
        :hide-rowselect="hideRowselect"
        :show-single-actions="showSingleActions"
        :get-limit="getLimit"
        :limit="limit"
        :offset="offset"
        :total="total"
        :pager-layout="pagerLayout"
        :expand-config="expandConfig"
        :config="config"
        :resource="resource"
        :next-marker="nextMarker"
        :pager-type="pagerType"
        :selection-type="selectionType"
        :inBaseSidePage="inBaseSidePage"
        :isSidepageOpen="isSidepageOpen"
        :noDataText="noDataText"
        :show-page="showPage"
        :span-method="spanMethod"
        :before-show-menu-loaded="beforeShowMenuLoaded"
        :tree-toggle-open="treeToggleOpen"
        :show-tag-config="showTagConfigCheck"
        :tag-config-params="tagConfigParams"
        :update-config="updateConfig"
        :edit-config="editConfig"
        :tableOverviewIndexs="tableOverviewIndexs"
        :enableVirtualScroll="enableVirtualScroll"
        @change-current-page="changeCurrentPage"
        @change-page-size="changePageSize"
        @do-sort="doSort"
        @change-selected="changeSelected"
        @clear-selected="clearSelected"
        @change-load-more-size="changeLoadMoreSize"
        @change-next-marker="changeNextMarker"
        @radio-change="radioChange"
        @project-tag-filter-change="projectTagFilterChange"
        @edit-closed="editClosed" />
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
import PageListTable_fixed from './components/Table_fixed'

export default {
  name: 'PageList',
  components: {
    PageListHeader,
    PageListTable,
    PageListTable_fixed,
  },
  props: {
    // 生成的list实例store
    list: {
      type: Object,
      required: true,
    },
    // 是否展示刷新按钮
    showSync: {
      type: Boolean,
      default: true,
    },
    // 是否存在固定列
    fixed: {
      type: Boolean,
      default: false,
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
    tagManagerInstance2: Object,
    tagManagerInstance3: Object,
    // 开启标签过滤
    showTagFilter: Boolean,
    showTagFilter2: Boolean,
    showTagFilter3: Boolean,
    // 开启标签列
    showTagColumns: Boolean,
    showTagColumns2: Boolean,
    showTagColumns3: Boolean,
    // 是否显示搜索框
    showSearchbox: {
      type: Boolean,
      default: true,
    },
    // 不选择搜索类型情况下，默认搜索key
    defaultSearchKey: [String, Function],
    placeholder: String,
    // 列配置
    columns: {
      type: Array,
      required: true,
    },
    // 是否隐藏列选择
    hideRowselect: {
      type: Boolean,
      default: false,
    },
    // 导出数据配置
    exportDataOptions: Object,
    extraExportParams: {
      type: [Object, Function],
      default: () => ({}),
    },
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
    extTagParams: {
      type: Object,
      default () {
        return {}
      },
    },
    extTagParams2: {
      type: Object,
      default () {
        return {}
      },
    },
    extTagParams3: {
      type: Object,
      default () {
        return {}
      },
    },
    showExtTags: {
      type: Boolean,
      default: false,
    },
    showExtTags2: {
      type: Boolean,
      default: false,
    },
    // 是否展示标签分级
    showTagConfig: {
      type: Boolean,
      default: false,
    },
    tagConfigParams: {
      type: Object,
    },
    editConfig: Object,
    tableOverviewIndexs: {
      type: Array,
    },
    showNoValue: {
      type: Boolean,
      default: true,
    },
    showNoValue2: {
      type: Boolean,
      default: true,
    },
    showNoValue3: {
      type: Boolean,
      default: true,
    },
    tagFilterKeys: {
      type: Array,
      default: () => ['with_user_meta', 'without_user_meta'],
    },
    tagFilterKeys2: {
      type: Array,
      default: () => ['with_user_meta', 'without_user_meta'],
    },
    tagFilterKeys3: {
      type: Array,
      default: () => ['with_user_meta', 'without_user_meta'],
    },
    enableVirtualScroll: {
      type: Boolean,
      default: false,
    },
    tagFilterResource: String,
    tagFilterResource2: String,
    tagFilterResource3: String,
    ignoreWithUserMetaParam: Boolean,
    ignoreWithUserMetaParam2: Boolean,
    ignoreWithUserMetaParam3: Boolean,
    tagBtnText: String,
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
      treeToggleOpen: false,
    }
  },
  computed: {
    id () {
      return this.list.id
    },
    tableName () {
      return this.fixed ? 'PageListTable' : 'PageListTable'
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
    tagFilter2 () {
      return this.list.tagFilter2
    },
    tagFilter3 () {
      return this.list.tagFilter3
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
      return this.list.total || Object.keys(this.data)?.length
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
    selectedItems () {
      return this.list.selectedItems
    },
    nextMarker () {
      return this.list.nextMarker
    },
    pagerType () {
      return this.list.pagerType
    },
    showTagConfigCheck () {
      return this.showTagConfig && this.projectTags.enableOrganization
    },
    ...mapGetters(['isSidepageOpen', 'projectTags']),
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
    tagFilterChange2 (tagFilter) {
      this.list.changeTagFilter2(tagFilter)
    },
    tagFilterChange3 (tagFilter) {
      this.list.changeTagFilter3(tagFilter)
    },
    filterChange (filter) {
      this.list.changeFilter(filter)
      this.$emit('filterChange', filter)
    },
    projectTagFilterChange (projectTagFilter) {
      this.list.changeProjectTagFilter(projectTagFilter)
    },
    editClosed () {
      this.$emit('edit-closed')
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
    doSort (property, order, column) {
      this.list.doSort(property, order, column)
    },
    changeSelected (selection) {
      this.list.changeSelected(selection)
      this.$emit('change-selected', selection)
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
    changeLoadMoreSize (val) {
      this.list.changeLoadMoreSize(val)
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
    treeToggleClick () {
      if (this.treeToggleOpen) {
        this.$refs.table.$refs.projectTag.handleSelectNone()
      }
      this.treeToggleOpen = !this.treeToggleOpen
    },
  },
}
</script>
