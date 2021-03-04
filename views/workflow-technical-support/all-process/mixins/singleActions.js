export default {
  created () {
    this.singleActions = [
      {
        label: '查看',
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
