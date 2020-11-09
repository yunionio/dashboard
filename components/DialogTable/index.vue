<template>
  <div class="mb-2">
    <vxe-grid
      ref="grid"
      show-overflow="title"
      highlight-hover-row
      :row-id="idKey"
      :data="data"
      :columns="tableColumns"
      :max-height="280"
      :scroll-y="{gt: 5}"
      v-bind="{ ...vxeGridProps }" />
  </div>
</template>

<script>
export default {
  name: 'DialogTable',
  props: {
    idKey: {
      type: String,
      default: 'id',
    },
    data: {
      type: Array,
      required: true,
      default: () => ([]),
    },
    columns: {
      type: Array,
      required: true,
      default: () => ([]),
    },
    errors: {
      type: Object,
    },
    vxeGridProps: { // vex-grid 的属性
      type: Object,
      required: false,
    },
  },
  computed: {
    tableColumns () {
      const ret = [...this.columns]
      if (this.errors) {
        ret.push({
          field: '_result',
          title: this.$t('table.title.exec_result'),
          width: 100,
          slots: {
            default: ({ row }) => {
              if (this.errors[row[this.idKey]]) {
                return [
                  <a-tooltip title={ this.errors[row[this.idKey]].detail }>
                    <a-icon class='error-color' type='close-circle' style={{ fontSize: '14px' }} />
                  </a-tooltip>,
                ]
              }
              return [
                <a-tooltip title={ this.$t('message.exec_success') }>
                  <a-icon class='success-color' type='check-circle' style={{ fontSize: '14px' }} />
                </a-tooltip>,
              ]
            },
          },
        })
      }
      return ret
    },
  },
  watch: {
    errors (val) {
      this.$nextTick(() => {
        if (val) {
          const firstErrorId = Object.keys(val)[0]
          if (firstErrorId) {
            this.$refs.grid.scrollToRow(this.$refs.grid.getRowById(firstErrorId))
          }
        }
      })
    },
  },
}
</script>
