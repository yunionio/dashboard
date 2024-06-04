<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <!--a-alert :message="$t('system.text_508', [$t('dictionary.role')])" type="warning" class="mb-2" /-->
      <dialog-selected-tips :name="$t('dictionary.user')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dictionary.domain')" v-if="isAdminMode">
          <a-radio-group v-decorator="decorators.domain" @change="domainChange" v-if="!l3PermissionEnable">
            <a-radio-button v-for="item in domainOptions" :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
          <base-select v-else
            v-decorator="decorators.domain"
            version="v1"
            resource="domains"
            filterable
            :params="domainParams"
            :select-props="{ placeholder: $t('rules.project') }"
            @change="domainChange" />
        </a-form-item>
        <a-form-item :label="$t('dictionary.project')">
          <base-select
            resource="projects"
            v-decorator="decorators.projects"
            filterable
            remote
            :select-props="{placeholder: $t('rules.project'), mode: 'multiple'}"
            :params="projectParams">
            <template #optionLabelTemplate="{item}">
              {{item.name}}
            </template>
          </base-select>
        </a-form-item>
        <a-form-item :label="$t('dictionary.role')">
          <base-select
            resource="roles"
            v-decorator="decorators.roles"
            filterable
            remote
            :select-props="{placeholder: $t('rules.role'), mode: 'multiple'}"
            :params="roleParams">
            <template #optionLabelTemplate="{item}">
              {{item.name}}
            </template>
          </base-select>
        </a-form-item>
        <a-form-item v-if="isUserDisabled" :label="$t('iam.enabled_user')" v-bind="formItemLayout" :extra="$t('iam.user_can_enabled')">
          <a-switch
            :checkedChildren="$t('common_292')"
            :unCheckedChildren="$t('common_293')"
            v-decorator="decorators.enabled" />
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
// import get from 'lodash/get'
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'UserProjectJoinDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const domainId = this.params.data[0].domain_id
    return {
      action: this.$t('system.text_195', [this.$t('dictionary.project')]),
      loading: false,
      projectList: [],
      projectLoading: false,
      roleList: [],
      roleLoading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      domainId,
      decorators: {
        domain: [
          'domain',
          {
            initialValue: domainId,
          },
        ],
        projects: [
          'projects',
          {
            rules: [
              { required: true, message: this.$t('rules.project') },
            ],
          },
        ],
        roles: [
          'roles',
          {
            rules: [
              { required: true, message: this.$t('rules.role') },
            ],
          },
        ],
        enabled: [
          'enabled',
          {
            initialValue: false,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isDomainMode', 'isAdminMode', 'l3PermissionEnable', 'scope']),
    domainOptions () {
      return [{
        label: 'Default',
        key: 'default',
      }]
    },
    domainParams () {
      return {
        scope: this.scope,
      }
    },
    projectParams () {
      const ret = {
        scope: this.scope,
        project_domain_id: this.domainId,
        limit: 20,
      }
      return ret
    },
    roleParams () {
      const ret = {
        scope: this.scope,
        project_domain_id: this.domainId,
        limit: 20,
      }
      return ret
    },
    isUserDisabled () {
      return !this.params.data[0].enabled
    },
  },
  created () {
    if (!this.l3PermissionEnable) {
      this.domainId = 'default'
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      const manager = new this.$Manager('users', 'v1')
      try {
        const values = await this.form.fc.validateFields()
        await manager.performAction({
          id: this.params.data[0].id,
          action: 'join',
          data: values,
        })
        this.cancelDialog()
        this.$bus.$emit('UserSidepageProjectsListRefresh')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    domainChange (val) {
      this.domainId = val
    },
  },
}
</script>
