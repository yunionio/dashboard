<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import * as R from 'ramda'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'

const DEVICE_MAP = {
  '10de': 'nvidia',
  1002: 'amd',
}

export default {
  name: 'HostGpuList',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'isolated_devices',
        getParams: this.getParam,
      }),
      columns: [
        {
          field: 'dev_type',
          title: this.$t('compute.text_481'),
        },
        {
          field: 'model',
          title: this.$t('compute.text_482'),
          slots: {
            default: ({ cellValue, row }, h) => {
              const device = row.vendor_device_id.split(':')[0]
              if (!device) {
                return cellValue
              }
              return [
                <span>{row.model}</span>,
                <icon type={ DEVICE_MAP[device] } />,
              ]
            },
          },
        },
        {
          field: 'guest_id',
          title: this.$t('compute.text_232'),
          formatter: ({ cellValue, row }) => {
            return row.guest || cellValue
          },
        },
        {
          field: '',
          title: this.$t('compute.text_501'),
          minWidth: 100,
          showOverflow: 'title',
          slots: {
            default: ({ row }, h) => {
              const ret = []
              const config = row.reserved_cpu + 'C' + sizestr(row.reserved_memory, 'M', 1024) + (row.reserved_storage ? sizestr(row.reserved_storage, 'M', 1024) : '')
              return ret.concat(<div class='text-truncate' style={{ color: '#53627C' }}>{ config }</div>)
            },
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
        gpu: true,
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        host: this.resId,
      }
      return ret
    },
  },
}
</script>
