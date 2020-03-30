
<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'

export default {
  name: 'KubeclusterList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
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
        resource: 'kubeclusters',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
        },
        steadyStatus: {
          status: Object.values(expectStatus.kubecluster).flat(),
        },
        responseData: this.responseData,
      }),
      groupActions: [
        {
          label: '新建',
          permission: 'k8s_kubeclusters_create',
          action: () => {
            this.$router.push({ path: '/k8s-deployment/create' })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '导入',
          permission: 'k8s_kubeclusters_create',
          action: () => {
            this.$router.push({ path: '/k8s-deployment/import' })
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('disk-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = { ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams) }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DiskSidePage', {
        id: row.id,
        resource: 'disks',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.disk).flat(),
          guest_status: [...Object.values(expectStatus.server).flat(), '', undefined],
        },
      }, {
        list: this.list,
      })
    },
  },
}
</script>
