<template>
  <div>
    <page-header :title="$t('system.text_487')" />
    <steps class="my-3" v-model="step" />
    <page-body>
      <component :is="stepComponent" :domain="domain" ref="stepForm" />
    </page-body>
    <page-footer>
      <template v-slot:right>
        <a-button type="primary" size="large" :loading="loading" @click="handleSubmit">{{ createTxt }}</a-button>
        <a-button class="ml-2" size="large" @click="handleCancel">{{ cancelTxt }}</a-button>
      </template>
    </page-footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import step from '@/mixins/step'
import CreateUser from './form/CreateUser'
import JoinProject from './form/JoinProject'

export default {
  name: 'UserCreate',
  components: {
    CreateUser,
    JoinProject,
  },
  mixins: [step],
  data () {
    return {
      loading: false,
      userMsg: {},
      step: {
        steps: [
          { title: this.$t('system.text_488'), key: 'create-user' },
          { title: this.$t('system.text_489'), key: 'join-project' },
        ],
        currentStep: 0,
      },
      domain: { key: 'default', label: 'Default' },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'l3PermissionEnable', 'userInfo']),
    stepComponent () {
      return this.step.steps[this.step.currentStep].key
    },
    cancelTxt () {
      const _ = {
        'create-user': this.$t('system.text_491'),
        'join-project': this.$t('system.text_492'),
      }
      return _[this.stepComponent] || this.$t('system.text_491')
    },
    createTxt () {
      return this.step.currentStep ? this.$t('system.text_498', []) : this.$t('common.create')
    },
  },
  created () {
    this.manager = new this.$Manager('users', 'v1')
    if (this.l3PermissionEnable) {
      this.domain = {
        key: this.userInfo.projectDomainId,
        label: this.userInfo.projectDomain,
      }
    }
  },
  methods: {
    async handleSubmit () {
      this.loading = true
      try {
        const values = await this.$refs.stepForm.validateForm()
        if (this.step.currentStep === 0) {
          const { data } = await this.createUser(values)
          if (this.l3PermissionEnable) {
            this.domain = values.domain
          }
          this.userMsg = data
          this.step.currentStep = this.step.currentStep + 1
        } else if (this.step.currentStep === 1) {
          await this.joinProject(values)
          this.handleCancel()
        }
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    async createUser (values) {
      try {
        const data = { ...values, skip_password_complexity_check: true }
        if (data.domain && data.domain.key) {
          data.domain_id = data.domain.key
          delete data.domain
        }
        if (!this.isAdminMode) {
          delete data.domain_id
        }
        const ret = await this.manager.create({
          data,
        })
        this.$message.success(this.$t('system.text_493'))
        return ret
      } catch (error) {
        throw error
      }
    },
    async joinProject (values) {
      try {
        delete values.domain
        await this.manager.performAction({
          id: this.userMsg.id,
          action: 'join',
          data: values,
        })
        this.$message.success(this.$t('system.text_494'))
      } catch (error) {
        throw error
      }
    },
    handleCancel () {
      this.$router.push('/systemuser')
    },
  },
}
</script>
