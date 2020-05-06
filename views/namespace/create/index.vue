<template>
  <div>
    <page-header title="新建命名空间" />
    <!-- <a-tabs v-model="activedTab">
      <a-tab-pane tab="表单创建" key="FormCreate" />
      <a-tab-pane tab="文本输入创建" key="InputCreate" />
      <a-tab-pane tab="上传文件创建" key="UploadCreate" />
    </a-tabs> -->
    <component :is="activedTab" />
  </div>
</template>

<script>
import FormCreate from './components/FormCreate'
import InputCreate from './components/InputCreate'
import UploadCreate from './components/UploadCreate'

export default {
  name: 'K8SNamespaceCreate',
  components: {
    FormCreate,
    InputCreate,
    UploadCreate,
  },
  data () {
    return {
      loading: false,
      activedTab: 'FormCreate',
    }
  },
}
</script>
