<template>
  <detail
    :list="list"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    statusModule="bucket" />
</template>

<script>
// import BrandIcon from '@/sections/BrandIcon'
import { ACL_TYPE } from '@Storage/constants/index.js'
import { sizestrWithUnit } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BucketDetail',
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
    columns: {
      type: Array,
      required: true,
    },
  },
  data () {
    const RenderSizeTitle = () => {
      return <div>用量统计 <a onClick={this.fetchSync}><a-icon type="redo" /></a></div>
    }
    return {
      baseInfo: [
        {
          field: 'storage_class',
          title: '存储类型',
        },
        {
          field: 'account',
          title: '云账号',
        },
      ],
      extraInfo: [
        {
          title: '访问域名',
          field: 'url',
          slots: {
            default: ({ row }, h) => {
              if (!this.data.access_urls) {
                return '-'
              }
              const columns = [
                {
                  field: 'url',
                  title: 'URL',
                  slots: {
                    default: ({ row }) => {
                      return [
                        <div>
                          <a href={row.url}>{row.url}</a>
                          <copy class="ml-1" message={row.url} />
                        </div>]
                    },
                  },
                },
                {
                  field: 'description',
                  title: '描述',
                },
              ]
              return [
                <vxe-grid class="mb-2" data={ this.data.access_urls || [] } columns={ columns } />,
              ]
            },
          },
        },
        {
          title: <RenderSizeTitle />,
          items: [
            {
              field: 'size_bytes',
              title: '容量上限',
              formatter: ({ row }) => {
                return sizestrWithUnit(row.size_bytes, 'B', 1024)
              },
            },
            {
              field: 'object_cnt',
              title: '文件数量',
              formatter: ({ row }) => {
                return `${row.object_cnt || 0} 个`
              },
            },
          ],
        },
        {
          title: '用量上限',
          items: [
            {
              field: 'size_bytes_limit',
              title: '容量上限',
              formatter: ({ row }) => {
                if (row.size_bytes_limit > 0) {
                  return sizestrWithUnit(row.size_bytes_limit, 'B', 1024)
                } else {
                  return '无限制'
                }
              },
            },
            {
              field: 'object_cnt_limit',
              title: '文件数量上限',
              formatter: ({ row }) => {
                if (row.object_cnt_limit > 0) {
                  return `${row.object_cnt_limit}个`
                } else {
                  return '无限制'
                }
              },
            },
          ],
        },
        {
          title: '访问权限',
          items: [
            {
              field: 'acl',
              title: '读写权限',
              slots: {
                default: ({ row }) => {
                  return [
                    ACL_TYPE[row.acl] || row.acl,
                    <a-button onClick={() => this.handleSetAcl(row)} type="link">设置</a-button>,
                  ]
                },
              },
            },
          ],
        },
      ],
    }
  },
  methods: {
    async fetchSync () {
      const manager = new this.$Manager('buckets')
      try {
        await manager.performAction({
          id: this.data.id,
          action: 'sync',
          data: {
            stats_only: true,
          },
        })
      } catch (err) {
        throw err
      }
    },
    handleSetAcl (row) {
      this.createDialog('ObjectsUpdateAclDialog', {
        title: '设置读写权限',
        data: [row],
        resName: row.name,
        columns: this.list.templateContext.columns,
        list: this.list,
      })
    },
  },
}
</script>
