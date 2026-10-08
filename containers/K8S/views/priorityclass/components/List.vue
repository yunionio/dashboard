<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions">
    <template v-slot:group-actions-append>
      <cluster-namespace :getParams.sync="list.getParams" :ignoreNamespace="true" @refresh="fetchData" class="ml-3" />
    </template>
  </page-list>
</template>

<script>
import ClusterNamespace from '@K8S/sections/ClusterNamespace'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

function isSystemPriorityClass (name) {
  return name === 'system-cluster-critical' || name === 'system-node-critical'
}

export default {
  name: 'K8SPriorityclassList',
  components: {
    ClusterNamespace,
  },
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    showSearchbox: {
      type: Boolean,
      default: true,
    },
    showGroupActions: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'priorityclasses',
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      groupActions: [
        {
          label: this.$t('k8s.create'),
          permission: 'k8s_priorityclasses_create',
          action: () => {
            this.$router.push({ path: '/k8s-priorityclass/create' })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('k8s.text_201'),
          permission: 'k8s_priorityclasses_delete',
          action: () => {
            const data = this.list.selectedItems
            this.createDialog('DeleteResDialog', {
              vm: this,
              data,
              columns: this.columns,
              title: this.$t('k8s.text_201'),
              name: this.$t('k8s.vc_priority_class'),
              onManager: this.onManager,
              requestData: {
                cluster: data[0].clusterID,
              },
            })
          },
          meta: () => {
            if (this.list.selectedItems.length === 0) {
              return {
                validate: false,
                tooltip: this.$t('k8s.text_204'),
              }
            }
            if (this.list.selectedItems.some(item => isSystemPriorityClass(item.name))) {
              return {
                validate: false,
                tooltip: this.$t('k8s.vc_system_priority_class'),
              }
            }
            return { validate: true }
          },
        },
      ],
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    fetchData () {
      if (this.list.getParams.cluster) {
        this.list.fetchData()
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SPriorityClassSidePage', {
        id: row.id,
        resource: 'priorityclasses',
        getParams: () => ({
          cluster: row.clusterID,
        }),
        apiVersion: 'v1',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
