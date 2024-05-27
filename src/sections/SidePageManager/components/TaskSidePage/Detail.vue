<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    :showName="false"
    status-module="parentTaskStatus"
    resource="cloud-phone-tasks" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getStatusTableColumn,
  getObjTypeTableColumn,
  getTaskNameTableColumn,
} from '@/utils/common/tableColumn'

export default {
  name: 'TaskDetail',
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
          title: this.$t('table.title.progress'),
          field: 'progress',
          formatter ({ row }) {
            return row.progress + '%'
          },
        },
        getStatusTableColumn({
          title: this.$t('table.title.stage'),
          minWidth: 80,
          field: 'stage',
          statusModule: 'parentTaskStage',
        }),
        getObjTypeTableColumn(),
        getTaskNameTableColumn(),
      ],
    }
  },
}
</script>
