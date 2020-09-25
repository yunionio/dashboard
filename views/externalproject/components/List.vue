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
    cloudaccount: Object,
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
          title: this.$t('cloudenv.text_386'),
        },
        {
          field: 'tenant',
          title: this.$t('cloudenv.text_387'),
          slots: {
            default: ({ row }) => {
              return [
                <side-page-trigger permission='projects_get' name='ProjectSidePage' id={row.tenant_id} vm={this}>{row.tenant}</side-page-trigger>,
              ]
            },
          },
        },
        {
          field: 'project_domain',
          title: this.$t('res.domain'),
        },
        getTimeTableColumn({
          field: 'created_at',
          title: this.$t('cloudenv.text_103'),
        }),
      ],
      groupActions: [
        {
          label: this.$t('cloudenv.text_388'),
          permission: 'externalprojects_update',
          action: obj => {
            this.createDialog('ExternalProjectSwitchLocalDialog', {
              data: this.list.selectedItems,
              cloudaccount: this.cloudaccount,
              title: this.$t('cloudenv.text_388'),
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
          label: this.$t('cloudenv.text_388'),
          permission: 'externalprojects_update',
          action: obj => {
            this.createDialog('ExternalProjectSwitchLocalDialog', {
              data: [obj],
              cloudaccount: this.cloudaccount,
              title: this.$t('cloudenv.text_388'),
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
}
</script>
