<template>
  <a-card :bordered="false" size="small">
    <template #title>
      <dialog-selected-tips :name="$t('dictionary.identity_provider')" :count="data.length" :action="$t('system.text_246')" />
    </template>
    <dialog-table :data="data" :columns="columns" />
  </a-card>
</template>

<script>
import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'IDPDetailTable',
  props: {
    data: {
      type: Array,
      required: true,
    },
  },
  data () {
    const driverOptions = Object.keys(this.$t('idpDrivers')).reduce((prev, current) => {
      prev[current.toLowerCase()] = current
      return prev
    }, {})
    return {
      columns: [
        getNameDescriptionTableColumn({
          edit: false,
          editDesc: false,
        }),
        {
          field: 'driver',
          title: this.$t('system.text_204'),
          minWidth: 80,
          showOverflow: 'ellipsis',
          formatter: ({ cellValue }) => {
            return driverOptions[cellValue] || cellValue
          },
        },
        getCopyWithContentTableColumn({
          field: 'template',
          title: this.$t('common_550'),
          hideField: true,
          message: (row) => {
            const v = row.template || row.driver
            return this.$t('idpTmplTitles')[v] ? this.$t(`idpTmplTitles.${v}`) : v || '-'
          },
          slotCallback: (row) => {
            const v = row.template || row.driver
            return this.$t('idpTmplTitles')[v] ? this.$t(`idpTmplTitles.${v}`) : v || '-'
          },
        }),
        {
          minWidth: 120,
          field: 'project_domain',
          title: this.$t('common_548'),
          slots: {
            default: ({ row }, h) => {
              if (!row.project_domain) return this.$t('system.text_15')
              return [
                <list-body-cell-wrap copy field={'project_domain'} row={row} hideField={true} message={row.project_domain}>
                  {row.project_domain}{this.$t('dictionary.domain')}
                </list-body-cell-wrap>,
              ]
            },
          },
        },
      ],
    }
  },
}
</script>
