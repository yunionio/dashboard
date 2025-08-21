<template>
  <detail
    :on-manager="onManager"
    :data="{ ...data, name: data.hostname }"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :hidden-keys="['status', 'brand', 'name', 'description', 'created_at', 'updated_at']" />
</template>

<script>

// import {
// // getBrandTableColumn,
// } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CdnDetail',
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
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'min_tls_version',
          title: this.$t('network.cdn.min_tls_version'),
          formatter: ({ row }) => {
            return row.ssl?.settings?.min_tls_version ? `TLS ${row.ssl?.settings?.min_tls_version}` : '-'
          },
        },
        {
          field: 'certificate_type',
          title: this.$t('network.cdn.certificate_type'),
          formatter: ({ row }) => {
            return row.ssl?.type === 'dv' ? this.$t('network.cdn.certificate_type_cloudflare') : this.$t('network.cdn.certificate_type_custom')
          },
        },
        {
          field: 'custom_certificate',
          title: this.$t('network.cdn.certificate_type_custom'),
          slots: {
            default: ({ row }, h) => {
              return row.ssl?.custom_certificate ? <a-textarea rows={5} value={row.ssl?.custom_certificate || '-'} /> : '-'
            },
          },
        },
        {
          field: 'bundle_method',
          title: this.$t('network.cdn.bundle_method'),
          formatter: ({ row }) => {
            return row.ssl?.bundle_method ? this.$t(`network.cdn.bundle_method.${row.ssl?.bundle_method}`) : '-'
          },
        },
        {
          field: 'private_key',
          title: this.$t('network.cdn.custom_key'),
          slots: {
            default: ({ row }, h) => {
              return row.ssl?.private_key ? <a-textarea rows={5} value={row.ssl?.private_key || '-'} /> : '-'
            },
          },
        },
        {
          field: 'certificate_authority',
          title: this.$t('network.cdn.certificate_authority'),
          formatter: ({ row }) => {
            return row.ssl?.certificate_authority || '-'
          },
        },
        {
          field: 'method',
          title: this.$t('network.cdn.ceritificate_verify_method'),
          formatter: ({ row }) => {
            return row.ssl?.method ? this.$t(`network.cdn.certificate_verify_method.${row.ssl?.method}`) : '-'
          },
        },
        {
          field: 'wildcard',
          title: this.$t('network.cdn.wildcard_enabled'),
          formatter: ({ row }) => {
            return row.ssl?.wildcard ? this.$t('network.text_189') : this.$t('network.text_190')
          },
        },
        {
          field: 'custom_origin_server',
          title: this.$t('network.cdn.origin_server'),
          formatter: ({ row }) => {
            return row.custom_origin_server || this.$t('network.cdn.origin_server.default')
          },
        },
      ],
      extraInfo: [{
        title: this.$t('network.text_308'),
        items: [
          {
            slots: {
              default: ({ row }, h) => {
                const columns = [
                  {
                    field: 'type',
                    title: this.$t('network.text_249'),
                  },
                  {
                    field: 'name',
                    title: this.$t('network.text_21'),
                  },
                  {
                    field: 'value',
                    title: this.$t('network.value'),
                  },
                ]
                const data = []
                if (row.ssl?.validation_records) {
                  row.ssl.validation_records.forEach(item => {
                    data.push({
                      type: this.$t('network.cdn.certificate_verification_txt'),
                      name: item.txt_name,
                      value: item.txt_value,
                    })
                  })
                }
                if (row.ownership_verification) {
                  data.push({
                    type: this.$t('network.cdn.hostname_verification_txt'),
                    name: row.ownership_verification.name,
                    value: row.ownership_verification.value,
                  })
                }
                return <vxe-grid data={data} resizable columns={columns} />
              },
            },
          },
        ],
      }],
    }
  },
}
</script>
