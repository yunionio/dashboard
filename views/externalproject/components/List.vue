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
            label: this.$t('cloudenv.text_95'),
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
          title: this.$t('cloudenv.text_386', [this.$t('dictionary.project')]),
        },
        {
          field: 'tenant',
          title: this.$t('cloudenv.text_387', [this.$t('dictionary.project')]),
          slots: {
            default: ({ row }) => {
              return [
                <side-page-trigger permission='projects_get' name='ProjectSidePage' id={row.tenant_id} vm={this}>{row.tenant}</side-page-trigger>,
              ]
            },
          },
        },
        getTimeTableColumn({
          field: 'created_at',
          title: this.$t('cloudenv.text_103'),
        }),
      ],
      groupActions: [
        {
          label: this.$t('cloudenv.text_388', [this.$t('dictionary.project')]),
          permission: 'externalprojects_update',
          action: obj => {
            this.createDialog('ChangeProjectDialog', {
              data: this.list.selectedItems,
              title: this.$t('cloudenv.text_388', [this.$t('dictionary.project')]),
              name: this.$t('dictionary.project'),
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
          label: this.$t('cloudenv.text_388', [this.$t('dictionary.project')]),
          permission: 'externalprojects_update',
          action: obj => {
            this.createDialog('ChangeProjectDialog', {
              data: [obj],
              title: this.$t('cloudenv.text_388', [this.$t('dictionary.project')]),
              name: this.$t('dictionary.project'),
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
