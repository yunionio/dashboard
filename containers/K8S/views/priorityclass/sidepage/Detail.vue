<template>
  <detail
    :showDesc="false"
    :showName="false"
    :hiddenKeys="['project_domain', 'tenant', 'created_at', 'updated_at']"
    :onManager="onManager"
    :data="data"
    :base-info="baseInfo" />
</template>

<script>
export default {
  name: 'K8SPriorityClassDetail',
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
        {
          field: 'name',
          title: this.$t('k8s.text_41'),
          slots: {
            default: ({ row }) => {
              return [
                <div class='text-truncate'>
                  <list-body-cell-wrap copy row={ this.data } onManager={ this.onManager } field='name' title={ row.name } />
                </div>,
              ]
            },
          },
        },
        {
          field: 'cluster',
          title: this.$t('k8s.text_19'),
        },
        {
          field: 'value',
          title: this.$t('k8s.vc_priority_value'),
        },
        {
          field: 'globalDefault',
          title: this.$t('k8s.vc_global_default'),
          formatter: ({ row }) => row.globalDefault ? this.$t('k8s.vc_yes') : this.$t('k8s.vc_no'),
        },
        {
          field: 'description',
          title: this.$t('k8s.vc_description'),
          formatter: ({ row }) => row.description || '-',
        },
        {
          field: 'creationTimestamp',
          title: this.$t('k8s.text_74'),
          formatter: ({ row }) => {
            return (row.creationTimestamp && this.$moment(row.creationTimestamp).format()) || '-'
          },
        },
      ],
    }
  },
}
</script>
