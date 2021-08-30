<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common.text00089')}}</div>
    <div class="error-body" slot="body">
      <div v-for="(item, i) in details" :key="i" class="mb-2">
         <div class="d-flex pb-2 " v-if="item.id">
          <div class="label">ID: </div>
          <div class="error-color ml-3">
            <div>{{ item.id }}</div>
          </div>
          <copy class="align-self-center ml-1" :message="item.id" />
        </div>
        <div class="d-flex pb-2">
          <div class="label">{{$t('common.text00090')}}: </div>
          <div class="error-color ml-3 overflow-auto">
            <div>{{ item.class }}</div>
            <div>{{ item.detail }}</div>
          </div>
        </div>
        <div class="d-flex pb-2 mt-2 border-bottom overflow-auto">
          <div class="label">{{$t('common.text00091')}}: </div>
          <pre class="error-color ml-3">{{ item.resource }} <copy :message="item.resource" /></pre>
        </div>
      </div>
      <div class="d-flex mt-3">
        <div class="label">{{$t('common.text00092')}}: </div>
        <div class="ml-3" style="width: calc(100% - 80px)">
          <pre>{{ request }} <copy :message="request" /></pre>
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
import { changeToArr } from '@/utils/utils'

export default {
  name: 'ErrorDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const details = changeToArr(this.params.error).map(val => ({
      ...val,
      resource: JSON.stringify({ ...val.resource, time: this.$moment() }, null, 2),
    }))
    const request = JSON.stringify(this.params.request, null, 2)
    return {
      details,
      request,
    }
  },
}
</script>

<style lang="less" scoped>
.error-body {
  .label {
    width: 80px;
  }
}
</style>
