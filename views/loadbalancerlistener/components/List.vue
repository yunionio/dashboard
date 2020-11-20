<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'

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
        filterOptions: {
          name: getNameFilter(),
        },
        steadyStatus,
      }),
    }
  },
  computed: {
    groupActions () {
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
              const isHttps = this.list.selectedItems.every(item => item.listener_type === 'https')
              if (!isHttps) {
                return {
                  validate: false,
                  tooltip: this.$t('network.text_367'),
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
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
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
