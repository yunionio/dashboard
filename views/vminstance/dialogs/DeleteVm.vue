<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">删除</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="this.params.title" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc" v-show="isIDC">
        <a-form-item label="同时删除快照" v-bind="formItemLayout">
          <a-switch checkedChildren="开" unCheckedChildren="关" v-decorator="decorators.autoDelete" @change="autoDeleteChangeHandle" />
        </a-form-item>
        <a-form-item v-if="!form.fd.autoDelete" v-bind="formItemLayoutWithoutLabel">
          该主机包含快照 {{ snapshot.list.length }} 个
        </a-form-item>
      </a-form>
      <dialog-table v-if="form.fd.autoDelete" :data="snapshot.list" :columns="snapshot.columns" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
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
            title: '名称',
            showOverflow: 'ellipsis',
            width: 200,
            formatter: ({ row }) => {
              return row.name
            },
          },
          {
            field: 'snapshot_type',
            title: '快照类型',
            minWidth: 200,
            formatter: ({ row }) => {
              return row.is_disk ? '硬盘快照' : '主机快照'
            },
          },
          {
            field: 'disk_type',
            title: '磁盘类型',
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
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      formItemLayoutWithoutLabel: {
        wrapperCol: {
          span: 21,
          offset: 3,
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
    isIDC () {
      return this.type === SERVER_TYPE.idc
    },
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_SERVER_DELETE)
    },
  },
  created () {
    if (this.isIDC) {
      const ids = this.params.data.map((item) => { return item.id })
      this.fetchSnapshotsByVmId(ids.join(','))
    }
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        if (this.isOpenWorkflow) {
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
      const variables = {
        process_definition_key: this.WORKFLOW_TYPES.APPLY_SERVER_DELETE,
        initiator: this.userInfo.id,
        ids: ids.join(','),
      }
      await this.createWorkflow(variables)
      this.$message.success('主机删除流程已提交')
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
        if (this.isIDC) {
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
      this.$message.success('操作成功')
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
