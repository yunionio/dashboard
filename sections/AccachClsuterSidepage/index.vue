
<template>
  <page-list
    v-if="list"
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { getNameFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import { getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'K8SFederatedAccachClsuterSidepage',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
    },
    onManager: {
      type: Function,
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: this.fetchData,
        idKey: 'cluster_id',
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      groupActions: [
        {
          label: this.$t('k8s.text_366'),
          permission: `k8s_${this.resource}_perform_attach_cluster`,
          action: () => {
            this.createDialog('AttachClusterDialog', {
              vm: this,
              data: this.data,
              columns: this.columns,
              title: this.$t('k8s.text_368'),
              name: this.$t('k8s.text_365'),
              onManager: this.onManager,
              resource: this.resource.replace(/^(\w+)s$/, '$1'), // 把 reousce 复数变单数
              success: () => {
                this.list.refesh()
              },
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
      ],
      singleActions: [
        {
          label: this.$t('k8s.text_199'),
          permission: `k8s_${this.resource}_perform_detach_cluster`,
          action: (obj) => {
            this.createDialog('DetachClusterDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
              success: () => {
                this.list.refesh()
              },
            })
          },
        },
      ],
      columns: [
        {
          field: 'cluster',
          title: this.$t('k8s.text_243'),
          width: 300,
          slots: {
            default: ({ row }, h) => {
              const ret = [<side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.cluster }</side-page-trigger>]
              return ret
            },
          },
        },
        getTimeTableColumn(),
        getTimeTableColumn({
          field: 'updated_at',
          title: this.$t('common.updatedAt'),
        }),
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SClusterSidePage', {
        id: row.cluster_id,
        resource: 'kubeclusters',
        apiVersion: 'v1',
        getParams: this.list.getParams,
      }, {
        cancel: () => {
          this.list.refresh()
        },
      })
    },
    async fetchData (params) {
      try {
        const managerArgs = {
          id: this.data.id,
          spec: 'kubeclusters',
          params: {
            details: true,
            ...params,
          },
        }
        const res = await new this.$Manager(this.resource, 'v1').getSpecific(managerArgs)
        return res
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
