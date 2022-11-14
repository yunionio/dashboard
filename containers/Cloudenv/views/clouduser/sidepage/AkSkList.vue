<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions" />
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  getTimeTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'AkSkListForClouduserSidepage',
  mixins: [DialogMixin, WindowsMixin, ListMixin],
  props: {
    getParams: {
      type: Object,
      default: () => ({}),
    },
    resId: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'AkSkListForClouduserSidepage',
        idKey: 'access_key',
        resource: 'access-keys',
        ctx: [['cloudusers', this.resId]],
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {},
      }),
      columns: [
        {
          field: 'access_key',
          title: this.$t('cloudenv.aksk'),
          formatter: ({ row }) => {
            return row.access_key
          },
        },
        {
          field: 'name',
          title: this.$t('cloudenv.text_331'),
          formatter: ({ row }) => {
            return row.name
          },
        },
        {
          field: 'status',
          title: this.$t('cloudenv.text_98'),
          slots: {
            default: ({ row }, h) => {
              return [
                <div class='text-truncate'>
                  <status status={ row.status === 'active' } statusModule='enabled' />
                </div>,
              ]
            },
          },
        },
        getTimeTableColumn(),
      ],
      singleActions: [
        {
          label: this.$t('common.delete'),
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('common.delete'),
              name: this.$t('cloudenv.aksk'),
              idKey: 'access_key',
              onManager: this.onManager,
              ok: async ids => {
                try {
                  const manager = new this.$Manager('cloudusers')
                  const response = await manager.performAction({
                    id: this.resId,
                    action: 'delete-access-key',
                    data: {
                      access_key: ids[0],
                    },
                  })
                  this.list.refresh()
                  return response
                } finally {}
              },
            })
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.createDialog('AkSkCreateDialog', {
              cloudaccountId: this.resId,
              callback: (data) => {
                this.createDialog('AkskDownloadDialog', {
                  data: data,
                })
                this.list.fetchData()
              },
            })
          },
          meta: () => {
            return {
              validate: this.list.total < 2,
              buttonType: 'primary',
            }
          },
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
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
  },
}
</script>

<style>

</style>
