<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import {
  getNameFilter,
  getStatusFilter,
} from '@/utils/common/tableFilter'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'ContainerList',
  mixins: [ListMixin, WindowsMixin, SingleActionsMixin, ColumnsMixin],
  props: {
    id: String,
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'containers',
        getParams: {
          guest_id: this.resId,
        },
        steadyStatus: Object.values(expectStatus.container).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('container'),
        },
      }),
      groupActions: [
        // 启动
        {
          label: this.$t('compute.repo.start'),
          action: () => {
            const ids = this.list.selectedItems.map(item => item.id)
            this.list.onManager('batchPerformAction', {
              steadyStatus: 'running',
              id: ids,
              managerArgs: {
                action: 'start',
              },
            })
          },
          meta: () => {
            const ret = { validate: true, tooltip: null }
            if (this.list.selectedItems.length === 0) {
              ret.validate = false
              return ret
            }
            const isStatusOk = this.list.selectedItems.every(item => ['exited'].includes(item.status))
            if (!isStatusOk) {
              ret.validate = false
              return ret
            }
            return ret
          },
        },
        // 停止
        {
          label: this.$t('compute.repo.stop'),
          action: () => {
            this.createDialog('ContainerShutDownDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = { validate: true, tooltip: null }
            if (this.list.selectedItems.length === 0) {
              ret.validate = false
              return ret
            }
            const isStatusOk = this.list.selectedItems.every(item => ['running'].includes(item.status))
            if (!isStatusOk) {
              ret.validate = false
              return ret
            }
            return ret
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    openWebConsole (data) {
      let href = ''
      if (process.env.VUE_APP_WEBCONSOLE_DEBUG === 'true') {
        href = `${this.$appConfig.webConsolePath}${data.access_url.replace(/^.*?web-console\//, '')}`
      } else {
        href = data.access_url
      }
      window.open(`${href}&session_id=${data.session}`)
    },
    async fetchConnectUrl (obj) {
      const { data } = await new this.$Manager('webconsole', 'v1').objectRpc({
        methodname: 'DoContainerExec',
        params: {
          container_id: obj.id,
        },
      })
      return Promise.resolve(data)
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'VmPodContainerSidePage', {
        id: row.id,
        resource: 'containers',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
