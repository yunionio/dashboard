<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import {
  getNameDescriptionTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LbaclsList',
  mixins: [WindowsMixin],
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
            label: '证书名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
            },
          },
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          title: '证书名称',
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'LbcertSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'common_name',
          title: '证书域名',
          width: 150,
          formatter: ({ cellValue }) => {
            return cellValue || '-'
          },
        },
        {
          field: 'not_after',
          title: '过期时间',
          width: 150,
          formatter: ({ cellValue }) => {
            return cellValue ? this.$moment(cellValue).format('YYYY年MM月DD日 HH:mm:ss') : '-'
          },
        },
        {
          field: 'subject_alternative_names',
          title: '关联扩展域名',
          width: 150,
          formatter: ({ cellValue }) => {
            return cellValue || '-'
          },
        },
        getProjectTableColumn(),
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'lb_loadbalancercertificates_create',
          action: () => {
            this.createDialog('LbcertsCreateDialog', {
              title: '新建',
              data: this.list.selectedItems,
              list: this.list,
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
          permission: 'lb_loadbalancercertificates_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
      singleActions: [
        {
          label: '删除',
          permission: 'lb_loadbalancercertificates_delete',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              title: '删除',
              data: [obj],
              columns: this.columns,
              list: this.list,
              success: () => {
                this.destroySidePages()
              },
            })
          },
          meta: (obj) => this.$getDeleteResult(obj),
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
  },
}
</script>
