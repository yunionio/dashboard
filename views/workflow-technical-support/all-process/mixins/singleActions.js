export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('common.workflow.browse'),
        action: (obj) => {
          this.$router.push({
            name: 'WorkflowTechnicalSupportBrowse',
            query: {
              id: obj.id,
              type: 'all-process',
            },
          })
        },
      },
    ]
  },
}
