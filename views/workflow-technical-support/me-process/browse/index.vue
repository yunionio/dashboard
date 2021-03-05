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
import { CLOSE_STATUS } from '../../constants'

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
    isEdit () {
      return !this.dataSource.every(v => CLOSE_STATUS.includes(v.state))
    },
  },
  created () {
    const { id, type } = this.$route.query
    this.processType = type
    this.fetchDataById(id)
  },
}
</script>
