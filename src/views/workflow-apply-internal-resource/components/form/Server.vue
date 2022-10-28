<template>
  <div>
    <vxe-grid
      ref="serverTable"
      size="mini"
      border
      :columns="columns"
      :data="dataList" />
    <a-button class="mt-2" type="link" @click="handleAddData">{{$t('wz_workflow_form.actions.add_line')}}</a-button>
  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import { COLUMNS_MAP } from '../../constants'

export default {
  name: 'WorkflowApplyInternalServerInfo',
  components: {
  },
  mixins: [WindowsMixin],
  props: {
    form: {
      require: true,
      type: Object,
    },
  },
  data () {
    return {
      columns: [
        ...COLUMNS_MAP.server,
        {
          field: '_action',
          title: this.$t('table.title._action'),
          minWidth: '100px',
          slots: {
            default: (row) => {
              return [<a-button type="link" onClick={() => { this.deleteLine(row) }}>{this.$t('table.action.delete')}</a-button>]
            },
          },
        },
      ],
    }
  },
  computed: {
    dataList () {
      return this.form.server || []
    },
  },
  methods: {
    handleAddData () {
      this.createDialog('WorkflowAddInfoDialog', {
        resourceType: 'server',
        ok: (data) => {
          this.form.server.push(data)
        },
      })
    },
    deleteLine (row) {
      const { seq } = row
      this.form.server = this.form.server.filter((item, index) => {
        return seq - 1 !== index
      })
    },
  },
}
</script>
