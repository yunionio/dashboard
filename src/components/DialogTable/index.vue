<template>
  <div class="mb-2">
    <vxe-grid
      ref="grid"
      show-overflow="title"
      highlight-hover-row
      :row-id="idKey"
      :data="cData"
      :expandConfig="expandConfig"
      :columns="tableColumns"
      :max-height="280"
      :scroll-y="{gt: 5}"
      :loading="cLoading"
      resizable
      v-on="vxeGridEvents"
      v-bind="{ ...vxeGridProps }" />
  </div>
</template>

<script>
import { Manager } from '@/utils/manager'

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
    expandConfig: {
      type: Object,
      required: false,
    },
    errors: {
      type: Object,
    },
    vxeGridProps: { // vex-grid 的属性
      type: Object,
      required: false,
    },
    vxeGridEvents: { // vex-grid 的事件
      type: Object,
      required: false,
    },
    resource: {
      type: String,
    },
    apiVersion: {
      type: String,
      default: 'v2',
    },
    params: {
      type: Object,
      default () {
        return {}
      },
    },
  },
  data () {
    return {
      cData: this.data,
      cLoading: false,
    }
  },
  computed: {
    tableColumns () {
      const ret = this.columns.map(v => { return { ...v, visible: true } })
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
    data: {
      handler (v) {
        if (v) {
          this.cData = v
        }
      },
    },
    resource: {
      handler (v) {
        if (v) {
          this.fetchResourceData(v)
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetchResourceData (res, queryParams) {
      const resManager = new Manager(this.resource, this.apiVersion)
      this.cLoading = true
      resManager.list({ params: { ...this.params } }).then((res) => {
        this.cLoading = false
        this.cData = res.data.data || []
      }).catch((err) => {
        this.cLoading = false
        console.log(err)
        throw err
      })
    },
  },
}
</script>
