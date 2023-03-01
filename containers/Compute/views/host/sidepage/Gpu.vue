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
    this.$D = new this.$Manager('servers', 'v1')
    this.init()
  },
  methods: {
    getParam () {
      const ret = {
        // gpu: true,
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        host: this.resId,
      }
      return ret
    },
    async init () {
      await this.initUsbOptions()
      await this.list.fetchData()
    },
    async initUsbOptions () {
      console.log(123)
      try {
        const acttachedRes = await new this.$Manager('isolated_devices', 'v2').list({
          params: {
            guest_id: this.resId,
          },
        })
        const { data: acttachedList = [] } = acttachedRes.data
        const probleDevRes = await this.$D.performAction({
          id: this.resId,
          action: 'probe-isolated-devices',
        })

        const { data: probleDevList = [] } = probleDevRes
        const device = acttachedList.filter(item => {
          return item.dev_type === 'USB'
        }).map(item => {
          return item.id
        })
        this.bindUsbs = device
        this.form.fc.setFieldsValue({
          device,
        })
        const usbOptions = acttachedList.concat(probleDevList).filter(item => {
          return item.dev_type === 'USB'
        }).map(item => {
          return {
            key: item.id,
            id: item.id,
            name: `${item.addr || ''} ${item.model || ''}`,
          }
        })
        usbOptions.sort((a, b) => {
          return a.key - b.key
        })
        this.usbOptions = usbOptions
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
