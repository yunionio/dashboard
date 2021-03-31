<template>
    <a-row>
      <a-col :span="16">
        <refresh
          showSelect
          tooltips
          :loading="loading"
          @refresh="handleRefresh" />
        <a-button  style="margin-left: 8px;" @click="createChart">
          {{ $t('monitor.dashboard.dialog.project.create')}}
        </a-button>
      </a-col>
<!--      <a-col :span="18">-->
<!--        <time-select-->
<!--            is-radio-group-->
<!--            style="float: right;"-->
<!--            :default-value="60" />-->
<!--      </a-col>-->
    </a-row>
</template>

<script>
import refresh from '../sections/select/refresh'

export default {
  name: 'filterbar',
  components: {
    refresh,
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    createChart: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      time: '1h',
    }
  },
  methods: {
    handleRefresh () {
      this.$emit('refresh')
    },
  },
}
</script>

<style scoped>

</style>
