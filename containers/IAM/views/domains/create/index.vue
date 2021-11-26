<template>
  <div>
    <page-header :title="$t('system.text_167', [$t('dictionary.domain')])" />
    <page-body>
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('system.text_101')">
          <a-input v-decorator="decorators.name" :placeholder="$t('system.text_168')" />
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item :label="$t('system.text_169')" required v-if="l3PermissionEnable&&isEnableQuotaCheck">
          <quota-set
            ref="quotaSetRef"
            mdf="domain"
            :domain="domain"
            :is-clone="isClone" />
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button type="primary" @click="handleConfirm" :loading="loading" size="large">{{ $t('common.create') }}</a-button>
        <a-button class="ml-2" size="large" @click="handleCancel">{{ $t('dialog.cancel') }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
// import * as R from 'ramda'
import { mapGetters } from 'vuex'
import QuotaSet from '@IAM/sections/QuotaSet'
import { escapeHTML } from '@/utils/utils'

export default {
  name: 'DomainCreateIndex',
  components: {
    QuotaSet,
  },
  data () {
    return {
      loading: false,
      submiting: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              {
                required: true, message: this.$t('system.text_170'),
              },
            ],
          },
        ],
        description: ['description'],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
          xxl: {
            span: 22,
          },
        },
        labelCol: {
          span: 3,
          xxl: {
            span: 2,
          },
        },
      },
    }
  },
  computed: {
    ...mapGetters(['l3PermissionEnable']),
    domain () {
      return this.$route.query.domain
    },
    isClone () {
      return !!this.domain
    },
    isEnableQuotaCheck () {
      return this.$store.getters.userInfo.enable_quota_check
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.form.fc.validateFields()
        const { id } = await this.fetchCreate()
        if (this.l3PermissionEnable) {
          if (this.isEnableQuotaCheck) {
            await this.$refs.quotaSetRef.doQuotaSet({ domain: id })
          }
        }
        this.$router.push('/domain')
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    async fetchCreate () {
      const manager = new this.$Manager('domains', 'v1')
      try {
        const { data } = await manager.create({
          data: {
            name: escapeHTML(this.form.fc.getFieldValue('name')),
            description: this.form.fc.getFieldValue('description'),
          },
        })
        return data
      } catch (err) {
        throw err
      }
    },
    handleCancel () {
      this.$router.push('/domain')
    },
  },
}
</script>
