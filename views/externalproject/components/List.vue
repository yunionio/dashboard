<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'ExternalprojectList',
  mixins: [WindowsMixin, ListMixin],
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
          field: 'tenant',
          title: `本地${this.$t('dictionary.project')}`,
          slots: {
            default: ({ row }) => {
              return [
                <side-page-trigger permission='projects_get' name='ProjectSidePage' id={row.tenant_id} vm={this}>{row.tenant}</side-page-trigger>,
              ]
            },
          },
        },
        {
          field: 'name',
          title: `云上${this.$t('dictionary.project')}`,
        },
        getTimeTableColumn({
          field: 'created_at',
          title: '同步时间',
        }),
      ],
      groupActions: [
        {
          label: `更改${this.$t('dictionary.project')}`,
          permission: 'externalprojects_update',
          action: obj => {
            this.createDialog('ChangeProjectDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
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
          label: `更改${this.$t('dictionary.project')}`,
          permission: 'externalprojects_update',
          action: obj => {
            this.createDialog('ChangeProjectDialog', {
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
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
