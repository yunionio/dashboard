<template>
  <vxe-grid
    border
    resizable
    :columns="columns"
    :data="realTableData"
    v-bind="$attrs" />
</template>

<script>
export default {
  name: 'OcSimpleTable',
  props: {
    columns: {
      type: Array,
      require: true,
    },
    data: {
      type: [Array, Object],
      require: true,
    },
  },
  data () {
    return {
      tableData: [],
    }
  },
  computed: {
    realTableData () {
      return this.tableData
    },
  },
  created () {
    this.init()
  },
  methods: {
    init () {
      this.getTableData()
    },
    async getTableData () {
      if (Array.isArray(this.data)) {
        this.tableData = this.data
        return
      }
      this.data.then(res => {
        this.tableData = (res.data || res) || []
      }, (err) => {
        this.tableData = []
        throw err
      })
    },
  },
}
</script>

<style>

</style>
