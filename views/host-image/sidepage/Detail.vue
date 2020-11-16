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
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import { sizestr } from '@/utils/utils'
import { getStatusTableColumn, getCopyWithContentTableColumn, getSwitchTableColumn, getPublicScopeTableColumn, getOsArch } from '@/utils/common/tableColumn'

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
    columns: Array,
  },
  data () {
    return {
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'guestimage', columns: () => this.columns, tipName: this.$t('dictionary.guestimage') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'guestimage', columns: () => this.columns, tipName: this.$t('dictionary.guestimage') }),
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
          title: this.$t('compute.text_175'),
          formatter: ({ cellValue, row }) => {
            return isStandard(row.is_standard) ? this.$t('compute.text_620') : this.$t('compute.text_621')
          },
        },
        {
          field: 'child_image',
          title: this.$t('table.title.child_image'),
          width: 150,
          slots: {
            default: ({ row }) => {
              const arr = [...(row.data_images || [])]
              arr.push(row.root_image.name)
              return <a onClick={ () => this.$emit('tab-change', 'children-image-list') }>{arr.length}</a>
            },
          },
        },
        {
          field: 'size',
          title: this.$t('compute.text_377'),
          formatter: ({ cellValue, row }) => {
            return sizestr(cellValue, 'B', 1024)
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('compute.text_629'),
          items: [
            getOsArch(),
            {
              field: 'disk_format',
              title: this.$t('compute.text_630'),
            },
            {
              field: 'os_lang',
              title: this.$t('compute.text_631'),
              formatter: ({ cellValue, row }) => {
                return (row.properties && row.properties.os_lang) || '-'
              },
            },
            {
              field: 'min_ram',
              title: this.$t('compute.text_632'),
              formatter: ({ cellValue, row }) => {
                return sizestr(cellValue, 'M', 1024)
              },
            },
            {
              field: 'min_disk',
              title: this.$t('compute.text_633'),
              formatter: ({ cellValue, row }) => {
                return sizestr(cellValue, 'M', 1024)
              },
            },
            {
              field: 'disk_driver',
              title: this.$t('compute.text_634'),
              formatter: ({ cellValue, row }) => {
                return (row.properties && row.properties.disk_driver) || '-'
              },
            },
            {
              field: 'net_driver',
              title: this.$t('compute.text_635'),
              formatter: ({ cellValue, row }) => {
                return (row.properties && row.properties.net_driver) || '-'
              },
            },
            {
              field: 'hypervisor',
              title: this.$t('compute.text_636'),
            },
          ],
        },
        {
          title: this.$t('compute.text_637'),
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
          title: this.$t('compute.text_497'),
          items: [
            getSwitchTableColumn({
              field: 'protected',
              title: this.$t('compute.text_372'),
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
          title: this.$t('compute.text_638'),
        }),
        {
          field: 'format',
          title: this.$t('compute.text_398'),
        },
        {
          field: 'size',
          title: this.$t('compute.text_377'),
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
