<template>
  <page-card-list
    :list="list"
    :group-actions="groupActions"
    :card-fields="cardFields"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import { getNameDescriptionTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'ServicecatalogList',
  mixins: [WindowsMixin],
  props: {
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      errors: [],
      list: this.$list.createList(this, {
        resource: 'servicecatalogs',
        getParams: this.getParam,
      }),
      cardFields: {
        url: 'icon_url',
        title: 'name',
        desc: 'description',
      },
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
        }),
        {
          field: 'created_at',
          title: '创建时间',
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'servicecatalogs_create',
          action: () => {
            this.createDialog('CreateServicecatalogDialog', {
              title: '删除',
              list: this.list,
              name: '服务目录',
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
      ],
      singleActions: [
        {
          label: '部署',
          permission: 'server_create',
          action: obj => {
            this.$router.push({
              path: '/servicecatalog/deploy',
              query: {
                id: obj.id,
              },
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '修改',
          permission: 'servicecatalogs_update',
          action: obj => {
            this.createDialog('UpdateServicecatalogDialog', {
              data: [obj],
              list: this.list,
            })
          },
        },
        {
          label: '删除',
          permission: 'servicecatalogs_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              title: '删除',
              name: '服务目录',
              columns: this.columns,
            })
          },
          meta: obj => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
      }
      return ret
    },
  },
}
</script>
