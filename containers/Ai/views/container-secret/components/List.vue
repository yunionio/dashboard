<template>
  <page-list
    show-tag-filter
    show-tag-columns
    show-tag-columns2
    show-tag-config
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :tag-config-params="tagConfigParams" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'ContainerSecretList',
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
        resource: 'credentials',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {},
        hiddenColumns: [],
      }),
      tagConfigParams: {
        resource: 'credentials',
      },
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.createDialog('ContainerSecretCreateDialog', {
              callback: () => {
                this.list.refresh()
              },
            })
          },
          meta: () => ({
            buttonType: 'primary',
            validate: true,
          }),
        },
        {
          label: this.$t('table.action.delete'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('table.action.delete'),
              name: this.$t('aice.container_secret'),
              onManager: this.onManager,
            })
          },
          meta: () => ({
            validate: this.list.selected.length,
          }),
        },
      ],
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
        'filter.0': 'type.equals(container_secret)',
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'ContainerSecretSidePage', {
        id: row.id,
        resource: 'credentials',
        apiVersion: 'v1',
        getParams: () => ({}),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
