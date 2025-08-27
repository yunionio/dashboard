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
import {
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  getSwitchTableColumn,
  getPublicScopeTableColumn,
  getTagTableColumn,
  getOsArch,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SystemCachedImageDetail',
  mixins: [WindowsMixin],
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
        getUserTagColumn({ onManager: this.onManager, resource: 'cachedimage', columns: () => this.columns, tipName: this.$t('compute.text_97') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'cachedimage', columns: () => this.columns, tipName: this.$t('compute.text_97') }),
        getTagTableColumn({ onManager: this.onManager, resource: 'cachedimage', columns: () => this.columns }),
        {
          field: 'project_domain',
          title: this.$t('dictionary.domain'),
          formatter: ({ row }) => {
            if (!row.domain_id) return '-'
            return <side-page-trigger permission="domains_get" name="DomainSidePage" id={row.domain_id} vm={this}>{ row.project_domain }</side-page-trigger>
          },
        },
        {
          field: 'tenant',
          title: this.$t('dictionary.project'),
          formatter: ({ row }) => {
            if (!row.tenant_id) return '-'
            return <side-page-trigger permission="projects_get" name="ProjectSidePage" id={row.tenant_id} vm={this}>{ row.tenant }</side-page-trigger>
          },
        },
        getPublicScopeTableColumn({ vm: this, resource: 'cachedimages' }),
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
            getOsArch({ field: 'info.properties.os_arch' }),
            {
              field: 'info.disk_format',
              title: this.$t('compute.text_630'),
            },
            {
              field: 'image_type',
              title: this.$t('table.title.image_type'),
              formatter: (val) => {
                return val === 'custom' ? this.$t('compute.text_620') : this.$t('compute.text_97')
              },
            },
            {
              field: 'os_lang',
              title: this.$t('compute.text_631'),
              formatter: ({ cellValue, row }) => {
                return (row.info && row.info.properties && row.info.properties.os_lang) || '-'
              },
            },
            {
              field: 'min_ram',
              title: this.$t('compute.text_632'),
              formatter: ({ row }) => {
                return sizestr(row.info.min_ram_mb, 'M', 1024)
              },
            },
            {
              field: 'min_disk',
              title: this.$t('compute.text_633'),
              formatter: ({ cellValue, row }) => {
                return sizestr(row.info.min_disk_mb, 'M', 1024)
              },
            },
            {
              field: 'disk_driver',
              title: this.$t('compute.text_634'),
              formatter: ({ cellValue, row }) => {
                return (row.info && row.info.properties && row.info.properties.disk_driver) || '-'
              },
            },
            {
              field: 'net_driver',
              title: this.$t('compute.text_635'),
              formatter: ({ cellValue, row }) => {
                return (row.info && row.info.properties && row.info.properties.net_driver) || '-'
              },
            },
            {
              field: 'uefi_support',
              title: this.$t('compute.text_1155'),
              formatter: ({ cellValue, row }) => {
                if (row.info && row.info.properties && row.info.properties.uefi_support === 'true') {
                  return 'UEFI'
                } else {
                  return 'BIOS'
                }
              },
            },
            {
              field: 'vdi_protocol',
              title: this.$t('compute.vdi_protocol'),
              formatter: ({ cellValue, row }) => {
                return (row.info && row.info.properties && row.info.properties.vdi_protocol) || '-'
              },
            },
            {
              field: 'hypervisor',
              title: this.$t('compute.text_636'),
            },
          ],
        },
        {
          title: this.$t('compute.title.encryption'),
          items: [
            {
              field: 'encrypt_key_id',
              title: this.$t('compute.title.encryption_key'),
              formatter: ({ callValue, row }) => {
                if (row.encrypt_key_id) {
                  if (row.encrypt_key && row.encrypt_alg) {
                    return row.encrypt_key + ' (' + row.encrypt_key_id + ')'
                  } else {
                    return row.encrypt_key_id
                  }
                } else {
                  return this.$t('compute.no_encryption')
                }
              },
            },
            {
              field: 'encrypt_alg',
              title: this.$t('compute.title.encrypt_alg'),
              formatter: ({ callValue, row }) => {
                if (row.encrypt_alg) {
                  return row.encrypt_alg.toUpperCase()
                } else {
                  return '-'
                }
              },
            },
            {
              field: 'encrypt_key_user',
              title: this.$t('compute.title.encrypt_key_user'),
              formatter: ({ callValue, row }) => {
                if (row.encrypt_key_user) {
                  return row.encrypt_key_user + ' / ' + row.encrypt_key_user_domain
                } else {
                  return '-'
                }
              },
            },
          ],
        },
        // {
        //   title: this.$t('compute.text_637'),
        //   field: 'cloudy_mirroring',
        //   slots: {
        //     default: ({ row }, h) => {
        //       return [
        //         <vxe-grid class="mb-2" data={ this.imgSubformat } columns={ this.imageColumns } />,
        //       ]
        //     },
        //   },
        // },
        {
          title: this.$t('compute.text_497'),
          items: [
            getSwitchTableColumn({
              field: 'protected',
              title: this.$t('common.text00076'),
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
      new this.$Manager('cachedimages', 'v1').getSpecific({
        id: this.data.id,
        spec: 'subformats',
      }).then(({ data }) => {
        this.imgSubformat = data
      })
    },
  },
}
</script>
