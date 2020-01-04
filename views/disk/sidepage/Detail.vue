<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="disk" />
</template>

<script>
import { MEDIUM_MAP } from '../../../constants'
import { sizestr } from '@/utils/utils'

export default {
  name: 'DiskDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    list: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'disk_size',
          title: '容量',
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'M', 1024)
          },
        },
        {
          field: 'disk_type',
          title: '磁盘类型',
          formatter: ({ cellValue }) => {
            return cellValue === 'sys' ? '系统盘' : '数据盘'
          },
        },
        {
          field: 'disk_format',
          title: '格式',
        },
        {
          field: 'medium_type',
          title: '介质类型',
          formatter: ({ cellValue }) => {
            return MEDIUM_MAP[cellValue]
          },
        },
        {
          field: 'guest',
          title: '主机',
          slots: {
            default: ({ row }, h) => {
              return [
                <div>
                  {row.guest}
                  {row.guest_status ? <status status={ row['guest_status'] } statusModule='server'/> : '-'}
                </div>,
              ]
            },
          },
        },
        {
          field: 'id',
          title: '存储',
        },
      ],
      extraInfo: [
        {
          title: '其他信息',
          items: [
            {
              field: 'zone',
              title: '区域',
            },
            {
              field: 'public_scope',
              title: '项目',
            },
          ],
        },
      ],
    }
  },
}
</script>
