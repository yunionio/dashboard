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
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'K8SVchypernodeList',
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
        resource: 'vchypernodes',
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: getNameFilter(),
        },
        steadyStatus: {
          status: Object.values(expectStatus.k8s_resource_vchypernode).flat(),
        },
      }),
      groupActions: [
        {
          label: this.$t('k8s.create'),
          permission: 'k8s_vchypernodes_create',
          action: () => {
            this.$router.push({ path: '/k8s-vchypernode/create' })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('k8s.text_201'),
          permission: 'k8s_vchypernodes_delete',
          action: () => {
            const data = this.list.selectedItems
            this.createDialog('DeleteResDialog', {
              vm: this,
              data,
              columns: this.columns,
              title: this.$t('k8s.text_201'),
              name: this.$t('k8s.vc_hypernode'),
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
      this.sidePageTriggerHandle(this, 'K8SVCHyperNodeSidePage', {
        id: row.id,
        resource: 'vchypernodes',
        getParams: () => ({
          cluster: row.clusterID,
        }),
        apiVersion: 'v1',
        steadyStatus: {
          status: Object.values(expectStatus.k8s_resource_vchypernode).flat(),
        },
      }, {
        list: this.list,
      })
    },
  },
}
</script>
