import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    this.singleActions = [
      {
        label: '查看',
        action: (obj) => {
          this.$router.push({
            name: 'WorkflowTechnicalSupportBrowse',
            query: {
              id: obj.process_instance_id,
              type: 'approved-done',
            },
          })
        },
      },
    ]
  },
}
