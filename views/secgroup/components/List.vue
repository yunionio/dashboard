<template>
  <page-list
    show-tag-columns
    show-tag-filter
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
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getTenantFilter, getDomainFilter } from '@/utils/common/tableFilter'
import globalSearchMixins from '@/mixins/globalSearch'
import { getSetPublicAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'SecgroupList',
  mixins: [WindowsMixin, ListMixin, globalSearchMixins, ColumnsMixin, SingleActionsMixin],
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
    showCreateAction: {
      type: Boolean,
      default: true,
    },
    hiddenSidepageTabs: {
      type: Array,
      default: () => ([]),
    },
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
    hiddenColumns: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'secgroups',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.secgroup).flat(),
        filterOptions: {
          name: getNameFilter(),
          ip: {
            label: this.$t('compute.text_985'),
          },
          ports: {
            label: this.$t('compute.text_349'),
          },
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        title: this.$t('compute.text_986'),
        resource: 'secgrouprules',
        items: [
          { label: this.$t('compute.text_987'), key: 'id' },
          { label: this.$t('compute.text_988'), key: 'secgroup' },
          { label: this.$t('compute.text_989'), key: 'secgroup_id' },
          { label: this.$t('compute.text_990'), key: 'direction' },
          { label: this.$t('compute.text_694'), key: 'action' },
          { label: this.$t('compute.text_980'), key: 'protocol' },
          { label: this.$t('compute.text_349'), key: 'ports' },
          { label: this.$t('compute.text_981'), key: 'priority' },
          { label: 'CIDR', key: 'cidr' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('compute.text_271'), key: 'user_tags' },
        ],
        transformParams (params) {
          if (params.filter) {
            params.filter = params.filter.map((item) => {
              if (item.includes('name.contains(')) {
                const val = /\((.+?)\)/.exec(item)[1]
                params.secgroup_name = val
                return ''
              }
              return item
            })
            if (params.filter.length === 1) {
              delete params.filter
            }
          }
          return params
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'isProjectMode']),
    groupActions () {
      const _frontGroupActions = this.frontGroupActions ? this.frontGroupActions.bind(this)() || [] : []
      const createAction = {
        index: 0,
        label: this.$t('compute.text_18'),
        permission: 'secgroups_create',
        action: () => {
          this.createDialog('CreateSecgroupDialog', {
            title: this.$t('compute.text_18'),
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: () => ({
          buttonType: 'primary',
        }),
      }
      const defaultActions = [
        {
          index: 2,
          label: this.$t('compute.text_991'),
          permission: 'secgroups_performAction',
          action: () => {
            this.createDialog('AddRulesDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_991'),
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
                return this.$isOwner(this.list.selectedItems)
              }
            }
            return {
              validate: false,
              tooltip: this.$t('compute.text_992'),
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
          label: this.$t('table.action.set_tag'),
          action: () => {
            this.createDialog('SetTagDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              mode: 'add',
              params: {
                resources: 'secgroup',
              },
              tipName: this.$t('dictionary.secgroup'),
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length,
            }
          },
        },
        {
          index: 3,
          label: this.$t('compute.text_261'),
          permission: 'secgroups_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_261'),
              name: this.$t('dictionary.secgroup'),
              onManager: this.onManager,
            })
          },
          meta: (obj) => this.$getDeleteResult(this.list.selectedItems),
        },
      ]
      if (this.showCreateAction) {
        defaultActions.unshift(createAction)
      }
      return _frontGroupActions.concat(defaultActions).sort((a, b) => a.index - b.index)
    },
  },
  watch: {
    'list.loading': {
      handler (val) {
        if (this.$refs && this.$refs.pageList && this.$refs.pageList.$refs && this.$refs.pageList.$refs.table && this.$refs.pageList.$refs.table.$refs) {
          const grid = this.$refs.pageList.$refs.table.$refs.grid
          if (this.list.filter.ip || this.list.filter.ports) {
            this.$nextTick(() => {
              grid.setAllRowExpand(true)
            })
          } else {
            grid.clearRowExpand()
          }
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
        hiddenSidepageTabs: this.hiddenSidepageTabs,
        hiddenColumns: this.hiddenColumns,
        hiddenActions: this.hiddenActions,
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
    openEditRulesDialog (rule, row) {
      if (this.isProjectMode && this.userInfo.projectId !== row.tenant_id) {
        return
      }
      if (this.isDomainMode && this.userInfo.domain.id !== row.domain_id) {
        return
      }
      this.createDialog('EditRulesDialog', {
        data: [rule],
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
