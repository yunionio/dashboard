<template>
  <page-toolbar>
    <div class="mb-2 d-flex" v-if="showGroupActions && beforeShowMenuLoaded">
      <div class="d-flex flex-fill">
        <!-- 刷新 -->
        <a-button
          v-if="showSync"
          class="flex-shrink-0"
          :disabled="loading"
          @click="handleRefresh">
          <icon v-if="loading" type="refresh" spin />
          <icon v-else type="refresh" />
        </a-button>
        <!-- 批量前面追加内容 slot -->
        <slot name="group-actions-prepend" />
        <!-- 批量操作 -->
        <template v-if="showGroupActions && groupActions">
          <actions
            group
            class="flex-shrink-0"
            :options="groupActions"
            :rows="selectedItems"
            button-type="default"
            :show-sync="showSync"
            @clear-selected="() => $emit('clear-selected')" />
        </template>
        <!-- 批量后面追加内容 slot -->
        <slot name="group-actions-append" />
        <!-- 标签过滤器 -->
        <template v-if="showTagFilter">
          <tag-filter
            :resource="tagFilterResource || resource"
            :tag-manager-instance="tagManagerInstance"
            :ignoreWithUserMetaParam="ignoreWithUserMetaParam"
            :tag-filter="tagFilter"
            :extTagParams="extTagParams"
            :show-ext-tags="showExtTags"
            :show-no-value="showNoValue"
            :with-tag-key="tagFilterKeys[0]"
            :without-tag-key="tagFilterKeys[1]"
            :button-text="tagBtnText || $t('common.text00012')"
            :flexFill="!showTagFilter2"
            @tag-filter-change="(tagFilter) => $emit('tag-filter-change', tagFilter)" />
        </template>
        <!-- 资源标签过滤器 -->
        <template v-if="!$isScopedPolicyMenuHidden('fee_hidden_items.instance_tag') && showTagFilter3">
          <tag-filter
            :resource="tagFilterResource3 || resource"
            :tag-manager-instance="tagManagerInstance3"
            :ignoreWithUserMetaParam="ignoreWithUserMetaParam3"
            :tag-filter="tagFilter3"
            :extTagParams="extTagParams3"
            :show-ext-tags="showExtTags3"
            :show-no-value="showNoValue3"
            :with-tag-key="tagFilterKeys3[0]"
            :without-tag-key="tagFilterKeys3[1]"
            :button-text="$t('dictionary.instance_tag')"
            :filter-with-user-meta="true"
            :filter-without-user-meta="true"
            :flexFill="!showTagFilter2"
            @tag-filter-change="(tagFilter) => $emit('tag-filter-change3', tagFilter)" />
        </template>
        <!-- 标签过滤器 -->
        <template v-if="showTagFilter2">
          <tag-filter
            :resource="tagFilterResource2 || resource"
            :tag-manager-instance="tagManagerInstance2"
            :ignoreWithUserMetaParam="ignoreWithUserMetaParam2"
            :tag-filter="tagFilter2"
            :extTagParams="extTagParams2"
            :show-ext-tags="showExtTags2"
            :show-no-value="showNoValue2"
            :with-tag-key="tagFilterKeys2[0]"
            :without-tag-key="tagFilterKeys2[1]"
            :button-text="$t('dictionary.project_tag')"
            :filter-with-user-meta="true"
            :filter-without-user-meta="true"
            @tag-filter-change="(tagFilter) => $emit('tag-filter-change2', tagFilter)" />
        </template>
      </div>
      <div class="ml-4 d-flex flex-shrink-0 justify-content-end">
        <slot name="right-tools-prepend" />
        <template v-if="exportDataOptions || id">
          <a-tooltip :title="$t('common.text00010')" v-if="exportDataOptions">
            <a-button @click="handleExportData">
              <icon type="download" />
            </a-button>
          </a-tooltip>
          <a-tooltip :title="$t('common.text00011')" v-if="id">
            <a-button class="ml-2" @click="handleCustomList">
              <icon type="setting" />
            </a-button>
          </a-tooltip>
        </template>
      </div>
    </div>
    <!-- 搜索框 -->
    <template v-if="showSearchbox && _filterOptions">
      <div class="d-flex">
        <!-- 层级选择开关 -->
        <a-tooltip :title="treeToggleOpen ? $t('common.toggle_project_close') : $t('common.toggle_project_open')">
          <a-button class="mr-2" style="height: 30px" v-if="showTagConfig" @click="toggleTreeSelect">
            <a-icon type="apartment" />
          </a-button>
        </a-tooltip>
        <div class="flex-fill">
          <search-box
            :options="_filterOptions"
            :value="filter"
            :default-search-key="defaultSearchKey"
            :placeholder="placeholder"
            :fetch-distinct-field="fetchDistinctField"
            @input="handleSearchInput" />
        </div>
      </div>
    </template>
  </page-toolbar>
</template>

<script>
import * as R from 'ramda'
import WindowsMixin from '@/mixins/windows'
import Actions from '../Actions'
import TagFilter from '../TagFilter'

