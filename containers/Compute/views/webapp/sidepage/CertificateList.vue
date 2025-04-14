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
import { getNameDescriptionTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

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
        {
          field: 'status',
          title: this.$t('compute.text_268'),
          slots: {
            default: ({ row }) => {
              const { expire_time } = row
              if (expire_time) {
                const time = new Date(expire_time).getTime() - new Date('2024-03-27 08:00:00')
                return time > 0 ? [<status specifyStatus={{ class: 'status-success', text: this.$t('compute.status_normal') }} />] : [<status specifyStatus={{ class: 'status-danger', text: this.$t('compute.status_expired') }} />]
              }
              return '-'
            },
          },
          formatter: ({ row }) => {
            const { expire_time } = row
            if (expire_time) {
              const time = new Date(expire_time).getTime() - new Date('2024-03-27 08:00:00')
              return time > 0 ? this.$t('compute.status_normal') : this.$t('compute.status_expired')
            }
            return '-'
          },
        },
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
        hiddenFields: ['status'],
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
