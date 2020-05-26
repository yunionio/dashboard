<template>
  <detail
    :data="data"
    :on-manager="onManager"
    :base-info="baseInfo" />
</template>

<script>
import { STRATEGY_CN } from '@Cloudenv/constants/sched'
import { getEnabledTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'SchedpolicyDetail',
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
        getEnabledTableColumn(),
        {
          field: 'resource_type',
          title: '资源类型',
        },
        getCopyWithContentTableColumn({
          field: 'schedtag',
          title: '标签(调度标签)',
          hideField: true,
          slotCallback: row => {
            if (!row.schedtag) return '-'
            return [<side-page-trigger onTrigger={ () => this.handleOpenSchedtagDetail(row.schedtag_id) }>{ row.schedtag }</side-page-trigger>]
          },
        }),
        {
          field: 'strategy',
          title: '偏好',
          formatter: ({ row }) => STRATEGY_CN[row.strategy] || '无',
        },
        {
          field: 'condition',
          title: '条件',
          minWidth: 70,
          showOverflow: 'title',
          slots: {
            default: ({ row }, h) => {
              return [
                <div class='text-truncate' title={ row.condition }>
                  { row.condition }
                </div>,
              ]
            },
          },
        },
      ],
    }
  },
  methods: {
    handleOpenSchedtagDetail (id) {
      this.$emit('init-side-page-tab', 'schedtag-detail')
      this.$emit('side-page-trigger-handle', this, 'SchedtagSidePage', {
        id,
        resource: 'schedtags',
        apiVersion: 'v2',
      }, {
        cancel: () => {
          this.$emit('single-refresh', this.data.id)
        },
      })
    },
  },
}
</script>
