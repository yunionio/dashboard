<template>
  <div>
    <page-header :title="$t('network.text_289')" />
    <page-body>
      <components :is="$route.query.type" ref="formRef" />
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" class="mr-2" @click="submit" :loading="loading">{{ $t('dialog.ok') }}</a-button>
        <a-button @click="cancel">{{$t('network.text_31')}}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import Onecloud from './form/OneCloud'
import Aliyun from './form/Aliyun'
import Qcloud from './form/Qcloud'
import Huawei from './form/Huawei'
import Aws from './form/Aws'

export default {
  name: 'LbCreateIndex',
  components: {
    Onecloud,
    Aliyun,
    Qcloud,
    Huawei,
    Aws,
  },
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    async submit () {
      this.loading = true
      try {
        const data = await this.$refs.formRef.submit()
        await new this.$Manager('loadbalancers').create({ data })
        this.loading = false
        this.$message.success(this.$t('network.text_290'))
        this.cancel()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.$router.push('/lb')
    },
  },
}
</script>
