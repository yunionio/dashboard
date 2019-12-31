<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ExternalprojectList',
  mixins: [WindowsMixin],
  props: {
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'externalprojects',
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
      columns: [
        {
          field: 'name',
          title: '云上项目',
        },
        {
          field: 'tenant',
          title: '本地项目',
        },
        {
          field: 'last_auto_sync',
          title: '同步时间',
          formatter: obj => this.$moment(obj.Created_at).format('YYYY年MM月DD HH:mm:ss'),
        },
      ],
      groupActions: [
        {
          label: '更改项目',
          permission: 'externalprojects_update',
          action: obj => {
            this.createDialog('ChangeProjectDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              list: this.list,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length,
            }
          },
        },
      ],
      singleActions: [
        {
          label: '更改项目',
          permission: 'externalprojects_update',
          action: obj => {
            this.createDialog('ChangeProjectDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
  },
}
</script>
