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

export default {
  name: 'LbaclsList',
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
        resource: 'loadbalanceracls',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '策略组名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '策略组名称', key: 'name' },
          { label: '源地址 | 备注', key: 'acl_entries' },
          { label: '创建时间', key: 'created_at' },
          { label: '更新时间', key: 'updated_at' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'lb_loadbalanceracls_create',
          action: () => {
            this.createDialog('LbaclsCreateDialog', {
              title: '新建访问控制',
              data: this.list.selectedItems,
              onManager: this.onManager,
              type: 'create',
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
          label: '删除',
          permission: 'lb_loadbalancerlisteners_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              title: '删除',
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
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
    this.initSidePageTab('lbacl-detail')
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
      this.sidePageTriggerHandle(this, 'LbaclSidePage', {
        id: row.id,
        resource: 'loadbalanceracls',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
