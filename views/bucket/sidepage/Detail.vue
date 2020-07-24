<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    statusModule="bucket"
    resource="buckets" />
</template>

<script>
// import BrandIcon from '@/sections/BrandIcon'
import { ACL_TYPE } from '@Storage/constants/index.js'
import { sizestrWithUnit } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'
import {
  getBrandTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

const RenderSizeTitle = {
  props: ['data'],
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async fetchSync () {
      const manager = new this.$Manager('buckets')
      this.loading = true
      try {
        const { data } = await manager.performAction({
          id: this.data.id,
          action: 'sync',
          data: {
            stats_only: true,
          },
        })
        this.data.size_bytes = data.size_bytes
        this.data.object_cnt = data.object_cnt
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
  render () {
    return (
      <div>用量统计 <a onClick={this.fetchSync}><a-icon type="sync" spin={this.loading} /></a></div>
    )
  },
}
export default {
  name: 'BucketDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    refresh: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    columns: {
      type: Array,
    },
  },
  data () {
    return {
      syncLoading: false,
      baseInfo: [
        getBrandTableColumn(),
        getCopyWithContentTableColumn({
          field: 'cloudregion',
          title: '区域',
          hideField: true,
          slotCallback: row => {
            if (!row.cloudregion) return '-'
            return [
              <side-page-trigger permission='areas_get' name='CloudregionSidePage' id={row.cloudregion_id} vm={this}>{ row.cloudregion }</side-page-trigger>,
            ]
          },
        }),
        {
          field: 'storage_class',
          title: '存储类型',
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
          title: <RenderSizeTitle data={this.data} />,
          items: [
            {
              field: 'size_bytes',
              title: '存储用量',
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
    handleSetAcl (row) {
      this.createDialog('ObjectsUpdateAclDialog', {
        title: '设置读写权限',
        data: [row],
        bucket: row,
        resName: row.name,
        columns: this.columns,
        list: this.list,
        refresh: this.refresh,
      })
    },
  },
}
</script>
