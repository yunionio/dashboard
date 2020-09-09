<template>
  <vxe-grid :data="rules || []" :columns="columns" />
</template>

<script>
import ActionButton from '@/components/PageList/Actions/ActionButton'

export default {
  name: 'K8SRoleRulesSidepage',
  props: {
    rules: {
      type: Array,
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
            default: ({ row }, h) => {
              const item = {
                label: this.$t('common.delete'),
                action: row => {
                  console.log(row, 'row')
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
}
</script>
