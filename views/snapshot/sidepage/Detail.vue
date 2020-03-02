<template>
  <detail
    :on-manager="onManager"
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
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'size',
          title: '容量',
          formatter: ({ cellValue, row }) => {
            return sizestr(cellValue, 'M', 1024)
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
  },
}
</script>
