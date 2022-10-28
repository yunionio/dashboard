<template>
  <div>
    <vxe-grid
      ref="ecsTable"
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
  name: 'WorkflowApplyInternalEcsInfo',
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
        ...COLUMNS_MAP.ecs,
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
      return this.form.ecs || []
    },
  },
  methods: {
    handleAddData () {
      this.createDialog('WorkflowAddInfoDialog', {
        resourceType: 'ecs',
        ok: (data) => {
          this.form.ecs.push(data)
        },
      })
    },
    deleteLine (row) {
      const { seq } = row
      this.form.ecs = this.form.ecs.filter((item, index) => {
        return seq - 1 !== index
      })
    },
  },
}
</script>
