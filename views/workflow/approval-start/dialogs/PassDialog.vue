<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ action }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('common_198')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dictionary.project')" v-if="isShowJoinProject">
          <a-select
            :allowClear="true"
            class="w-100"
            :labelInValue="true"
            v-decorator="decorators.projects"
            :loading="projectLoading"
            showSearch>
            <a-select-option v-for="item of projectOptions" :value="item.id" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('dictionary.role')" v-if="isShowJoinProject">
          <a-select
            :allowClear="true"
            class="w-100"
            :labelInValue="true"
            v-decorator="decorators.roles"
            :loading="roleLoading"
            showSearch>
            <a-select-option v-for="item of roleOptions" :value="item.id" :key="item.id">{{ item.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('common_157')">
          <a-input :placeholder="$t('common_367')" v-decorator="decorators.remarks" />
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
import { mapGetters } from 'vuex'
import {
  getProcessDefinitionNameTableColumn,
  getResourceNameTableColumn,
  getInitiatorTableColumn,
} from '../../utils/columns'
import { WORKFLOW_TYPES } from '@/constants/workflow'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
const R = require('ramda')

export default {
  name: 'WorkflowPassDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('common_368'),
      projectOptions: [],
      roleOptions: [],
      projectLoading: false,
      roleLoading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        projects: [
          'projects',
          {
            rules: [
              {
                required: true,
                message: this.$t('dictionary.project') + this.$t('common_369'),
              },
            ],
          },
        ],
        roles: [
          'roles',
          {
            rules: [{ required: true, message: this.$t('dictionary.role') + this.$t('common_369') }],
          },
        ],
        remarks: [
          'remarks',
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
      columns: [
        getProcessDefinitionNameTableColumn({ field: 'process_instance.process_definition_name', title: this.$t('common_186') }),
        getResourceNameTableColumn({ title: this.$t('common_357') }),
        getInitiatorTableColumn({ field: 'process_instance.start_user_name' }),
      ],
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'l3PermissionEnable']),
    selectedItems () {
      return this.params.data
    },
    isShowJoinProject () {
      const pdk = this.selectedItems[0].process_definition_key || this.selectedItems[0].process_instance.process_definition_key
      return pdk === WORKFLOW_TYPES.APPLY_JOIN_PROJECT
    },
  },
  created () {
    if (this.isShowJoinProject) {
      this.fetchProjects()
      this.fetchRoles()
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const ids = this.params.data.map(item => item.id || (item.process_instance && item.process_instance.id))
        const values = await this.form.fc.validateFields()
        const params = {
          variables: {
            approved: true, // 审批结果：true通过，false拒绝
            comment: values.remarks, // 审批意见
          },
        }
        const state = this.selectedItems[0].process_instance && this.selectedItems[0].process_instance.state
        if (state === 'CUSTOM_TODO') {
          params.variables.user_retry = true
        }
        if (values.roles && values.projects && this.isShowJoinProject) {
          params.variables.parameter = JSON.stringify({ rids: values.roles.key, pids: values.projects.key })
        }
        const res = await new this.$Manager('process-tasks', 'v1').batchUpdate({
          ids,
          data: params,
        })
        const isOk = res.data.data.every(item => item.status === 200)
        if (isOk) {
          if (this.params.vm && this.params.vm.destroySidePages) {
            this.params.vm.destroySidePage(this.params.vm.windowId)
          }
          if (this.params.success && R.is(Function, this.params.success)) {
            this.params.success(res)
          }
          this.$message.success(this.$t('common_360'))
        }
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    fetchProjects () {
      const paramter = JSON.parse(this.selectedItems[0].variables.paramter || '{}')
      const manager = new this.$Manager('process-instances/projects', 'v1')
      const params = {
        domain: this.l3PermissionEnable ? paramter.project_domain : this.userInfo.projectDomainId,
      }
      this.projectLoading = true
      manager.list({ params }).then(res => {
        this.projectLoading = false
        this.projectOptions = res.data || []
      }).catch(() => {
        this.projectLoading = false
      })
    },
    fetchRoles () {
      const paramter = JSON.parse(this.selectedItems[0].variables.paramter || '{}')
      const manager = new this.$Manager('process-instances/roles', 'v1')
      const params = {
        domain: this.l3PermissionEnable ? paramter.project_domain : this.userInfo.projectDomainId,
      }
      this.roleLoading = true
      manager.list({ params }).then(res => {
        const data = res.data || []
        this.roleLoading = false
        this.roleOptions = data
      }).catch(() => {
        this.roleLoading = false
      })
    },
  },
}
</script>
