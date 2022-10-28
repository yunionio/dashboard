<template>
  <div>
    <vxe-grid
      ref="CstTable"
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
  name: 'WorkflowApplyInternalCstInfo',
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
        ...COLUMNS_MAP.cloudSecurityTable,
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
      return this.form.cloudSecurityTable || []
    },
  },
  methods: {
    handleAddData () {
      this.createDialog('WorkflowAddInfoDialog', {
        resourceType: 'cloudSecurityTable',
        ok: (data) => {
          this.form.cloudSecurityTable.push(data)
        },
      })
    },
    deleteLine (row) {
      const { seq } = row
      this.form.cloudSecurityTable = this.form.cloudSecurityTable.filter((item, index) => {
        return seq - 1 !== index
      })
    },
  },
}
</script>
