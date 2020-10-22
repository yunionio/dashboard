<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getTenantFilter, getDomainFilter } from '@/utils/common/tableFilter'

export default {
  name: 'LbcertList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'loadbalancercertificates',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('network.text_317'),
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_317'), key: 'name' },
          { label: this.$t('network.text_318'), key: 'common_name' },
          { label: this.$t('network.text_319'), key: 'not_after' },
          { label: this.$t('network.text_320'), key: 'subject_alternative_names' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
        ],
      },
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'lb_loadbalancercertificates_create',
          action: () => {
            this.createDialog('LbcertsCreateDialog', {
              title: this.$t('network.text_321'),
              data: this.list.selectedItems,
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: this.hasService(this.userInfo, 'lbagent') || this.hasHypervisors(['aliyun', 'qcloud', 'huawei', 'aws']),
            }
          },
        },
        {
          label: this.$t('network.text_131'),
          permission: 'lb_loadbalancercertificates_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              title: this.$t('network.text_131'),
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              name: this.$t('network.text_143'),
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    this.initSidePageTab('lbcert-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
    hasService ($userInfo, service) {
      if ($userInfo && $userInfo.services && $userInfo.services.length) {
        const results = $userInfo.services.filter(item => {
          return item.type === service && item.status === true
        })
        return results && results.length > 0
      }
      return false
    },
    hasHypervisors (hypervisors) {
      for (let i = 0, len = hypervisors.length; i < len; i++) {
        if ((this.userInfo.hypervisors || []).indexOf(hypervisors[i]) !== -1) {
          return true
        }
      }
      return false
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'LbcertSidePage', {
        id: row.id,
        resource: 'loadbalancercertificates',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
