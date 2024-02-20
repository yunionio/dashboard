<template>
  <a-button v-bind="config" @click="handleTest">{{$t('common_269')}}</a-button>
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
    disabled: {
      type: Boolean,
      default: false,
    },
    isSuccessAlert: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      loading: false,
    }
  },
  computed: {
    config () {
      return {
        loading: this.loading,
        disabled: this.disabled,
        // type: 'link',
        // style: 'padding: 0',
      }
    },
  },
  methods: {
    async handleTest () {
      if (!this.post || !['AsyncFunction', 'Function'].includes(R.type(this.post))) return false
      this.loading = true
      try {
        await this.post()
        if (this.isSuccessAlert) {
          this.$notification.success({
            message: this.$t('common_270'),
            description: this.$t('common_271'),
          })
        }
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style>

</style>
