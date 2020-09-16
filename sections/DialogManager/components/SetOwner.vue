<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common.text00104')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('common.text00104')" :name="this.params.tipName || ''" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('common.text00105')">
          <a-radio-group v-model="formScope">
            <a-radio-button
              v-for="item in scopeOptions"
              :value="item.key"
              :key="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('dictionary.domain')" key="domain" v-if="isDomainScope">
          <base-select
            resource="domains"
            v-decorator="decorators.domain"
            :params="domainParams"
            filterable
            version="v1"
            :select-props="{ placeholder: `${$t('common.text00106')}${$t('dictionary.domain')}` }" />
        </a-form-item>
        <a-form-item :label="$t('dictionary.project')" key="project" v-if="isProjectScope">
          <base-select
            resource="projects"
            v-decorator="decorators.project"
            :params="projectParams"
            filterable
            version="v1"
            :need-params="true"
            :select-props="{ placeholder: `${$t('common.text00106')}${$t('dictionary.project')}` }" />
        </a-form-item>
      </a-form>
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

export default {
  name: 'SetOwnerDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const getScopeInitValue = () => {
      let scope = 'system'
      let domain
      let project
      const item = this.params.data[0]
      if (item.domain_id && item.project_id) { // 既有 domain_id 又有 project_id 说明所属在项目
        scope = 'project'
        project = item.project_id
      } else if (item.domain_id && !item.project_id) {
        scope = 'domain'
        domain = item.domain_id
      }
      return {
        scope,
        domain,
        project,
      }
    }
    const initValue = getScopeInitValue()
    return {
      loading: false,
      tipName: this.params.tipName,
      scope: this.$store.getters.scope,
      isAdminMode: this.$store.getters.isAdminMode,
      isDomainMode: this.$store.getters.isDomainMode,
      l3PermissionEnable: this.$store.getters.l3PermissionEnable,
      userInfo: this.$store.getters.userInfo,
      form: {
        fc: this.$form.createForm(this),
      },
      formScope: initValue.scope,
      decorators: {
        domain: [
          'domain',
          {
            initialValue: initValue.domain,
            validateTrigger: 'blur',
            rules: [
              { required: true, message: this.$t('rules.domain') },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: initValue.project,
            validateTrigger: 'blur',
            rules: [
              { required: true, message: this.$t('rules.project') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
    }
  },
  computed: {
    isDomainScope () {
      return this.formScope === 'domain'
    },
    isProjectScope () {
      return this.formScope === 'project'
    },
    domainParams () {
      return {
        scope: this.scope,
        limit: 0,
      }
    },
    projectParams () {
      const params = { limit: 0 }
      if (this.isAdminMode) {
        params.scope = 'system'
      } else if (this.isDomainMode) {
        params.project_domain = this.userInfo.domain.id
      }
      return params
    },
    scopeOptions () {
      const ret = [
        { label: this.$t('shareScope.project'), key: 'project' },
      ]
      if (this.isAdminMode) {
        ret.splice(0, 0, { label: this.$t('shareScope.system'), key: 'system' })
        if (this.l3PermissionEnable) {
          ret.splice(1, 0, { label: this.$t('shareScope.domain'), key: 'domain' })
        }
      }
      return ret
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    doSubmit (values) {
      const data = {
        id: this.params.data[0].id,
      }
      if (this.isProjectScope) {
        data.project = values.project
      } else if (this.isDomainScope) {
        data.domain = values.domain
      } else {
        data.domain = ''
        data.project = ''
      }
      return this.params.onManager('performAction', {
        id: this.params.data[0].id,
        managerArgs: {
          id: this.params.data[0].id,
          action: 'set-scope',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        await this.doSubmit(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
