
<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { getNameFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  name: 'CommonalertList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({
        details: true,
      }),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'commonalerts',
        apiVersion: 'v1',
        getParams: this.getParams,
        steadyStatus: Object.values(expectStatus.commonalert).flat(),
        filterOptions: {
          name: getNameFilter(),
        },
      }),
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'commonalerts_create',
          action: () => {
            this.$router.push({
              path: '/commonalerts/create',
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: obj => {
            return [
              ...getEnabledSwitchActions(this, obj, ['commonalerts_perform_enable', 'commonalerts_perform_disable']),
              {
                label: this.$t('common.delete'),
                permission: 'commonalerts_delete',
                action: () => {
                  const data = this.list.selectedItems
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data,
                    columns: this.columns,
                    title: this.$t('common.delete'),
                    name: this.$t('dictionary.commonalert'),
                    onManager: this.onManager,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('commonalert-detail')
    this.fetchData()
  },
  methods: {
    fetchData () {
      this.list.fetchData()
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'CommonalertsSidePage', {
        id: row.id,
        resource: 'commonalerts',
        getParams: this.getParams,
        apiVersion: 'v1',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
