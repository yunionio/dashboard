<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_261')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="this.params.title" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_1041')" v-bind="formItemLayout" v-if="isOpenWorkflow">
          <a-input v-decorator="decorators.reason" :placeholder="$t('compute.text_1105')" />
        </a-form-item>
        <template v-show="isShowAutoDelete">
          <a-form-item :label="$t('compute.text_420')" v-bind="formItemLayout">
            <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.autoDelete" @change="autoDeleteChangeHandle" />
          </a-form-item>
          <a-form-item v-if="!form.fd.autoDelete" v-bind="formItemLayoutWithoutLabel">
            {{ $t('compute.text_1212', [snapshot.list.length]) }}
          </a-form-item>
        </template>
      </a-form>
      <dialog-table v-if="form.fd.autoDelete" :data="snapshot.list" :columns="snapshot.columns" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ confirmText }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { DISK_TYPES, SERVER_TYPE } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import WorkflowMixin from '@/mixins/workflow'
import { findPlatform } from '@/utils/common/hypervisor'
import { BRAND_MAP } from '@/constants'

export default {
  name: 'DeleteVmDialog',
  mixins: [DialogMixin, WindowsMixin, WorkflowMixin],
  data () {
    return {
      loading: false,
      snapshot: {
        list: [],
        columns: [
          {
            field: 'name',
            title: this.$t('compute.text_228'),
            showOverflow: 'ellipsis',
            width: 200,
            formatter: ({ row }) => {
              return row.name
            },
          },
          {
            field: 'snapshot_type',
            title: this.$t('compute.text_1213'),
            minWidth: 200,
            formatter: ({ row }) => {
              return row.is_disk ? this.$t('compute.text_101') : this.$t('compute.text_102')
            },
          },
          {
            field: 'disk_type',
            title: this.$t('compute.text_381'),
            minWidth: 200,
            formatter: ({ row }) => {
              return DISK_TYPES[row.disk_type] || row.disk_type
            },
          },
        ],
      },
      form: {
        fc: this.$form.createForm(this),
        fd: {
          autoDelete: false,
        },
      },
      decorators: {
        autoDelete: [
          'autoDelete',
          {
            valuePropName: 'checked',
            initialValue: false,
          },
        ],
        reason: [
          'reason',
          {
            initialValue: '',
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
      formItemLayoutWithoutLabel: {
        wrapperCol: {
          span: 19,
          offset: 5,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo']),
    type () {
      const brand = this.params.data[0].brand
      return findPlatform(brand)
    },
    isShowAutoDelete () {
      const brand = this.params.data[0].brand
      return this.type === SERVER_TYPE.idc || brand === BRAND_MAP.OpenStack.brand
    },
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_SERVER_DELETE)
    },
    confirmText () {
      return this.isOpenWorkflow ? this.$t('compute.text_288') : this.$t('dialog.ok')
    },
  },
  created () {
    if (this.isShowAutoDelete) {
      const ids = this.params.data.map((item) => { return item.id })
      this.fetchSnapshotsByVmId(ids.join(','))
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        if (this.isOpenWorkflow) {
          const projects = new Set(this.params.data.map(item => item.tenant_id))
          if (projects.size > 1) {
            this.$message.error(this.$t('compute.text_1348'))
            this.loading = false
            return
          }
          await this.handleDeleteByWorkflowSubmit()
        } else {
          await this.handleDelete()
        }
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    async handleDeleteByWorkflowSubmit () {
      const ids = this.params.data.map(item => item.id)
      const values = await this.form.fc.validateFields()
      const variables = {
        project: this.params.data[0].tenant_id,
        project_domain: this.params.data[0].domain_id,
        process_definition_key: this.WORKFLOW_TYPES.APPLY_SERVER_DELETE,
        initiator: this.userInfo.id,
        ids: ids.join(','),
        description: values.reason,
      }
      await this.createWorkflow(variables)
      this.$message.success(this.$t('compute.text_1214'))
      this.$router.push('/workflow')
    },
    async handleDelete () {
      if (this.params.ok) {
        await this.params.ok()
      } else {
        const ids = this.params.data.map(item => item.id)
        let params = {}
        params = {
          ...params,
          ...this.params.requestParams,
        }
        if (this.isShowAutoDelete) {
          params.delete_snapshots = this.form.fd.autoDelete
        }
        const response = await this.params.onManager('batchDelete', {
          id: ids,
          managerArgs: { params },
        })
        if (this.params.vm && this.params.vm.destroySidePages) {
          this.params.vm.destroySidePage(this.params.vm.windowId)
        }
        if (this.params.success && R.is(Function, this.params.success)) {
          this.params.success(response)
        }
      }
      this.$message.success(this.$t('compute.text_423'))
    },
    autoDeleteChangeHandle (val) {
      this.form.fd.autoDelete = val
    },
    async fetchSnapshotsByVmId (id) {
      try {
        const snapshotPromise = this.fetchSnapshotData(id)
        const snapshotRes = await snapshotPromise
        let snapshots = snapshotRes.data.data || []
        snapshots = snapshots.map((item) => {
          return {
            is_disk: true,
            ...item,
          }
        })
        const instanceSnapshotPromise = this.fetchInstanceSnapshotData(id)
        const instanceSnapshotRes = await instanceSnapshotPromise
        const instanceSnapshots = instanceSnapshotRes.data.data
        this.snapshot.list = [...snapshots, ...instanceSnapshots]
      } catch (e) {
        throw e
      }
    },
    fetchSnapshotData (id) {
      const snapshotManager = new this.$Manager('snapshots')
      const params = {
        joint_filter: `guestdisks.disk_id(disk_id).guest_id.in(${id})`,
        is_instance_snapshot: false,
      }
      if (this.isAdminMode) { params.admin = true }
      return snapshotManager.list({ params })
    },
    fetchInstanceSnapshotData (id) {
      const instanceSnapshotManager = new this.$Manager('instance_snapshots')
      const params = { filter: `guest_id.in(${id})` }
      return instanceSnapshotManager.list({ params })
    },
  },
}
</script>
