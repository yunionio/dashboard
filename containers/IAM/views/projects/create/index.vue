<template>
  <div>
    <page-header :title="$t('system.text_167', [$t('dictionary.project')])" />
    <steps class="my-3" v-model="step" />
    <page-body>
      <component :is="stepComponent" :domainId="projectMsg.domain_id" ref="stepForm" />
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" size="large" :loading="loading" @click="handleSubmit">{{ createTxt }}</a-button>
        <a-button class="ml-2" size="large" @click="handleCancel">{{ stepComponent === 'create-project' ? $t('dialog.cancel') : $t('common.skip') }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import step from '@/mixins/step'
import AddUser from './form/AddUser'
import CreateProject from './form/CreateProject'
const R = require('ramda')

export default {
  name: 'ProjectCreate',
  components: {
    AddUser,
    CreateProject,
  },
  mixins: [step],
  data () {
    return {
      loading: false,
      projectMsg: {},
      step: {
        steps: [
          { title: this.$t('system.text_444', [this.$t('dictionary.project')]), key: 'create-project' },
          { title: this.$t('system.text_445', [this.$t('dictionary.project')]), key: 'add-user' },
        ],
        currentStep: 0,
      },
    }
  },
  computed: {
    stepComponent () {
      return this.step.steps[this.step.currentStep].key
    },
    isEnableQuotaCheck () {
      return this.$store.getters.userInfo.enable_quota_check
    },
    createTxt () {
      return this.step.currentStep ? this.$t('system.text_498', []) : this.$t('common.create')
    },
  },
  created () {
    this.manager = new this.$Manager('projects', 'v1')
  },
  methods: {
    async handleSubmit () {
      this.loading = true
      try {
        const values = await this.$refs.stepForm.validateForm()
        if (this.step.currentStep === 0) {
          const { data } = await this.createProject(values)
          this.projectMsg = data
          this.step.currentStep = this.step.currentStep + 1
        } else if (this.step.currentStep === 1) {
          await this.addUser(values)
          this.handleCancel()
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
      if (this.isEnableQuotaCheck) {
        try {
          if (R.is(Function, this.$refs.stepForm.doQuotaSet)) {
            await this.$refs.stepForm.doQuotaSet({ tenant: this.projectMsg.id })
          }
        } catch (error) {
          this.$message.info(this.$t('system.text_447'))
          throw error
        }
      }
    },
    async createProject (values) {
      try {
        const ret = await this.manager.create({
          data: values,
        })
        this.$message.success(this.$t('system.text_448', [this.$t('dictionary.project')]))
        return ret
      } catch (error) {
        throw error
      }
    },
    async addUser (values) {
      try {
        delete values.domain
        await this.manager.performAction({
          id: this.projectMsg.id,
          action: 'join',
          data: values,
        })
        this.$message.success(this.$t('system.text_449', [this.$t('dictionary.project', this.$t('dictionary.role'))]))
      } catch (error) {
        throw error
      }
    },
    handleCancel () {
      this.$router.push('/project')
    },
  },
}
</script>
