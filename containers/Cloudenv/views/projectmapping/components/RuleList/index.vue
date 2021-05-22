<template>
    <div>
      <div class="d-flex flex-fill mb-2">
        <actions
          :group="true"
          class="flex-shrink-0"
          :options="groupActions"
          button-type="default"
          @clear-selected="() => $emit('clear-selected')" />
          <div style="margin-left:auto" />
          <!-- <div class="ml-4 d-flex flex-shrink-0 justify-content-end">
            <template>
              <a-tooltip :title="$t('common.text00011')">
                <a-button class="ml-2" icon="setting" style="width: 40px;" @click="handleCustomList" />
              </a-tooltip>
            </template>
          </div> -->
      </div>
      <vxe-grid
        v-bind="gridOptions"
        :columns="columns"
        row-key
        show-header-overflow
        highlight-hover-row
        highlight-current-row
        class="page-list-grid sortable-tree-demo"
        ref="grid"
        :tree-config="{children: 'children'}"
        @checkbox-change="checkboxChangeEvent"
        @checkbox-all="checkboxChangeEvent" />
    </div>
</template>

<script>
import Sortable from 'sortablejs'
import XEUtils from 'xe-utils'
import { mapGetters } from 'vuex'
import ColumnsMixin from './columns'
import Actions from '@/components/PageList/Actions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'ProjectMappingList',
  components: {
    Actions,
  },
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    id: String,
    data: Object,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      gridOptions: {
        resizable: true,
        showOverflow: false,
        align: 'left',
        toolbarConfig: {
          slots: {
            buttons: 'toolbar_buttons',
          },
        },
        data: [],
      },
      groupNormalActions: [
        {
          label: this.$t('cloudenv.text_104'),
          permission: 'projectmappings_update',
          group: true,
          action: () => {
            this.createDialog('ProjectMappingRuleCreateDialog', {
              id: this.data.id,
              projectDomainId: this.data.domain_id,
              rules: this.data.rules,
              success: (res) => {
                this.$bus.$emit('ProjectMappingRuleUpdate', res)
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('cloudenv.text_108'),
          permission: 'projectmappings_update',
          group: true,
          action: () => {
            this.deleteProjectMappingRules()
          },
          meta: () => {
            const ret = {
              validate: true,
            }
            if (!(this.isAdminMode || this.params.projectDomainId === this.userInfo.projectDomainId)) {
              ret.validate = false
              ret.tooltip = this.$t('cloudenv.text_597')
            }
            if (!this.checkedRecords.length) {
              ret.validate = false
            }
            return ret
          },
        },
        {
          label: this.$t('cloudenv.text_601'),
          permission: 'projectmappings_update',
          group: true,
          action: () => {
            this.canSort = true
            this.gridOptions.data = [...this.initData]
          },
          meta: () => {
            return {
              validate: this.gridOptions.data.length > 1 && !this.canSort && (this.isAdminMode || this.params.projectDomainId === this.userInfo.projectDomainId),
            }
          },
        },
      ],
      groupSaveActions: [
        {
          label: this.$t('cloudenv.text_599'),
          permission: 'projectmappings_update',
          group: true,
          action: () => {
            this.updateProjectMappingRules()
          },
          meta: () => {
            return {
              validate: this.canSort && (this.isAdminMode || this.params.projectDomainId === this.userInfo.projectDomainId),
            }
          },
        },
        {
          label: this.$t('cloudenv.text_600'),
          permission: 'projectmappings_update',
          group: true,
          action: () => {
            this.canSort = false
            this.gridOptions.data = this.initData
          },
          meta: () => {
            return {
              validate: this.canSort && (this.isAdminMode || this.params.projectDomainId === this.userInfo.projectDomainId),
            }
          },
        },
      ],
      canSort: false,
      checkedRecords: [],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    initData () {
      if (this.data.rules) {
        return this.data.rules.map(item => {
          return Object.assign(item, { can_delete: this.data.can_delete })
        })
      }
      return []
    },
    groupActions () {
      if (!this.canSort) {
        return [...this.groupNormalActions]
      } else {
        return [...this.groupNormalActions, ...this.groupSaveActions]
      }
    },
  },
  watch: {
    data: {
      handler: function () {
        this.gridOptions.data = [...this.initData]
      },
      deep: true,
      immediate: true,
    },
  },
  created () {
    this.treeDrop()
  },
  methods: {
    treeDrop () {
      this.$nextTick(() => {
        const xTable = this.$refs.grid
        this.sortable2 = Sortable.create(xTable.$el.querySelector('.body--wrapper>.vxe-table--body tbody'), {
          handle: '.drag-btn',
          onEnd: ({ item, oldIndex }) => {
            const options = { children: 'children' }
            const targetTrElem = item
            const wrapperElem = targetTrElem.parentNode
            console.log('wrapperElem', wrapperElem)
            const prevTrElem = targetTrElem.previousElementSibling
            const tableTreeData = this.gridOptions.data
            const selfRow = xTable.getRowNode(targetTrElem).item
            const selfNode = XEUtils.findTree(tableTreeData, row => row === selfRow, options)
            if (prevTrElem) {
              // 移动到节点
              const prevRow = xTable.getRowNode(prevTrElem).item
              const prevNode = XEUtils.findTree(tableTreeData, row => row === prevRow, options)
              if (XEUtils.findTree(selfRow[options.children], row => prevRow === row, options)) {
                // 错误的移动
                const oldTrElem = wrapperElem.children[oldIndex]
                wrapperElem.insertBefore(targetTrElem, oldTrElem)
                return this.$XModal.message({ content: '不允许自己给自己拖动！', status: 'error' })
              }
              const currRow = selfNode.items.splice(selfNode.index, 1)[0]
              if (xTable.isTreeExpandByRow(prevRow)) {
                // 移动到当前的子节点
                prevRow[options.children].splice(0, 0, currRow)
              } else {
                // 移动到相邻节点
                prevNode.items.splice(prevNode.index + (selfNode.index < prevNode.index ? 0 : 1), 0, currRow)
              }
            } else {
              // 移动到第一行
              const currRow = selfNode.items.splice(selfNode.index, 1)[0]
              tableTreeData.unshift(currRow)
            }
            // 如果变动了树层级，需要刷新数据
            this.gridOptions.data = [...tableTreeData]
          },
        })
      })
    },
    doUpdate (data) {
      return new this.$Manager('project_mappings').update({ id: this.data.id, data })
    },
    async updateProjectMappingRules () {
      try {
        await this.doUpdate({ rules: this.gridOptions.data })
        this.$bus.$emit('ProjectMappingRuleUpdate')
        this.canSort = false
      } catch (error) {
        throw error
      } finally {}
    },
    async deleteProjectMappingRules () {
      const params = []
      this.gridOptions.data.map(item => {
        let isHas = false
        this.checkedRecords.map(item2 => {
          if (item2._XID === item._XID) {
            isHas = true
          }
        })
        if (!isHas) {
          params.push(item)
        }
      })
      await this.doUpdate({ rules: params })
      this.$bus.$emit('ProjectMappingRuleUpdate')
      this.canSort = false
    },
    checkboxChangeEvent ({ records }) {
      this.checkedRecords = records
    },
    handleCustomList () {
      const grid = this.$refs.grid
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
        // config: this.config,
        // update: this.updateConfig,
        // showTagColumns: this.showTagColumns,
        customs: grid.getTableColumn().collectColumn,
        // resource: this.resource,
        hidenColumns,
      })
    },
  },
}
</script>
