<template>
  <detail
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
import { getEnabledTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'DynamicschedtagDetail',
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
          title: this.$t('cloudenv.text_384'),
        },
        getCopyWithContentTableColumn({
          field: 'schedtag',
          title: this.$t('cloudenv.text_385'),
          hideField: true,
          slotCallback: row => {
            if (!row.schedtag) return '-'
            return [<side-page-trigger onTrigger={ () => this.handleOpenSchedtagDetail(row.schedtag_id) }>{ row.schedtag }</side-page-trigger>]
          },
        }),
        {
          field: 'condition',
          title: this.$t('cloudenv.text_22'),
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
