<template>
  <div>
    <page-header title="新建守护进程(Daemonset)" />
    <page-body>
      <!-- <a-tabs v-model="activeTab">
        <a-tab-pane v-for="item in tabs" :tab="item.label" :key="item.component">
          <component :is="activeTab" resource="deployments" :ref="`${activeTab}Ref`" />
        </a-tab-pane>
      </a-tabs> -->
      <form-create ref="FormCreateRef" />
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="confirm" :loading="loading">确 定</a-button>
        <a-button @click="cancel">取 消</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import FormCreate from './Form'

export default {
  name: 'K8SDeploymentCreate',
  components: {
    FormCreate,
  },
  data () {
    return {
      loading: false,
      activeTab: 'FormCreate',
      tabs: [
        {
          label: '表单创建',
          component: 'FormCreate',
        },
        {
          label: '文本输入创建',
          component: 'InputCreate',
        },
        {
          label: '上传文件创建',
          component: 'UploadCreate',
        },
      ],
    }
  },
  methods: {
    async confirm () {
      await this.$refs.FormCreateRef.doCreate()
      this.cancel()
    },
    cancel () {
      this.$router.push('/k8s-daemonset')
    },
  },
}
</script>
