<template>
  <page-list
    show-tag-columns
    show-tag-columns2
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :defaultSearchKey="defaultSearchKey"
    :showSingleActions="showActions"
    :showGroupActions="showActions && showGroupActions" />
</template>

<script>
import { mapGetters } from 'vuex'
import ListMixin from '@/mixins/list'
import {
  getNameFilter,
  getStatusFilter,
  getBrandFilter,
  getAccountFilter,
  getTenantFilter,
  getDomainFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
  getDistinctFieldFilter,
} from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import regexp from '@/utils/regexp'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import { ASSOCIATE_MAP } from '../constants'

export default {
  name: 'EipList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    cloudEnv: String,
    getParams: {
      type: Object,
    },
    cloudEnvOptions: {
      type: Array,
    },
    showCreateAction: {
      type: Boolean,
      default: true,
    },
    hiddenColumns: {
      type: Array,
      default: () => (['created_at']),
    },
  },
  data () {
    const filter = {}
    if (this.$route.query.hasOwnProperty('is_associated')) {
      filter.is_associated = [this.$route.query.is_associated]
    }
    const createAction = {
      label: this.$t('network.text_26'),
      permission: 'eips_create',
      action: () => {
        this.$router.push({
          path: `${this.$route.path}/create`,
          query: {
            type: this.cloudEnv,
          },
        })
      },
      meta: () => ({
        buttonType: 'primary',
        validate: !this.cloudEnvEmpty,
        tooltip: this.cloudEnvEmpty ? this.$t('common.no_platform_available') : '',
      }),
    }
    const groupActions = [
      {
        label: this.$t('network.text_200'),
        actions: () => {
          return [
            {
              label: this.$t('network.text_201'),
              permission: 'eips_perform_syncstatus',
              action: () => {
                this.onManager('batchPerformAction', {
                  steadyStatus: ['running', 'ready'],
                  managerArgs: {
                    action: 'syncstatus',
                  },
                })
              },
            },
            {
              label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
              permission: 'eips_perform_change_owner',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: this.list.selectedItems,
                  columns: this.columns,
                  name: this.$t('dictionary.eip'),
                  onManager: this.onManager,
                  resource: 'eips',
                  refresh: this.refresh,
                })
              },
              meta: () => {
                const ret = {
                  validate: false,
                  tooltip: '',
                }
                if (this.isProjectMode) {
                  ret.tooltip = this.$t('common_601')
                  return ret
                }
                return {
                  validate: true,
                }
              },
            },
            {
              label: this.$t('table.action.set_tag'),
              permission: 'eips_perform_set_user_metadata',
              action: () => {
                this.createDialog('SetTagDialog', {
                  data: this.list.selectedItems,
                  columns: this.columns,
                  onManager: this.onManager,
                  mode: 'add',
                  params: {
                    resources: 'eip',
                  },
                  tipName: this.$t('dictionary.eip'),
                })
              },
            },
            {
              label: this.$t('network.text_131'),
              permission: 'eips_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: this.list.selectedItems,
                  columns: this.columns,
                  title: this.$t('network.text_131'),
                  name: this.$t('dictionary.eip'),
                  onManager: this.onManager,
                })
              },
              meta: () => {
                return {
                  validate: this.list.allowDelete(),
                }
              },
            },
          ]
        },
        meta: () => {
          return {
            validate: this.list.selected.length,
          }
        },
      },
    ]
    if (this.showCreateAction) {
      groupActions.unshift(createAction)
    }
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'eips',
        getParams: this.getParam,
        filter,
        filterOptions: {
          external_id: {
            label: this.$t('table.title.external_id'),
          },
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          brand: getBrandFilter('brands', ['VMware']),
          ip_addr: {
            label: 'IP',
            filter: true,
            formatter: val => {
              return `ip_addr.contains(${val})`
            },
          },
          status: getStatusFilter('eip'),
          is_associated: {
            label: this.$t('network.is_associated'),
            dropdown: true,
            items: [
              { label: this.$t('network.associated'), key: 'true' },
              { label: this.$t('network.un_associated'), key: 'false' },
            ],
          },
          cloudaccount: getAccountFilter(),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          region: {
            label: this.$t('common_282'),
          },
          associate_type: getDistinctFieldFilter({
            label: this.$t('network.associate_resource_type'),
            field: 'associate_type',
            mapper: (list) => {
              return list.filter(item => item.key).map(item => {
                return {
                  key: item.key,
                  label: ASSOCIATE_MAP[item.key]?.name || item.label,
                }
              })
            },
          }),
          associate_name: { label: this.$t('network.associate_resource_name') },
          associate_id: { label: this.$t('network.associate_resource_id') },
          charge_type: {
            label: this.$t('network.text_192'),
            dropdown: true,
            multiple: false,
            // distinctField: {
            //   type: 'extra_field',
            //   key: 'charge_type',
            // },
            items: [
              { label: this.$t('network.text_193'), key: 'traffic' },
              { label: this.$t('network.text_194'), key: 'bandwidth' },
            ],
          },
          mode: {
            label: this.$t('network.text_249'),
            dropdown: true,
            multiple: false,
            items: [
              { label: this.$t('network.text_221'), key: 'elastic_ip' },
              { label: this.$t('network.public_ip'), key: 'public_ip' },
            ],
          },
          created_at: getCreatedAtFilter(),
        },
        autoHiddenFilterKey: 'eip_hidden_columns',
        steadyStatus: Object.values(expectStatus.eip).flat(),
        responseData: this.responseData,
        hiddenColumns: this.hiddenColumns, // ['metadata', 'account'],
      }),
      groupActions: groupActions,
    }
  },
  computed: {
    ...mapGetters(['isProjectMode']),
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('network.text_221'),
        items: [
          { field: 'id', title: 'ID' },
          { field: 'external_id', title: this.$t('table.title.external_id') },
          ...this.columns,
        ],
      }
    },
    showActions () {
      return !this.$isScopedPolicyMenuHidden('eip_hidden_columns.perform_action')
    },
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('eip-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
        show_emulated: true,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.initSidePageTab('eip-detail')
      this.sidePageTriggerHandle(this, 'EipSidePage', {
        id: row.id,
        resource: 'eips',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.eip).flat(),
      }, {
        list: this.list,
        hiddenColumns: this.hiddenColumns,
        tab,
      })
    },
    defaultSearchKey (search) {
      if (regexp.isIPv4(search)) {
        return 'ip_addr'
      }
    },
  },
}
</script>
