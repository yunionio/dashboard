<template>
  <div>
    <page-header :title="$t('k8s.text_391')" />
    <page-body>
      <role-form @submit="submit" ref="formRef" />
    </page-body>
    <page-footer>
      <template class="content" #right>
        <a-button class="mr-2" type="primary" @click="handleConfirm" :loading="loading">{{$t('common.create')}}</a-button>
        <a-button @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import RoleForm from '../form'

export default {
  name: 'RbacclusterroleCreate',
  components: {
    RoleForm,
  },
  data () {
    return {
      loading: false,
    }
  },
  methods: {
    handleConfirm () {
      this.$refs.formRef.doCreate()
    },
    handleCancel () {
      this.$router.push('/k8s-rbacclusterrolebinding')
    },
    async submit (data) {
      try {
        this.loading = true
        await new this.$Manager('rbacclusterrolebindings', 'v1').create({ data })
        this.$message.success(this.$t('k8s.text_46'))
        this.loading = false
        this.handleCancel()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
