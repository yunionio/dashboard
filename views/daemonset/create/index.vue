<template>
  <div>
    <page-header :title="$t('k8s.text_230')" />
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
        <a-button class="mr-3" type="primary" @click="confirm" :loading="loading">{{$t('k8s.text_49')}}</a-button>
        <a-button @click="cancel">{{$t('k8s.text_213')}}</a-button>
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
          label: this.$t('k8s.text_231'),
          component: 'FormCreate',
        },
        {
          label: this.$t('k8s.text_232'),
          component: 'InputCreate',
        },
        {
          label: this.$t('k8s.text_233'),
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
