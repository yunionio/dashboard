<template>
  <page-list
    :list="list"
    :columns="columns" />
</template>

<script>
import * as R from 'ramda'
import WindowsMixin from '@/mixins/windows'
import {
  getSharingModeColumn,
} from '@Compute/views/gpu/utils/columns'

const DEVICE_MAP = {
  '10de': 'nvidia',
  1002: 'amd',
}

export default {
  name: 'BaremetalGpuList',
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
        id: 'GpuListForBaremetalSidepage',
        resource: 'guestisolateddevices',
        getParams: this.getParam,
      }),
    }
  },
  computed: {
    columns () {
      return [
        {
          field: 'addr',
          title: 'PCI ADDR',
          width: 100,
          showOverflow: 'ellipsis',
          formatter: function ({ row }) {
            return row.addr || '-'
          },
        },
        {
          field: 'dev_type',
          title: this.$t('compute.text_481'),
        },
        {
          field: 'vendor',
          title: this.$t('compute.isolated_devices.vendor.title'),
          formatter: ({ row }) => row.vendor || '-',
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
          field: 'host',
          title: this.$t('compute.isolated_device_located_baremetal'),
        },
        {
          field: 'numa_node',
          title: 'NUMA',
          width: 80,
          formatter: function ({ row }) {
            if (row.numa_node >= 0) {
              return row.numa_node
            }
            return '-'
          },
        },
        getSharingModeColumn(),
      ]
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        show_baremetal_isolated_devices: true,
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        guest_id: this.resId,
        with_meta: true,
        details: true,
      }
    },
  },
}
</script>
