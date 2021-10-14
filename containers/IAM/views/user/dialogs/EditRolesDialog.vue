<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.project')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dictionary.role')">
          <a-select
            :filterOption="filterOption"
            :loading="roleLoading"
            v-decorator="decorators.roles"
            mode="multiple"
            :placeholder="$t('rules.role')"
            @deselect="handleDeselect"
            @select="handleSelect">
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
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'UserEditRolesDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      domainId: this.params.data[0].domain_id,
      roleList: [],
      roleLoading: false,
      initialValue: this.params.data[0].roles.map(item => { return item.id }),
      deselectList: [],
      selectList: [],
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
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
  created () {
    this.manager = new this.$Manager('users', 'v1')
    this.fetchRoles()
  },
  methods: {
    async fetchRoles () {
      const manager = new this.$Manager('roles', 'v1')
      const params = {
        domain_id: this.domainId,
        scope: this.$store.getters.scope,
      }
      this.roleLoading = true
      try {
        const { data = {} } = await manager.list({ params })
        this.roleList = data.data || []
        this.form.fc.getFieldDecorator('roles', { initialValue: this.initialValue })
      } catch (err) {
        throw err
      } finally {
        this.roleLoading = false
      }
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    handleDeselect (value, option) {
      if (R.includes(value, this.initialValue) && !R.includes(value, this.deselectList)) this.deselectList.push(value)
      if (!R.includes(value, this.initialValue) && R.includes(value, this.selectList)) {
        for (let i = 0; i < this.selectList.length; i++) {
          if (this.selectList[i] === value) {
            this.selectList.splice(i, 1)
          }
        }
      }
    },
    handleSelect (val) {
      if (!R.includes(val, this.initialValue) && !R.includes(val, this.selectList)) this.selectList.push(val)
      if (R.includes(val, this.initialValue) && R.includes(val, this.deselectList)) {
        for (let i = 0; i < this.deselectList.length; i++) {
          if (this.deselectList[i] === val) {
            this.deselectList.splice(i, 1)
          }
        }
      }
    },
    doJoint (roles) {
      return this.manager.performAction({
        id: this.params.uid,
        action: 'join',
        data: {
          projects: [this.params.data[0].id],
          roles: roles,
        },
      })
    },
    doLeave (roles) {
      return this.manager.performAction({
        id: this.params.uid,
        action: 'leave',
        data: {
          group: true,
          project_roles: roles,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.selectList.length > 0) {
          const { roles } = await this.form.fc.validateFields()
          await this.doJoint(roles)
        }
        if (this.deselectList.length > 0) {
          const roles = this.deselectList.map(item => ({
            project: this.params.data[0].id,
            role: item,
          }))
          await this.doLeave(roles)
        }
        this.cancelDialog()
        this.$bus.$emit('UserSidepageProjectsListRefresh')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
