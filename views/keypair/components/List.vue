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
  name: 'KeyPairList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'keypairs',
        getParams: this.getParam,
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
          { label: '公钥内容', key: 'public_key' },
          { label: '指纹', key: 'fingerprint' },
          { label: '类型', key: 'scheme' },
          { label: `关联${this.$t('dictionary.server')}数量`, key: 'linked_guest_count' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'keypairs_create',
          action: () => {
            this.createDialog('CreateKeyPairDialog', {
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
          permission: 'keypairs_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除',
              name: this.$t('dictionary.keypair'),
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
  created () {
    this.initSidePageTab('key-pair-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
        scope: 'user',
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'KeyPairSidePage', {
        id: row.id,
        resource: 'keypairs',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
