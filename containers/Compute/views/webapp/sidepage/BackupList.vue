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
import { getTimeTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'BackupListForWebAppSidepage',
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
        id: 'WebAppBackupList',
        resource: `webapps/${this.data.id}/backups`,
        getParams: {
        },
        // filterOptions: {
        //   name: getNameFilter(),
        // },
      }),
      columns: [
        getTimeTableColumn({ field: 'name', title: this.$t('network.time') }),
        {
          field: 'type',
          title: this.$t('network.text_249'),
          formatter: ({ row }) => {
            if (row.type) {
              return row.type === 'auto' ? this.$t('network.backup.auto') : this.$t('network.backup.hand')
            }
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
        title: this.$t('common.backup'),
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
