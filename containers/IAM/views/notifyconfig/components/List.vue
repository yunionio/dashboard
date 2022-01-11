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

export default {
  name: 'NotifyConfigList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'notifyconfigs',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('system.text_101'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      groupActions: [{
        label: this.$t('system.text_128'),
        permission: 'notifyconfigs_create',
        action: () => {
          this.$router.push({
            path: '/notifyconfig/create',
          })
        },
        meta: () => {
          return {
            buttonType: 'primary',
          }
        },
      }, {
        label: this.$t('system.text_129'),
        permission: 'notifyconfigs_delete',
        action: (row) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: this.list.selectedItems,
            columns: this.columns,
            title: this.$t('system.text_129'),
            name: this.$t('system.notify_channels'),
            onManager: this.onManager,
          })
        },
        meta: () => this.$getDeleteResult(this.list.selectedItems),
      }],
    }
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'NotifyConfigSidePage', {
        id: row.id,
        resource: 'notifyconfigs',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
