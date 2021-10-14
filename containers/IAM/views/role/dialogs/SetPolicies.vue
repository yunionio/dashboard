<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('role.action.set_policies') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.role')" :count="params.data.length" :action="$t('role.action.set_policies')" />
      <dialog-table :data="params.data" :columns="columns" />
      <set-policies-form ref="setPoliciesForm" :data="params.data" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import SetPoliciesForm from '../components/SetPolicies'

export default {
  name: 'RoleSetPoliciesDialog',
  components: {
    SetPoliciesForm,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
    }
  },
  computed: {
    columns () {
      return this.params.columns.filter(item => item.field === 'project_domain' || item.field === 'name')
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.setPoliciesForm.set(this.params.data[0].id, this.params.setPoliciesAction)
        this.cancelDialog()
        this.params.success && this.params.success()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
