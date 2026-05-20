<template>
  <page-list
    :list="list"
    :columns="columns"
    :show-search="false" />
</template>

<script>
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getLlmIpColumn,
  getCpuTableColumn,
  getMemoryTableColumn,
  getDiskTableColumn,
} from '@Ai/views/llm/utils/columns'

export default {
  name: 'LlmDeploymentInstancesList',
  mixins: [ListMixin, WindowsMixin],
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
        resource: 'llms',
        getParams: {
          llm_deployment: this.data.id,
          details: true,
        },
        idKey: 'id',
      }),
      columns: [
        getNameDescriptionTableColumn({
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.handleOpenSidepage(row)}>{row.name}</side-page-trigger>
            )
          },
        }),
        getStatusTableColumn({ statusModule: 'server' }),
        getStatusTableColumn({ field: 'llm_status', statusModule: 'container', title: this.$t('aice.container_status') }),
        getLlmIpColumn(),
        getCpuTableColumn(),
        getMemoryTableColumn(),
        getDiskTableColumn(),
        {
          field: 'host',
          title: this.$t('compute.text_111'),
          showOverflow: 'title',
          minWidth: 120,
          formatter: ({ row }) => row.host || '-',
        },
        getTimeTableColumn(),
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'LlmSidePage', {
        id: row.id,
        resource: 'llms',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
