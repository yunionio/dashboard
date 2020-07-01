<template>
  <detail
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :on-manager="onManager"
    :resource="resource"
    status-module="image" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getStatusTableColumn, getCopyWithContentTableColumn, getSwitchTableColumn, getPublicScopeTableColumn } from '@/utils/common/tableColumn'

const isStandard = status => status === true || status === 'true'
export default {
  name: 'HostImageDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
    resource: String,
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'project_domain',
          title: this.$t('dictionary.domain'),
          formatter: ({ row }) => {
            return <side-page-trigger permission="domains_get" name="DomainSidePage" id={row.domain_id} vm={this}>{ row.project_domain }</side-page-trigger>
          },
        },
        {
          field: 'tenant',
          title: this.$t('dictionary.project'),
          formatter: ({ row }) => {
            return <side-page-trigger permission="projects_get" name="ProjectSidePage" id={row.tenant_id} vm={this}>{ row.tenant }</side-page-trigger>
          },
        },
        getPublicScopeTableColumn({ vm: this, resource: 'guestimages' }),
        {
          field: 'type',
          title: '类型',
          formatter: ({ cellValue, row }) => {
            return isStandard(row.is_standard) ? '公共镜像' : '自定义镜像'
          },
        },
        {
          field: 'child_image',
          title: '子镜像',
          width: 150,
          slots: {
            default: ({ row }) => {
              const arr = [...(row.data_images || [])]
              arr.push(row.root_image.name)
              return <a onClick={ () => this.$emit('tab-change', 'children-image-list') }>{arr.length}个</a>
            },
          },
        },
        {
          field: 'size',
          title: '大小',
          formatter: ({ cellValue, row }) => {
            return sizestr(cellValue, 'B', 1024)
          },
        },
      ],
      extraInfo: [
        {
          title: '镜像属性',
          items: [
            {
              field: 'disk_format',
              title: '磁盘格式',
            },
            {
              field: 'os_lang',
              title: '系统语言',
              formatter: ({ cellValue, row }) => {
                return (row.properties && row.properties.os_lang) || '-'
              },
            },
            {
              field: 'min_ram',
              title: '最小内存要求',
              formatter: ({ cellValue, row }) => {
                return sizestr(cellValue, 'M', 1024)
              },
            },
            {
              field: 'min_disk',
              title: '最小磁盘要求',
              formatter: ({ cellValue, row }) => {
                return sizestr(cellValue, 'M', 1024)
              },
            },
            {
              field: 'disk_driver',
              title: '磁盘驱动',
              formatter: ({ cellValue, row }) => {
                return (row.properties && row.properties.disk_driver) || '-'
              },
            },
            {
              field: 'net_driver',
              title: '网卡驱动',
              formatter: ({ cellValue, row }) => {
                return (row.properties && row.properties.net_driver) || '-'
              },
            },
            {
              field: 'hypervisor',
              title: '应用平台',
            },
          ],
        },
        {
          title: '多云镜像',
          field: 'cloudy_mirroring',
          slots: {
            default: ({ row }, h) => {
              return [
                <vxe-grid class="mb-2" data={ this.imgSubformat } columns={ this.imageColumns } />,
              ]
            },
          },
        },
        {
          title: '其他信息',
          items: [
            getSwitchTableColumn({
              field: 'protected',
              title: '删除保护',
              change: val => {
                this.onManager('update', {
                  id: this.data.id,
                  managerArgs: {
                    data: { protected: val },
                  },
                })
              },
            }),
          ],
        },
      ],
      imageColumns: [
        getCopyWithContentTableColumn({
          field: 'checksum',
          title: '校验和',
        }),
        {
          field: 'format',
          title: '格式',
        },
        {
          field: 'size',
          title: '大小',
          formatter: ({ cellValue, row }) => {
            return sizestr(cellValue, 'B', 1024)
          },
        },
        getStatusTableColumn({ statusModule: 'image' }),
      ],
      imgSubformat: [],
    }
  },
  created () {
    // this.updateDetailData()
  },
  methods: {
    updateDetailData () {
      new this.$Manager('images', 'v1').getSpecific({
        id: this.data.id,
        spec: 'subformats',
      }).then(({ data }) => {
        this.imgSubformat = data
      })
    },
  },
}
</script>
