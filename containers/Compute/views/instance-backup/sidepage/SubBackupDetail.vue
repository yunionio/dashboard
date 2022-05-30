<template>
  <vxe-grid class="mb-2" :data="data.disk_backups" :columns="columns" :resizable="true" />
</template>

<script>
import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getDiskSizeTableColumn,
  getDiskTypeTableColumn,
  getSizeMbTableColumn,
} from '../../disk-backup/utils/columns'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'SubBackupDetail',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      columns: [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          addEncrypt: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
            )
          },
        }),
        getStatusTableColumn({ statusModule: 'diskBackup' }),
        getDiskTypeTableColumn(),
        getDiskSizeTableColumn(),
        getSizeMbTableColumn(),
        getTimeTableColumn(),
      ],
    }
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DiskBackupSidePage', {
        id: row.id,
        resource: 'diskbackups',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.diskBackup).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
