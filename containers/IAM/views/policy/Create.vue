<template>
  <div>
    <page-header :title="$t('system.text_167', [$t('dictionary.policy')])" />
    <page-body>
      <policy-form ref="policyForm" :edit-type="editType" @edit-type-change="val => editType = val" />
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="doCreate" :loading="submiting">{{ $t('common.create') }}</a-button>
        <a-button @click="handleCancel">{{ $t('common.cancel') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import PolicyForm from './components/Form'

export default {
  name: 'PolicyCreate',
  components: {
    PolicyForm,
  },
  data () {
    return {
      submiting: false,
      editType: 'yaml',
    }
  },
  methods: {
    async doCreate () {
      this.submiting = true
      try {
        const data = await this.$refs.policyForm.getData()
        await this.$http.post('/v1/auth/policies', data)
        this.$router.push('/policy')
      } catch (error) {
        throw error
      } finally {
        this.submiting = false
      }
    },
    handleCancel () {
      this.$router.push('/policy')
    },
  },
}
</script>
