<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('system.text_130', [$t('dictionary.role')])}}</div>
    <div slot="body">
      <steps class="my-3" v-model="step" />
      <component :is="stepComponent" :domain="params.domain" ref="stepForm" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ confirmText }}</a-button>
      <a-button @click="cancel">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import StepMixin from '@/mixins/step'
import SetPoliciesForm from '../components/SetPolicies'
import CreateRoleForm from '../components/CreateRole'

export default {
  name: 'RoleCreateDialog',
  components: {
    CreateRoleForm,
    SetPoliciesForm,
  },
  mixins: [DialogMixin, WindowsMixin, StepMixin],
  data () {
    return {
      loading: false,
      step: {
        steps: [
          { title: this.$t('system.role'), key: 'create-role-form' },
          { title: this.$t('role.create_step2'), key: 'set-policies-form' },
        ],
        currentStep: 0,
      },
    }
  },
  computed: {
    stepComponent () {
      return this.step.steps[this.step.currentStep].key
    },
    confirmText () {
      return this.stepComponent === 'create-role-form' ? this.$t('common.next_step') : this.$t('dialog.ok')
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        if (this.step.currentStep === 0) {
          const createRoleRes = await this.$refs.stepForm.create()
          this.rid = createRoleRes.data.id
          this.step.currentStep = this.step.currentStep + 1
        } else if (this.step.currentStep === 1) {
          await this.$refs.stepForm.set(this.rid)
          this.cancel()
        }
      } finally {
        this.loading = false
      }
    },
    cancel () {
      this.cancelDialog()
      if (this.step.currentStep === 1) {
        this.params.success()
      }
    },
  },
}
</script>
