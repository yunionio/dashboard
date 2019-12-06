<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="snapshot" />
</template>

<script>
import { CREATE_METHODS } from '../constants'
import { sizestr } from '@/utils/utils'

export default {
  name: 'SnapshotDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    list: {
      type: Object,
      required: true,
    },
    type: {
      type: String,
      default: 'disk',
      validator: val => ['disk', 'instance'].includes(val),
    },
  },
  data () {
    const isInstanceSnapshot = this.type === 'instance'
    const detailData = {
      baseInfo: [
        {
          field: 'size',
          title: '容量',
          formatter: ({ cellValue, row }) => {
            if (isInstanceSnapshot) {
              const size = row.snapshots.reduce((a, b) => {
                return a.size + b.size
              }, { size: 0 })
              return sizestr(size, 'M', 1024)
            } else {
              return sizestr(cellValue, 'M', 1024)
            }
          },
        },
        {
          field: 'created_by',
          title: '创建方式',
          formatter: ({ cellValue }) => {
            return CREATE_METHODS[cellValue]
          },
        },
        {
          field: 'resource',
          title: '快照类别',
          formatter: ({ cellValue }) => {
            return '硬盘快照'
          },
        },
        {
          field: 'guest',
          title: '主机',
          slots: {
            default: ({ row }, h) => {
              if (row.guest) {
                return [
                  <div>
                    {row.guest}
                    {row.guest_status ? <status status={ row['guest_status'] } statusModule='server'/> : ''}
                  </div>,
                ]
              }
              return [<div>-</div>]
            },
          },
        },
        {
          field: 'disk_type',
          title: '磁盘属性',
          formatter: ({ cellValue }) => {
            return cellValue === 'sys' ? '系统盘' : '数据盘'
          },
          hidden: isInstanceSnapshot,
        },
        {
          field: 'disk',
          title: '硬盘',
          slots: {
            default: ({ row }, h) => {
              if (row.disk_status) {
                return [
                  <div>
                    {row.disk_name}
                    {row.disk_status ? <status status={ row['disk_status'] } statusModule='disk'/> : ''}
                  </div>,
                ]
              }
              return [<div>-</div>]
            },
          },
          hidden: isInstanceSnapshot,
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'region',
              title: '区域',
            },
          ],
        },
      ],
    }
    if (isInstanceSnapshot) {
      const hiddenFields = ['disk_type', 'disk']
      detailData.baseInfo = detailData.baseInfo.filter((item) => { return !hiddenFields.includes(item.field) })
    }
    return detailData
  },
}
</script>
