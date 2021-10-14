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
          <a-select
            :filterOption="filterOption"
            :loading="projectLoading"
            v-decorator="decorators.projects"
            mode="multiple"
            :placeholder="$t('rules.project')">
            <a-select-option v-for="item in projectList" :key="item.id">
              {{item.name}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('dictionary.role')">
          <a-select
            :filterOption="filterOption"
            :loading="roleLoading"
             v-decorator="decorators.roles"
            mode="multiple"
            :placeholder="$t('rules.role')">
            <a-select-option v-for="item in roleList" :key="item.id">
              {{item.name}}
            </a-select-option>
          </a-select>
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
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isDomainMode', 'isAdminMode', 'l3PermissionEnable']),
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
  },
  created () {
    if (!this.l3PermissionEnable) {
      this.domainId = 'default'
    }
    this.fetchProjects()
    this.fetchRoles()
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    async fetchProjects () {
      const params = {
        project_domain_id: this.domainId,
        scope: this.$store.getters.scope,
      }
      // const uid = get(this, 'params.data[0].id')
      // if (uid) {
      //   params.user = uid
      //   params.jointable = true
      // }
      this.projectLoading = true
      try {
        const { data = {} } = await new this.$Manager('projects', 'v1').list({ params })
        this.projectList = data.data || []
      } catch (err) {
        throw err
      } finally {
        this.projectLoading = false
      }
    },
    async fetchRoles () {
      const manager = new this.$Manager('roles', 'v1')
      const params = {
        project_domain_id: this.domainId,
        scope: this.$store.getters.scope,
      }
      this.roleLoading = true
      try {
        const { data = {} } = await manager.list({ params })
        this.roleList = data.data || []
      } catch (err) {
        throw err
      } finally {
        this.roleLoading = false
      }
    },
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
      this.form.fc.resetFields(['projects', 'roles'])
      this.$nextTick(() => {
        this.fetchProjects()
        this.fetchRoles()
      })
    },
  },
}
</script>
