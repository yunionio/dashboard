import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['userInfo']),
  },
  created () {
    this.singleActions = [
      {
        label: this.$t('common.workflow.browse'),
        action: (obj) => {
          this.$router.push({
            name: 'WorkflowTechnicalSupportBrowse',
            query: {
              id: obj.process_instance_id,
              type: 'approval-start',
            },
          })
        },
      },
    ]
  },
}
