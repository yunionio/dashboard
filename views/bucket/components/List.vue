<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { ACL_TYPE } from '@Storage/constants/index.js'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter, getTenantFilter, getBrandFilter, getStatusFilter, getAccountFilter, getDomainFilter } from '@/utils/common/tableFilter'
// import { getSetPublicAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'BucketStorageList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    cloudEnv: String,
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'buckets',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.bucket).flat(),
        filterOptions: {
          name: getNameFilter(),
          brand: getBrandFilter('object_storage_brands'),
          projects: getTenantFilter(),
          status: getStatusFilter({ statusModule: 'bucket' }),
          cloudaccount: getAccountFilter(),
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
            label: '区域',
          },
          project_domains: getDomainFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('storage.text_40'), key: 'name' },
          { label: this.$t('storage.text_41'), key: 'status' },
          { label: this.$t('storage.text_38'), key: 'storage_class' },
          { label: this.$t('storage.text_93'), key: 'acl' },
          { label: this.$t('storage.text_46'), key: 'provider' },
          { label: this.$t('storage.text_94'), key: 'manager' },
          { label: this.$t('storage.text_47'), key: 'region' },
          {
            label: this.$t('storage.text_48'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('buckets'))
            },
          },
          { label: this.$t('dictionary.project'), key: 'tenant' },
        ],
      },
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
            }
          },
        },
        {
          label: this.$t('storage.text_33'),
          actions: () => {
            return [
              // getSetPublicAction(this, {
              //   name: this.$t('dictionary.bucket'),
              //   scope: 'project',
              //   resource: 'buckets',
              // }),
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
                  const ret = {
                    validate: false,
                    tooltip: '',
                  }
                  if (this.isProjectMode) {
                    ret.tooltip = `仅系统或${this.$t('dictionary.domain')}管理员支持该操作`
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
                label: this.$t('storage.text_36'),
                permission: 'buckets_delete',
                action: obj => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('storage.text_36'),
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
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
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'BucketStorageSidePage', {
        id: row.id,
        resource: 'buckets',
        getParams: this.getParams,
      }, {
        list: this.list,
        cancel: () => {
          this.list.singleRefresh(row.id, Object.values(expectStatus.bucket).flat())
        },
      })
    },
  },
}
</script>
