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
  getCopyWithContentTableColumn,
  getStatusTableColumn,
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
        getCopyWithContentTableColumn({
          title: this.$t('table.title.res_name'),
          field: 'obj_name',
          formatter ({ row }) {
            return row.obj_name
          },
        }),
        getCopyWithContentTableColumn({
          title: this.$t('table.title.task_name'),
          field: 'task_name',
          formatter ({ row }) {
            return row.task_name
          },
        }),
      ],
    }
  },
}
</script>
