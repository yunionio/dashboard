<template>
  <div>
    <vxe-grid
      ref="rdsTable"
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
  name: 'WorkflowApplyInternalRdsInfo',
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
        ...COLUMNS_MAP.rds,
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
      return this.form.rds || []
    },
  },
  methods: {
    handleAddData () {
      this.createDialog('WorkflowAddInfoDialog', {
        resourceType: 'rds',
        ok: (data) => {
          this.form.rds.push(data)
        },
      })
    },
    deleteLine (row) {
      const { seq } = row
      this.form.rds = this.form.rds.filter((item, index) => {
        return seq - 1 !== index
      })
    },
  },
}
</script>
