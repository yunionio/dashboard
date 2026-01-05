<template>
  <page-list
    show-tag-columns
    show-tag-columns2
    show-tag-filter
    show-tag-config
    :list="list"
    :columns="templateListColumns || columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showSingleActions="isTemplate ? false : showActions"
    :showGroupActions="showActions && showGroupActions"
    :export-data-options="exportDataOptions"
    :tag-config-params="tagConfigParams"
    :show-page="!isTemplate" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { ACL_TYPE } from '@Storage/constants/index.js'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import { getNameFilter, getTenantFilter, getBrandFilter, getStatusFilter, getAccountFilter, getDomainFilter, getCloudProviderFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import { getSetPublicAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'BucketStorageList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
  props: {
    id: String,
    cloudEnv: String,
    cloudEnvOptions: {
      type: Array,
    },
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'buckets',
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.bucket).flat(),
        filterOptions: {
          external_id: {
            label: this.$t('table.title.external_id'),
          },
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          brand: getBrandFilter('object_storage_brands'),
          projects: getTenantFilter(),
          status: getStatusFilter({ statusModule: 'bucket' }),
          cloudaccount: getAccountFilter(),
          manager: getCloudProviderFilter(),
          // region: {
          //   label: '区域',
          // },
          storage_class: {
            label: this.$t('storage.text_38'),
          },
          acl: {
            label: this.$t('storage.text_93'),
            dropdown: true,
            items: Object.keys(ACL_TYPE).map(k => {
              return { label: ACL_TYPE[k], key: k }
            }),
          },
          region: {
            label: this.$t('dictionary.region'),
          },
          project_domains: getDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['storage_class', 'account', 'public_scope'],
        autoHiddenFilterKey: 'oss_hidden_columns',
        fetchDataCb: (res) => {
          const { totals = {} } = res.data
          this.$emit('resStatisticsChange', totals)
        },
      }),
      groupActions: [
        {
          label: this.$t('storage.text_31'),
          permission: 'buckets_create',
          action: () => {
            // this.createDialog('BucketCreateDialog', {
            //   title: this.$t('storage.text_95'),
            //   onManager: this.onManager,
            //   refresh: this.refresh,
            // })
            this.$router.push({
              path: '/bucket/create',
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
        },
        {
          label: this.$t('storage.text_33'),
          actions: () => {
            return [
              getSetPublicAction(this, {
                name: this.$t('dictionary.bucket'),
                scope: 'project',
                resource: 'buckets',
              }, {
                permission: 'buckets_perform_public',
              }),
              {
                label: this.$t('storage.text_96', [this.$t('dictionary.project')]),
                permission: 'buckets_perform_change_owner',
                action: row => {
                  this.createDialog('ChangeOwenrDialog', {
                    name: this.$t('storage.text_18'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    resource: 'buckets',
                  })
                },
                meta: row => {
                  if (this.list.selectedItems.some(item => item.is_public)) {
                    return {
                      validate: false,
                      tooltip: this.$t('common_614'),
                    }
                  }
                  const ret = {
                    validate: false,
                    tooltip: '',
                  }
                  if (this.isProjectMode) {
                    ret.tooltip = this.$t('common_601')
                    return ret
                  }
                  const domainIds = this.list.selectedItems.map(item => item.domain_id)
                  const validate = R.uniq(domainIds).length === 1
                  return {
                    validate,
                    tooltip: !validate && this.$t('storage.text_97', [this.$t('dictionary.domain')]),
                  }
                },
              },
              {
                label: this.$t('storage.text_99'),
                permission: 'buckets_perform_limit',
                action: row => {
                  this.createDialog('BucketUpdateBucketLimitDialog', {
                    title: this.$t('storage.text_99'),
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
              },
              {
                label: this.$t('storage.text_100'),
                permission: 'buckets_perform_syncstatus',
                action: () => {
                  this.onManager('batchPerformAction', {
                    id: this.list.selectedItems.map(item => item.id),
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
              },
              {
                label: this.$t('table.action.set_tag'),
                permission: 'buckets_perform_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'bucket',
                    },
                    tipName: this.$t('storage.text_18'),
                  })
                },
              },
              {
                label: this.$t('storage.text_36'),
                permission: 'buckets_delete',
                action: obj => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('storage.text_36'),
                    name: this.$t('storage.text_18'),
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = { validate: true, tooltip: '' }
                  for (const item of this.list.selectedItems) {
                    if (this.isInternal(item.location)) {
                      ret.tooltip = this.$t('storage.internal_bucket')
                      ret.validate = false
                      break
                    }
                  }
                  if (!ret.validate) return ret
                  return this.$getDeleteResult(this.list.selectedItems)
                },
              },
            ]
          },
          meta: row => {
            return {
              validate: !!this.list.selectedItems.length,
            }
          },
        },
      ],
      tagConfigParams: {
        resource: 'buckets',
        queryTreeId: 'project-tag-value-tree',
      },
    }
  },
  computed: {
    ...mapGetters(['isProjectMode']),
    showActions () {
      return !this.$isScopedPolicyMenuHidden('oss_hidden_columns.perform_action')
    },
    exportDataOptions () {
      return {
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
        downloadType: 'local',
        title: this.$t('storage.text_18'),
      }
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
    this.list.fetchData()
    this.initSidePageTab('objects')
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'BucketStorageSidePage', {
        id: row.id,
        resource: 'buckets',
        getParams: this.getParams,
      }, {
        list: this.list,
        cancel: () => {
          this.list.singleRefresh(row.id, Object.values(expectStatus.bucket).flat())
        },
        tab,
      })
    },
  },
}
</script>
