<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import * as R from 'ramda'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getDomainFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'LoadbalancerlistenerList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    data: { // LB实例
      type: Object,
      required: true,
    },
  },
  data () {
    const steadyStatus = {
      status: Object.values(expectStatus.lb).flat(),
    }
    return {
      steadyStatus,
      list: this.$list.createList(this, {
        id: 'LoadbalancerListenerList',
        resource: 'loadbalancerlisteners',
        getParams: this.getParam,
        fetchDataCb: this.fetchDataCb,
        filterOptions: {
          name: getNameFilter(),
          project_domains: getDomainFilter(),
        },
        steadyStatus,
      }),
    }
  },
  computed: {
    groupActions () {
      const provider = R.path(['provider'], this.data)
      if (provider && (provider.toLowerCase() === 'azure' || provider.toLowerCase() === 'google' || provider.toLowerCase() === 'cloudflare')) return []
      if (this.$route.name === 'LbaclList') { return [] }
      if (this.$route.name === 'LbcertList') {
        return [
          {
            label: this.$t('network.text_366'),
            permission: 'lb_loadbalancerlisteners_update',
            action: () => {
              this.createDialog('LbListenerUpdateCertificate', {
                vm: this,
                data: this.list.selectedItems,
                columns: this.columns,
                refresh: this.refresh,
                onManager: this.onManager,
                lbDetail: this.data,
              })
            },
            meta: () => {
              if (this.list.selectedItems.length <= 0) {
                return {
                  validate: false,
                }
              }
              if (this.$store.getters.isAdminMode) {
                const isOtherItem = this.list.selectedItems.every(item => item.project_domain !== this.list.selectedItems[0].project_domain)
                if (isOtherItem) { // 存在不一样的 project_domain
                  return {
                    validate: false,
                    tooltip: this.$t('common.need_same_domain_resource'),
                  }
                }
              }
              const isHttps = this.list.selectedItems.every(item => item.listener_type === 'https')
              if (!isHttps) {
                return {
                  validate: false,
                  tooltip: this.$t('network.text_367'),
                }
              }
              const domainsList = Array.from(new Set(this.list.selectedItems.map(val => val.domain_id)))
              if (domainsList.length > 1) { // 去重后的数组长度大于1说明有多个不同的域
                return {
                  validate: false,
                  tooltip: this.$t('network.text_754'),
                }
              }
              return { validate: true }
            },
          },
        ]
      }
      return [
        {
          label: this.$t('network.text_26'),
          permission: 'lb_loadbalancerlisteners_create',
          action: () => {
            this.createDialog('LbListenerFormDialog', {
              lbDetail: this.data,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('network.text_131'),
          permission: 'lb_loadbalancerlisteners_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('network.text_131'),
              name: this.$t('network.text_138'),
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ]
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    fetchDataCb () {
      if (this.list.total > 0 && this.data.provider === 'Google') {
        for (const item in this.list.data) {
          const data = this.list.data[item].data
          data.provider = this.data.provider
          data.cloudregion = this.data.cloudregion
          data.cloudregion_id = this.data.cloudregion_id
          data.region = this.data.region
          data.region_ext_id = this.data.region_ext_id
          data.region_external_id = this.data.region_external_id
          data.region_id = this.data.region_id
        }
      }
    },
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'LoadbalancerlistenerSidePage', {
        id: row.id,
        resource: 'loadbalancerlisteners',
        getParams: this.getParam,
        rowData: row,
        lbData: this.data,
      }, {
        list: this.list,
        lbDetail: this.data,
      })
    },
  },
}
</script>
