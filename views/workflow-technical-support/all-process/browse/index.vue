<template>
  <div>
    <browse
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

export default {
  name: 'WorkflowSupportAllProcessBrowseIndex',
  components: {
    Browse,
  },
  mixins: [ColumnsMixin, DataSourceMixin],
  data () {
    return {
      processType: '',
      dataSource: [],
      isEdit: false,
    }
  },
  created () {
    const { id, type } = this.$route.query
    this.processType = type
    this.fetchDataById(id)
  },
}
</script>
