<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">错误信息</div>
    <div class="error-body" slot="body">
      <div class="d-flex pb-2">
        <div class="label">错误消息: </div>
        <div class="error-color ml-3">
          <div>{{ params.error.class }}</div>
          <div>{{ params.error.detail }}</div>
        </div>
      </div>
      <div class="d-flex pb-2 mt-2 border-bottom">
        <div class="label">错误源信息: </div>
        <pre class="error-color ml-3">{{ details }}</pre>
      </div>
      <div class="d-flex mt-3">
        <div class="label">请求: </div>
        <div class="ml-3">
          <pre>{{ request }}</pre>
        </div>
      </div>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t('dialog.ok') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ErrorDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const details = JSON.stringify(this.params.error.resource, null, 2)
    const request = JSON.stringify(this.params.request, null, 2)
    return {
      details,
      request,
    }
  },
}
</script>

<style lang="scss" scoped>
.error-body {
  .label {
    width: 80px;
  }
}
</style>
