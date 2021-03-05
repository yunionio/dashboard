<template>
  <div>
    <browse
      idKey="process_instance_id"
      :readOnly="readOnly"
      :type="processType"
      :columns="columns"
      :dataSource="dataSource" />
  </div>
</template>

<script>
import Browse from '../../components/Browse'
import ColumnsMixin from '../mixins/columns'
import DataSourceMixin from '../../mixins/dataSource'

export default {
  name: 'WorkflowSupportApprovedDoneBrowseIndex',
  components: {
    Browse,
  },
  mixins: [ColumnsMixin, DataSourceMixin],
  data () {
    return {
      processType: '',
      dataSource: [],
    }
  },
  created () {
    const { id, type } = this.$route.query
    this.processType = type
    this.fetchDataById(id)
  },
  methods: {
    fetchDataById (id) {
      new this.$Manager('process-tasks', 'v1').list({
        params: {
          user_id: this.userInfo.id,
          process_instance_id: id,
          process_definition_key: 'customer-service',
        },
      }).then(res => {
        this.dataSource = res.data.data
      }).catch((err) => {
        this.dataSource = []
        throw err
      })
    },
  },
}
</script>