export default {
  name: 'PageListHeader',
  components: {
    Actions,
    TagFilter,
  },
  mixins: [WindowsMixin],
  props: {
    id: String,
    // 是否加载中
    loading: Boolean,
    // 是否显示刷新按钮
    showSync: {
      type: Boolean,
      default: true,
    },
    // 是否显示批量操作区域
    showGroupActions: {
      type: Boolean,
      default: true,
    },
    // 操作按钮配置
    groupActions: Array,
    // 提供给标签过滤器自定义获取标签数据的Manager实例
    tagManagerInstance: Object,
    tagManagerInstance2: Object,
    tagManagerInstance3: Object,
    // 开启标签过滤
    showTagFilter: Boolean,
    showTagFilter2: Boolean,
    showTagFilter3: Boolean,
    tagFilter: Object,
    tagFilter2: Object,
    tagFilter3: Object,
    // create list传递的resource
    resource: [String, Object, Function],
    showSearchbox: Boolean,
    filterOptions: Object,
    filter: Object,
    defaultSearchKey: [String, Function],
    placeholder: String,
    onManager: Function,
    params: Object,
    // 导出数据配置
    exportDataOptions: Object,
    extraExportParams: [Object, Function],
    refreshMethod: Function,
    config: Object,
    // 开启标签列
    showTagColumns: Boolean,
    showTagColumns2: Boolean,
    showTagColumns3: Boolean,
    getGrid: {
      type: Function,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    selected: {
      type: Array,
      required: true,
    },
    selectedItems: {
      type: Array,
      required: true,
    },
    apiVersion: {
      type: String,
      default: 'v1',
    },
    updateConfig: {
      type: Function,
      required: true,
    },
    fetchDistinctField: {
      type: Function,
      required: true,
    },
    beforeShowMenuLoaded: {
      type: Boolean,
    },
    extTagParams: {
      type: Object,
      default () {
        return {}
      },
    },
    showExtTags: {
      type: Boolean,
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
    showExtTags2: {
      type: Boolean,
    },
    showExtTags3: {
      type: Boolean,
    },
    showTagConfig: Boolean,
    tagConfigParams: Object,
    treeToggleOpen: Boolean,
    showNoValue: Boolean,
    showNoValue2: Boolean,
    showNoValue3: Boolean,
    tagFilterKeys: Array,
    tagFilterKeys2: Array,
    tagFilterKeys3: Array,
    tagFilterResource: String,
    tagFilterResource2: String,
    tagFilterResource3: String,
    ignoreWithUserMetaParam: Boolean,
    ignoreWithUserMetaParam2: Boolean,
    ignoreWithUserMetaParam3: Boolean,
    tagBtnText: String,
  },
  computed: {
    _filterOptions () {
      if (!this.filterOptions || R.isEmpty(this.filterOptions)) return null
      const filterOptions = R.filter(item => {
        if (R.is(Function, item.hidden)) {
          return !item.hidden()
        }
        return !item.hidden
      }, this.filterOptions)
      const filterSortKeys = ['external_id', 'id', 'search', 'name', 'description', 'brand', 'provider', 'ip', 'ips', 'status', 'enabled', 'sn', 'os_type', 'cidr', 'ports', 'tenant', 'region', 'host', 'billing_type']
      const ret = {}
      filterSortKeys.forEach(k => {
        const _k = k.toLowerCase()
        if (filterOptions[_k]) {
          ret[_k] = filterOptions[_k]
        }
      })
      Object.keys(filterOptions).forEach(k => {
        const _k = k.toLowerCase()
        if (!ret[_k]) {
          ret[_k] = filterOptions[_k] || filterOptions[k]
        }
      })
      return ret
    },
  },
  methods: {
    handleRefresh () {
      if (this.refreshMethod) {
        this.refreshMethod(() => {
          this.$emit('clear-selected')
        })
      } else {
        this.$emit('refresh')
        this.$emit('clear-selected')
      }
    },
    handleSearchInput (filter) {
      this.$emit('clear-selected')
      this.$emit('filter-change', filter)
    },
    async handleExportData () {
      if (R.is(Function, this.exportDataOptions.beforeExport)) {
        await this.exportDataOptions.beforeExport()
      }
      this.createDialog('ExportListDataDialog', {
        title: this.exportDataOptions.title || this.$t('common.text00010'),
        config: this.config,
        total: this.total,
        options: this.exportDataOptions,
        extraParams: this.extraExportParams,
        listParams: this.params,
        selected: this.selected,
        apiVersion: this.apiVersion,
        resource: this.resource,
        showTagColumns: this.showTagColumns,
        showTagColumns2: this.showTagColumns2,
        showTagColumns3: this.showTagColumns3,
        callback: this.exportDataOptions.callback,
      })
    },
    handleCustomList () {
      const grid = this.getGrid()
      const cols = grid.getTableColumn().collectColumn || []
      let nameIndex = 0
      const hidenColumns = []
      if (cols.length) {
        const colType = cols[0].type
        nameIndex = colType === 'checkbox' ? 1 : 0
        hidenColumns.push(cols[nameIndex].property)
      }
      this.createDialog('CustomListDialog', {
        title: this.$t('common.text00011'),
        config: this.config,
        update: this.updateConfig,
        showTagColumns: this.showTagColumns,
        showTagColumns2: this.showTagColumns2,
        showTagColumns3: this.showTagColumns3,
        customs: grid.getTableColumn().collectColumn,
        resource: this.resource,
        hidenColumns,
      })
    },
    toggleTreeSelect () {
      this.$emit('treeToggleClick')
    },
  },
}
</script>
