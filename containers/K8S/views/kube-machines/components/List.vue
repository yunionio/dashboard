<template>
  <div>
    <page-list
      v-if="data.mode === 'customize'"
      :list="list"
      :group-actions="groupActions"
      :single-actions="singleActions"
      :columns="columns" />
    <a-alert v-else :message="$t('k8s.text_279')" banner />
  </div>
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import ListMixin from '@/mixins/list'

export default {
  name: 'kubeMachinesList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    resId: String,
    data: {
      type: Object,
      required: true,
    },
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'kubemachines',
        apiVersion: 'v1',
        steadyStatus: Object.values(expectStatus.kubemachines).flat(),
        getParams: { details: true, cluster: this.resId },
        filterOptions: {
          name: {
            label: this.$t('k8s.text_41'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      groupActions: [
        {
          label: this.$t('k8s.text_280'),
          permission: 'k8s_kubeclusters_perform_add_machines',
          action: () => {
            this.createDialog('CreateKubemachinesDialog', {
              title: this.$t('k8s.text_49'),
              data: this.data,
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('k8s.text_201'),
          permission: 'k8s_kubemachines_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('k8s.text_201'),
              name: this.$t('k8s.text_21'),
              onManager: this.onManager,
              success: () => {
                this.destroySidePages()
              },
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('event-drawer')
    if (this.data.mode === 'customize') this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = { ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams) }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SKubeMachineSidePage', {
        id: row.id,
        resource: 'kubemachines',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
