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
    source: {
      type: String,
      default: 'host',
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'GpuListForHostSidePage',
        resource: 'isolated_devices',
        getParams: this.getParam,
      }),
    }
  },
  computed: {
    columns () {
      const ret = [
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
      ]
      if (this.source === 'physicalmachine') {
        const addObj = {
          field: 'host',
          title: this.$t('compute.text_1318'),
        }
        ret.splice(ret.length - 2, 2, addObj)
      }
      return ret
    },
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
