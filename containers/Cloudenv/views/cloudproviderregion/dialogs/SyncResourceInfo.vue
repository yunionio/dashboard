<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_463')}}</div>
    <div slot="body">
      <dialog-table :data="dataList" :columns="columns" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'cloudproviderregionsSyncResourceInfoDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.data[0]
    const dataList = this.getDataList(data)
    return {
      dataList,
      columns: [
        {
          title: this.$t('cloudenv.text_321'),
          field: 'resource',
          slots: {
            default: ({ row }) => {
              if (this.$te(`dictionary.${row.resource}`)) {
                return this.$t(`dictionary.${row.resource}`)
              }
              if (this.$te(`dictionary.${row.resource.substr(0, row.resource.length - 1)}`)) {
                return this.$t(`dictionary.${row.resource.substr(0, row.resource.length - 1)}`)
              }
              return row.resource
            },
          },
        },
        {
          title: this.$t('cloudenv.resource_add_cnt'),
          field: 'add_cnt',
          slots: {
            default: ({ row }) => {
              return row.add_cnt || '-'
            },
          },
        },
        {
          title: this.$t('cloudenv.resource_del_cnt'),
          field: 'del_cnt',
          slots: {
            default: ({ row }) => {
              return row.del_cnt || '-'
            },
          },
        },
      ],
    }
  },
  methods: {
    getDataList (data) {
      const { sync_results = {} } = data
      const ret = []
      for (const key in sync_results) {
        if (R.is(Object, sync_results[key])) {
          const { add_cnt = 0, del_cnt = 0 } = sync_results[key]
          if (add_cnt || del_cnt) {
            ret.push({ resource: key, add_cnt, del_cnt })
          }
        }
      }
      return ret
    },
  },
}
</script>
