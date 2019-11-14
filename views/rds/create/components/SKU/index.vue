<template>
  <div>
    <filters ref="FILTER" />
  </div>
</template>
<script>
import Filters from './components/Filters'

export default {
  name: 'rdsSku',
  components: {
    Filters,
  },
  inject: ['form', 'formItemLayout'],
  data () {
    return {
    }
  },
  methods: {
    fetchFilter (regionId) {
      const { fetchQueryData } = this.$refs['FILTER']
      console.log(this.$refs['FILTER'].fetchQueryData)
      // 获取sku筛选项接口
      fetchQueryData(regionId)
    },
  },
}
</script>
