<template>
  <a-button v-bind="config" @click="handleTest">连接测试</a-button>
</template>

<script>
import * as R from 'ramda'
export default {
  name: 'TestButton',
  props: {
    post: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      loding: false,
    }
  },
  computed: {
    config () {
      return {
        loding: this.loding,
        type: 'link',
        style: 'padding: 0',
      }
    },
  },
  methods: {
    async handleTest () {
      if (!this.post || R.type(this.post) !== 'Function') return false
      this.loding = true
      try {
        await this.post()
        this.$notification.success({
          message: '连接成功',
          description: '请点击确定继续',
        })
      } catch (err) {
        throw err
      } finally {
        this.loding = false
      }
    },
  },
}
</script>

<style>

</style>
