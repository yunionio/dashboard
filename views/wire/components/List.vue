<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { BAND_WIDTH_OPTION } from '../../../constants'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'WireList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'wires',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          bandwidth: {
            label: '宽带',
            dropdown: true,
            multiple: true,
            items: BAND_WIDTH_OPTION.map(({ label, value }) => {
              return { label, key: value }
            }),
          },
          vpc: {
            label: '专有网络',
          },
          region: {
            label: '区域',
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '带宽', key: 'bandwidth' },
          { label: '专有网络', key: 'vpc' },
          { label: '网络数量', key: 'networks' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '平台', key: 'provider' },
          { label: '云账号', key: 'manager' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('WireCreateDialog', {
              title: '新建',
              onManager: this.onManager,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '删除',
          permission: 'wires_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除',
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  watch: {
    cloudEnv (val) {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.initSidePageTab('wire-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        show_emulated: false,
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'WireSidePage', {
        id: row.id,
        resource: 'wires',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
