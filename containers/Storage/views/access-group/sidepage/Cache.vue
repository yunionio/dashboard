<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  getStatusTableColumn,
  getBrandTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'AccessGroupCache',
  mixins: [WindowsMixin, ListMixin],
  props: {
    getParams: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'access_group_caches',
        getParams: {
          details: true,
          access_group_id: this.getParams.id,
        },
        filterOptions: {
          name: {
            label: this.$t('storage.text_40'),
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
          title: this.$t('storage.text_40'),
          minWidth: 100,
          showOverflow: 'title',
          slots: {
            default: ({ row }, h) => {
              const { name } = row
              return [
                <div class='text-truncate' title={ name }>
                  { name }
                </div>,
              ]
            },
          },
        },
        {
          field: 'mount_target_count',
          title: this.$t('storage.mount.target.count'),
          formatter: ({ cellValue }) => {
            if (cellValue) {
              return cellValue
            }
            return 0
          },
        },
        getStatusTableColumn({ statusModule: 'accessGroup' }),
        {
          field: 'created_at',
          title: this.$t('storage.created_at'),
          width: 150,
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        {
          field: 'updated_at',
          title: this.$t('storage.text_156'),
          width: 150,
          formatter: ({ cellValue }) => {
            return this.$moment(cellValue).format()
          },
        },
        getBrandTableColumn(),
        getRegionTableColumn(),
        {
          field: 'account',
          title: this.$t('storage.text_94'),
          width: 100,
        },
      ],
      singleActions: [
        {
          label: this.$t('storage.text_100'),
          permission: 'access_group_caches_perform_syncstatus',
          action: obj => {
            this.onManager('performAction', {
              steadyStatus: ['available'],
              id: obj.id,
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => ({
            validate: true,
          }),
        },
        {
          label: this.$t('storage.text_36'),
          permission: 'access_group_caches_delete',
          action: obj => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              alert: this.$t('storage.text_267'),
              columns: this.columns,
              title: this.$t('storage.text_36'),
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
          meta: (obj) => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
