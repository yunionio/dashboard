<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getEnabledSwitchActions, getSetPublicAction } from '@/utils/common/tableActions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import {
  ROBOT_TYPES,
} from '../constants'
import {
  getStatusFilter,
  getEnabledFilter,
  getTenantFilter,
  getDomainFilter,
} from '@/utils/common/tableFilter'

export default {
  name: 'RobotList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'robots',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('system.text_101'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('robot'),
          enabled: getEnabledFilter(),
          type: {
            label: this.$t('system.text_48'),
            dropdown: true,
            items: ROBOT_TYPES,
          },
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
        },
        hiddenColumns: ['address'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('system.text_101'), key: 'name' },
          { label: this.$t('table.title.enable_status'), key: 'enabled' },
          { label: this.$t('system.text_48'), key: 'type' },
          { label: this.$t('res.project'), key: 'tenant' },
          { label: this.$t('table.title.share_range'), key: 'public_scope' },
          { label: 'Webhook/URL', key: 'address' },
        ],
      },
      groupActions: [{
        label: this.$t('system.text_128'),
        permission: 'robots_create',
        action: () => {
          this.createDialog('CreateRobotDialog', {
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: () => {
          return {
            buttonType: 'primary',
          }
        },
      }, {
        label: this.$t('system.text_166'),
        actions: () => {
          return [
            getSetPublicAction(this, {
              name: this.$t('system.robot'),
              scope: 'project',
              resource: 'robots',
              apiVersion: 'v1',
            }, {
              permission: 'robots_perform_public',
              meta: (row) => {
                const ret = {
                  validate: true,
                  tooltip: null,
                }
                if (this.list.selectedItems.some(item => !this.isPower(item))) {
                  ret.validate = false
                  ret.tooltip = this.$t('system.robot.shared')
                  return ret
                }
                return ret
              },
            }),
            {
              label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
              permission: 'robots_perform_change_owner',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: this.list.selectedItems,
                  columns: this.columns,
                  onManager: this.onManager,
                  name: this.$t('system.robot'),
                  resource: 'robots',
                  apiVersion: 'v1',
                })
              },
              meta: (row) => {
                const ret = {
                  validate: true,
                  tooltip: null,
                }
                if (this.list.selectedItems.some(item => !this.isPower(item))) {
                  ret.validate = false
                  ret.tooltip = this.$t('system.robot.shared')
                  return ret
                }
                return ret
              },
            },
            ...getEnabledSwitchActions(this, undefined, ['robots_perform_enable', 'robots_perform_disable'], {
              resourceName: this.$t('system.robot'),
              metas: [
                () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  if (this.list.selectedItems.some(item => !this.isPower(item))) {
                    ret.validate = false
                    ret.tooltip = this.$t('system.robot.shared')
                    return ret
                  }
                  return ret
                },
                () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  if (this.list.selectedItems.some(item => !this.isPower(item))) {
                    ret.validate = false
                    ret.tooltip = this.$t('system.robot.shared')
                    return ret
                  }
                  return ret
                },
              ],
            }),
            {
              label: this.$t('system.text_129'),
              permission: 'robots_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: this.list.selectedItems,
                  columns: this.columns,
                  title: this.$t('system.text_129'),
                  name: this.$t('system.robot'),
                  onManager: this.onManager,
                })
              },
              meta: () => {
                const ret = {
                  validate: true,
                  tooltip: null,
                }
                if (this.list.selectedItems.some(item => !this.isPower(item))) {
                  ret.validate = false
                  ret.tooltip = this.$t('system.robot.shared')
                  return ret
                }
                return this.$getDeleteResult(this.list.selectedItems)
              },
            },
          ]
        },
        meta: () => {
          return {
            validate: !!this.list.selectedItems.length,
          }
        },
      }],
    }
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'RobotSidePage', {
        id: row.id,
        resource: 'robots',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
