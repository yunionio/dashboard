<template>
  <div>
    <browse
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
  name: 'WorkflowSupportMeProcessBrowseIndex',
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
    readOnly () {
      return false
    },
  },
  created () {
    const { id, type } = this.$route.query
    this.processType = type
    this.fetchDataById(id)
  },
}
</script>
