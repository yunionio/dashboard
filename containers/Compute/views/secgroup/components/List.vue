<template>
  <page-list
    show-tag-columns
    show-tag-filter
    ref="pageList"
    :list="list"
    :columns="templateListColumns || columns"
    :group-actions="groupActions"
    :single-actions="customSingleActions || singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :defaultSearchKey="defaultSearchKey"
    :showGroupActions="showGroupActions"
    :show-single-actions="!isTemplate"
    :show-page="!isTemplate" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import { getNameFilter, getTenantFilter, getDomainFilter, getRegionFilter, getBrandFilter, getAccountFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import globalSearchMixins from '@/mixins/globalSearch'
import { getSetPublicAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import regexp from '@/utils/regexp'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { exportDataOptions } from '../utils'

export default {
  name: 'SecgroupList',
  mixins: [WindowsMixin, ListMixin, globalSearchMixins, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
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
    customGroupActions: {
      type: Array,
    },
    customSingleActions: {
      type: Array,
    },
    frontGroupMethods: {
      type: String,
      validator (value) {
        return ['coverage', 'append'].includes(value)
      },
    },
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'secgroups',
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: Object.values(expectStatus.secgroup).flat(),
        filterOptions: {
          name: getNameFilter(),
          id: {
            label: 'ID',
          },
          description: getDescriptionFilter(),
          ip: {
            label: this.$t('compute.text_985'),
          },
          ports: {
            label: this.$t('compute.text_349'),
          },
          region: getRegionFilter(),
          cloudaccount: getAccountFilter(),
          brand: getBrandFilter('brands', ['VMware', 'OneCloud']),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      exportDataOptions,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'isProjectMode']),
    groupActions () {
      const _frontGroupActions = this.frontGroupActions ? this.frontGroupActions.bind(this)() || [] : []
      const createAction = {
        index: 0,
        label: this.$t('compute.perform_create'),
        permission: 'secgroups_create',
        action: () => {
          // this.createDialog('CreateSecgroupDialog', {
          //   title: this.$t('compute.perform_create'),
          //   onManager: this.onManager,
          //   refresh: this.refresh,
          // })
          this.$router.push({
            name: 'SecgroupCreate',
            query: {
              type: this.cloudEnv,
            },
          })
        },
        meta: () => {
          return {
            buttonType: 'primary',
            validate: !this.cloudEnvEmpty,
            tooltip: this.cloudEnvEmpty ? this.$t('common.no_platform_available') : '',
          }
        },
        hidden: () => this.hiddenActions.includes('create'),
      }
      const defaultActions = [
        // {
        //   index: 2,
        //   label: this.$t('compute.text_991'),
        //   permission: 'secgroups_perform_add_rules',
        //   action: () => {
        //     this.createDialog('AddRulesDialog', {
        //       data: this.list.selectedItems,
        //       columns: this.columns,
        //       title: this.$t('compute.text_991'),
        //       onManager: this.onManager,
        //       refresh: this.refresh,
        //     })
        //   },
        //   meta: () => {
        //     if (this.list.selectedItems.length > 0) {
        //       if (!this.list.selectedItems.every(item => item.cloud_env === 'onpremise')) {
        //         return {
        //           validate: false,
        //           tooltip: this.$t('compute.idc_secgroup_support_add_rules'),
        //         }
        //       }
        //       if (this.isAdminMode) {
        //         return {
        //           validate: true,
        //         }
        //       } else {
        //         return this.$isOwner(this.list.selectedItems)
        //       }
        //     }
        //     return {
        //       validate: false,
        //       tooltip: this.$t('compute.text_992'),
        //     }
        //   },
        // },
        getSetPublicAction(this, {
          name: this.$t('dictionary.secgroup'),
          scope: 'project',
          resource: 'secgroups',
        }, {
          permission: 'secgroups_perform_public',
          meta: () => {
            return {
              validate: this.list.selectedItems.length,
            }
          },
        }),
        {
          label: this.$t('table.action.set_tag'),
          permission: 'secgroups_perform_set_user_metadata',
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
          label: this.$t('compute.perform_delete'),
          permission: 'secgroups_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              alert: this.$t('compute.text_1395'),
              columns: this.columns,
              title: this.$t('compute.perform_delete'),
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
      if (this.frontGroupMethods === 'coverage') return _frontGroupActions
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
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
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
      if (ret.project_id) {
        ret.project_ids = [ret.project_id]
        delete ret.project_id
      }
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'SecGroupSidePage', {
        id: row.id,
        resource: 'secgroups',
        getParams: this.getParam,
      }, {
        list: this.list,
        hiddenSidepageTabs: this.hiddenSidepageTabs,
        hiddenColumns: this.hiddenColumns,
        hiddenActions: this.hiddenActions,
        tab,
        row,
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
    // openEditRulesDialog (rule, row) {
    //   if (this.isProjectMode && this.userInfo.projectId !== row.tenant_id) {
    //     return
    //   }
    //   if (this.isDomainMode && this.userInfo.domain.id !== row.domain_id) {
    //     return
    //   }
    //   this.createDialog('EditRulesDialog', {
    //     data: [rule],
    //     title: 'edit',
    //     columns: this.columns,
    //     refresh: () => {
    //       this.list.refresh()
    //     },
    //   })
    // },
    openAssociateVirtualMachineDialog (obj) {
      this.createDialog('AssociateVirtualMachineDialog', {
        data: [obj],
        refresh: () => {
          this.list.refresh()
        },
      })
    },
    defaultSearchKey (search) {
      if (regexp.isPrefixStr(search)) {
        return 'ip'
      }
      if (regexp.isNumber(search)) {
        return 'ports'
      }
    },
  },
}
</script>
