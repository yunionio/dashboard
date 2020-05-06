<template>
  <div>
    <page-header title="新建服务(Service)" />
    <page-body>
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
  name: 'K8SIngressCreate',
  components: {
    FormCreate,
  },
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async confirm () {
      try {
        this.loading = true
        await this.$refs.FormCreateRef.doCreate()
        this.loading = false
        this.cancel()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.$router.push('/k8s-service')
    },
  },
}
</script>
