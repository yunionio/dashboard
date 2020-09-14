<template>
  <vxe-grid :data="data.rules || []" :columns="columns" />
</template>

<script>
import ActionButton from '@/components/PageList/Actions/ActionButton'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'K8SRoleRulesSidepage',
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
      columns: [
        {
          field: 'verbs',
          title: 'Actions',
          slots: {
            default: ({ row }, h) => {
              if (!row.verbs) return '-'
              return row.verbs.map(val => (<div>{ val }</div>))
            },
          },
        },
        {
          field: 'apiGroups',
          title: 'API Groups',
          slots: {
            default: ({ row }, h) => {
              if (!row.apiGroups) return '-'
              return row.apiGroups.map(val => (<div>{ val || '""' }</div>))
            },
          },
        },
        {
          field: 'resources',
          title: 'Resources',
          slots: {
            default: ({ row }, h) => {
              if (!row.resources) return '-'
              return row.resources.map(val => (<div>{ val }</div>))
            },
          },
        },
        {
          field: 'actions',
          title: this.$t('common.action'),
          slots: {
            default: ({ row, rowIndex }, h) => {
              const item = {
                label: this.$t('common.delete'),
                action: row => {
                  this.deleteRule(rowIndex)
                },
              }
              return [h(ActionButton, {
                props: {
                  row,
                  item,
                  buttonSize: 'small',
                  buttonStyle: {
                    fontSize: '12px',
                  },
                },
              })]
            },
          },
        },
      ],
    }
  },
  methods: {
    deleteRule (rowIndex) {
      this.createDialog('K8SRemoveRuleDialog', {
        resourceData: this.data,
        data: [this.data.rules[rowIndex]],
        rowIndex,
        columns: this.columns.slice(0, 3),
        onManager: this.onManager,
      })
    },
  },
}
</script>
