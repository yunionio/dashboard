<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="storages"
    statusModule="blockstorage" />
</template>

<script>
// import BrandIcon from '@/sections/BrandIcon'
import { STORAGE_TYPES, MEDIUM_TYPES } from '@Storage/constants/index.js'
import { sizestr } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BlockStorageDetail',
  mixins: [WindowsMixin],
  props: {
    list: {
      type: Object,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'storage_type',
          title: '存储类型',
          slots: {
            default: ({ row }) => {
              return STORAGE_TYPES[row.storage_type] || '-'
            },
          },
        },
        {
          field: 'medium_type',
          title: '介质类型 ',
          slots: {
            default: ({ row }) => {
              return MEDIUM_TYPES[row.medium_type] || '-'
            },
          },
        },
      ],
    }
  },
  computed: {
    extraInfo () {
      const _extraInfo = [
        {
          title: '用量统计',
          items: [
            {
              field: 'capacity',
              title: '实际容量',
              slots: {
                default: ({ row }) => {
                  return this._sizestr(row.capacity)
                },
              },
            },
            {
              field: 'virtual_capacity',
              title: '虚拟容量',
              slots: {
                default: ({ row }) => {
                  return this._sizestr(row.virtual_capacity)
                },
              },
            },
            {
              field: 'used_capacity',
              title: '分配',
              slots: {
                default: ({ row }) => {
                  return this._sizestr(row.used_capacity)
                },
              },
            },
            {
              field: 'reserved',
              title: '预留',
              slots: {
                default: ({ row }) => {
                  return this._sizestr(row.reserved)
                },
              },
            },
            {
              field: 'waste_capacity',
              title: '浪费',
              slots: {
                default: ({ row }) => {
                  return this._sizestr(row.waste_capacity)
                },
              },
            },
          ],
        },
      ]
      if (this.data.storage_type === 'rbd') {
        return _extraInfo.concat({
          title: '配置信息',
          items: [
            {
              field: 'storage_conf.mon_host',
              title: 'Ceph Mon Host',
            },
            {
              field: 'storage_conf.key',
              title: 'Ceph Key',
            },
            {
              field: 'storage_conf.pool',
              title: 'Ceph Pool',
            },
          ],
        })
      }
      return _extraInfo
    },
  },
  methods: {
    _sizestr (value) {
      if (!value) return '-'
      return sizestr(value, 'M', 1024)
    },
  },
}
</script>
