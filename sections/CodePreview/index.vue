<template>
  <div class="code-preview">
    <div class="code-preview-item mt-3" v-for="item in dataList" :key="item.title">
      <div class="code-preview-item_title mb-1">
        <a-icon class="mr-1" :type="item.showContent ? 'eye-invisible' : 'eye'" @click="() => item.showContent = !item.showContent" theme="twoTone" twoToneColor="#1890ff" />
        <span>{{ item.title }}</span>
        <a-button
          type="link"
          v-clipboard:copy="item.content"
          v-clipboard:success="_ => $message.success($t('k8s.text_31'))"
          v-clipboard:error="_ => $message.error($t('k8s.text_32'))"><a-icon type="copy" />{{$t('k8s.text_33')}}</a-button>
      </div>
      <template v-if="item.showContent">
        <pre class="code-preview-item_content" v-if="item.key === 'ca.crt'">{{ item.content }}</pre>
        <div class="code-preview-item_content" v-else style="white-space: pre-wrap; word-break: break-all;">{{ item.content }}</div>
      </template>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { Base64 } from 'js-base64'

export default {
  name: 'K8SCodePreviewSidepageDetail',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    const dataList = []
    if (R.is(Object, this.data.data)) {
      R.forEachObjIndexed((value, key) => {
        dataList.push({
          title: key,
          content: Base64.decode(value),
          showContent: false,
        })
      }, this.data.data)
    }
    return {
      dataList,
    }
  },
}
</script>

<style lang="less" scoped>
.code-preview {
  .code-preview-item_content {
    padding: 6px 12px;
    color: rgba(0, 0, 0, 0.65);
    background: #fafafa;
    border: 1px solid #d9d9d9;
  }
}
</style>
