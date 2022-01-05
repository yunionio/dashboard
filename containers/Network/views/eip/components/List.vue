<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :defaultSearchKey="defaultSearchKey"
    :showGroupActions="showGroupActions" />
</template>

<script>
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getNameFilter, getStatusFilter, getBrandFilter, getAccountFilter, getTenantFilter, getDomainFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import regexp from '@/utils/regexp'

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
      default: () => ([]),
    },
  },
  data () {
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
              label: this.$t('table.action.set_tag'),
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
        id: this.id,
        resource: 'eips',
        getParams: this.getParam,
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
          cloudaccount: getAccountFilter(),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          region: {
            label: this.$t('common_282'),
          },
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
        },
        steadyStatus: Object.values(expectStatus.eip).flat(),
        responseData: this.responseData,
        hiddenColumns: this.hiddenColumns, // ['metadata', 'account'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_191'), key: 'ip_addr' },
          { label: this.$t('network.text_195'), key: 'bandwidth' },
          { label: this.$t('network.text_196'), key: 'account', hidden: this.$store.getters.isProjectMode },
          { label: this.$t('network.text_27'), key: 'status' },
          { label: this.$t('network.text_192'), key: 'charge_type' },
          { label: this.$t('network.text_197'), key: 'associate_name' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('network.text_198'), key: 'provider' },
          { label: this.$t('network.text_199'), key: 'region' },
          { label: this.$t('common_715'), key: 'user_tags' },
        ],
      },
      groupActions: groupActions,
    }
  },
  computed: {
    ...mapGetters(['isProjectMode']),
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
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.initSidePageTab('eip-detail')
      this.sidePageTriggerHandle(this, 'EipSidePage', {
        id: row.id,
        resource: 'eips',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.eip).flat(),
      }, {
        list: this.list,
        hiddenColumns: this.hiddenColumns,
        tab: 'eip-detail',
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
