<template>
  <div>
    <browse
      idKey="process_instance_id"
      :isEdit="isEdit"
      :type="processType"
      :columns="columns"
      :dataSource="dataSource" />
  </div>
</template>

<script>
import Browse from '../../components/Browse'
import ColumnsMixin from '../mixins/columns'
import DataSourceMixin from '../../mixins/dataSource'
import { CLOSE_STATUS } from '../../constants'

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
  computed: {
    isEdit () {
      return !this.dataSource.every(v => CLOSE_STATUS.includes(v.process_instance.state))
    },
  },
  created () {
    const { id, type } = this.$route.query
    this.processType = type
    this.fetchDataById(id)
  },
  methods: {
    fetchDataById (id) {
      new this.$Manager('historic-task-instances', 'v1').list({
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
