<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'ZoneList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
    disableCreate: Boolean,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'zones',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '物理机', key: 'hosts' },
          { label: '可用物理机', key: 'hosts_enabled' },
          { label: '受管物理机', key: 'baremetals' },
          { label: '可用受管物理机', key: 'baremetals_enabled' },
          { label: '二层网络', key: 'wires' },
        ],
        getParams: {
          cloud_env: 'private_or_onpremise',
          with_meta: true,
          show_emulated: true,
        },
      },
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('CreateZoneDialog', {
              title: '创建可用区',
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: !this.disableCreate,
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('zone-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'ZoneSidePage', {
        id: row.id,
        resource: 'zones',
        getParams: this.getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
