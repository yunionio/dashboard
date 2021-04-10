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
  name: 'LoadbalancerbackendList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    data: { // 后端服务器组的数据
      type: Object,
      required: true,
    },
    isListenerSidepage: {
      type: Boolean,
      default: false,
    },
    lbData: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'LoadbalancerbackendList',
        resource: 'loadbalancerbackends',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
        },
        steadyStatus: {
          status: Object.values(expectStatus.lb).flat(),
        },
      }),
    }
  },
  computed: {
    groupActions () {
      if (this.isListenerSidepage) { // 监听抽屉里面不能直接新建后端服务器
        return []
      }
      return [
        {
          label: this.$t('network.text_26'),
          permission: 'lb_loadbalancerbackends_create',
          action: () => {
            const w100Providers = ['aliyun', 'huawei', 'qcloud', 'aws']
            let maxWeight = 256
            if (this.data && this.data.provider) {
              if (w100Providers.includes(this.data.provider.toLowerCase())) {
                maxWeight = 100
              }
            }
            this.createDialog('LoadbalancerbackendCreateDialog', {
              title: this.$t('network.text_26'),
              data: this.list.selectedItems,
              onManager: this.onManager,
              refresh: this.refresh,
              lbBackendgroupData: this.data,
              maxWeight,
              lbData: this.lbData,
              listData: this.list.data,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ]
    },
  },
  created () {
    if (!this.getParam().backend_group) {
      this.list.configLoaded = true // 手动把list.configLoaded变为true，确保list的表头正确渲染
      return
    }
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
      this.sidePageTriggerHandle(this, 'LoadbalancerbackendSidePage', {
        id: row.id,
        resource: 'loadbalancerbackends',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
