<template>
  <page-list
    ref="pageList"
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ServerPropsMixin from '../mixins/serverProps'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getTenantFilter } from '@/utils/common/tableFilter'
import globalSearchMixins from '@/mixins/globalSearch'
import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  name: 'SecgroupList',
  mixins: [WindowsMixin, ListMixin, globalSearchMixins, ColumnsMixin, SingleActionsMixin, ServerPropsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
      default: () => ({
        details: true,
      }),
    },
    frontGroupActions: {
      type: Function,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'secgroups',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          ip: {
            label: '来源/目标',
          },
          ports: {
            label: '端口',
          },
          tenant: getTenantFilter(),
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '关联虚拟机', key: 'guest_cnt' },
          { label: '共享范围', key: 'public_scope' },
          { label: '规则预览(策略，来源，协议，端口)', key: 'rules' },
          { label: '状态', key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
    groupActions () {
      const _frontGroupActions = this.frontGroupActions ? this.frontGroupActions.bind(this)() || [] : []
      return _frontGroupActions.concat(
        [
          { index: 0,
            label: '新建',
            permission: 'secgroups_create',
            action: () => {
              this.createDialog('CreateSecgroupDialog', {
                title: '新建',
                onManager: this.onManager,
                refresh: this.refresh,
              })
            },
            meta: () => ({
              buttonType: 'primary',
            }),
          },
          {
            index: 2,
            label: '批量追加规则',
            permission: 'secgroups_performAction',
            action: () => {
              this.createDialog('AddRulesDialog', {
                data: this.list.selectedItems,
                columns: this.columns,
                title: '批量追加规则',
                onManager: this.onManager,
                refresh: this.refresh,
              })
            },
            meta: () => {
              if (this.list.selectedItems.length > 0) {
                if (this.isAdminMode) {
                  return {
                    validate: true,
                  }
                } else {
                  return {
                    validate: this.list.selectedItems.every(val => !val.is_public),
                  }
                }
              }
              return {
                validate: false,
                tooltip: '请选择私有安全组',
              }
            },
          },
          getSetPublicAction(this, {
            name: this.$t('dictionary.secgroup'),
            scope: 'project',
            resource: 'secgroups',
          }, {
            permission: 'secgroups_performAction',
            meta: () => {
              return {
                validate: this.list.selectedItems.length,
              }
            },
          }),
          {
            index: 3,
            label: '删除',
            permission: 'secgroups_delete',
            action: () => {
              this.createDialog('DeleteResDialog', {
                vm: this,
                data: this.list.selectedItems,
                columns: this.columns,
                title: '删除',
                name: this.$t('dictionary.secgroup'),
                onManager: this.onManager,
              })
            },
            meta: (obj) => this.$getDeleteResult(this.list.selectedItems),
          },
        ]
      ).sort((a, b) => a.index - b.index)
    },
  },
  watch: {
    'list.loading': {
      handler (val) {
        if (this.list.filter.ip || this.list.filter.ports) {
          this.$nextTick(() => {
            this.$refs.pageList.$refs.grid.setAllRowExpansion(true)
          })
        } else {
          this.$refs.pageList.$refs.grid.clearRowExpand()
        }
      },
    },
  },
  created () {
    this.initSidePageTab('secgroup-detail')
    this.list.fetchData()
    this.$bus.$on('secgroup-list-refresh', () => {
      this.list.refresh()
    })
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SecGroupSidePage', {
        id: row.id,
        resource: 'secgroups',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
    async loadRules ({ row }) {
      let manager = new this.$Manager('secgrouprules')
      try {
        const response = await manager.list({
          params: {
            secgroup: row.id,
            scope: this.$store.getters.scope,
            limit: 0,
          },
        })
        row.rules = response.data.data || []
        return response
      } catch (error) {
        throw error
      } finally {
        manager = null
      }
    },
    openEditRulesDialog (obj) {
      this.createDialog('EditRulesDialog', {
        data: [obj],
        title: 'edit',
        columns: this.columns,
        refresh: () => {
          this.list.refresh()
        },
      })
    },
    openAssociateVirtualMachineDialog (obj) {
      this.createDialog('AssociateVirtualMachineDialog', {
        data: [obj],
        refresh: () => {
          this.list.refresh()
        },
      })
    },
  },
}
</script>
