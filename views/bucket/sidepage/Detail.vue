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
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'

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
  created () {
    this.fetchSync()
  },
  render () {
    return (
      <div>{ this.$t('storage.text_172') } <a onClick={this.fetchSync}><a-icon type="sync" spin={this.loading} /></a></div>
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
        getUserTagColumn({ onManager: this.onManager, resource: 'bucket', columns: () => this.columns, tipName: this.$t('storage.text_18') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'bucket', columns: () => this.columns, tipName: this.$t('storage.text_18') }),
        getPublicScopeTableColumn({ vm: this, resource: 'buckets' }),
        getBrandTableColumn(),
        getCopyWithContentTableColumn({
          field: 'cloudregion',
          title: this.$t('storage.text_47'),
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
          title: this.$t('storage.text_38'),
        },
      ],
      extraInfo: [
        {
          title: this.$t('storage.text_139'),
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
                  title: this.$t('storage.text_140'),
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
              title: this.$t('storage.text_141'),
              formatter: ({ row }) => {
                return sizestrWithUnit(row.size_bytes, 'B', 1024)
              },
            },
            {
              field: 'object_cnt',
              title: this.$t('storage.text_142'),
              formatter: ({ row }) => {
                return this.$t('storage.text_143', [row.object_cnt || 0])
              },
            },
          ],
        },
        {
          title: this.$t('storage.text_144'),
          items: [
            {
              field: 'size_bytes_limit',
              title: this.$t('storage.text_59'),
              formatter: ({ row }) => {
                if (row.size_bytes_limit > 0) {
                  return sizestrWithUnit(row.size_bytes_limit, 'B', 1024)
                } else {
                  return this.$t('storage.text_145')
                }
              },
            },
            {
              field: 'object_cnt_limit',
              title: this.$t('storage.text_135'),
              formatter: ({ row }) => {
                if (row.object_cnt_limit > 0) {
                  return this.$t('storage.text_146', [row.object_cnt_limit])
                } else {
                  return this.$t('storage.text_145')
                }
              },
            },
          ],
        },
        {
          title: this.$t('storage.text_147'),
          items: [
            {
              field: 'acl',
              title: this.$t('storage.text_93'),
              slots: {
                default: ({ row }, h) => {
                  return [
                    <span>{ ACL_TYPE[row.acl] || row.acl }</span>,
                    <a onClick={() => this.handleSetAcl(row)} class='ml-2'>{ this.$t('common.setting') }</a>,
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
        title: this.$t('storage.text_138'),
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
