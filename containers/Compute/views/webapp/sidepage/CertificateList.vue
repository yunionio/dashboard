<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions"
    :hiddenExportKeys="['description']"
    :showPage="false" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
// import { getNameFilter } from '@/utils/common/tableFilter'
import { getNameDescriptionTableColumn, getStatusTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'CertificateListForWebAppSidepage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'WebAppCertificateList',
        resource: `webapps/${this.data.id}/certificates`,
        getParams: {
        },
        // filterOptions: {
        //   name: getNameFilter(),
        // },
      }),
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          title: this.$t('table.title.name'),
          showDesc: false,
          slotCallback: row => {
            return (
              <span>{ row.name }</span>
            )
          },
        }),
        getStatusTableColumn({ statusModule: 'common' }),
        getCopyWithContentTableColumn({
          field: 'subject_name',
          title: this.$t('network.certificate_domain'),
          hiddenField: true,
          message: (row) => {
            return row.subject_name || '-'
          },
          slotCallback: (row) => {
            return row.subject_name || '-'
          },
        }),
        getCopyWithContentTableColumn({
          field: 'thumbprint',
          title: this.$t('network.thumbprint'),
          hiddenField: true,
          message: (row) => {
            return row.thumbprint || '-'
          },
          slotCallback: (row) => {
            return row.thumbprint || '-'
          },
        }),
        {
          field: 'expire_time',
          title: this.$t('network.expire_time'),
          formatter: ({ row }) => {
            if (row.expire_time) {
              return this.$moment(row.expire_time).format('YYYY-MM-DD')
            }
            return '-'
          },
        },
      ],
      singleActions: [],
      groupActions: [],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('network.text_143'),
        items: [
          { field: 'id', label: 'ID' },
          ...this.columns,
        ],
      }
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
  },
}
</script>
