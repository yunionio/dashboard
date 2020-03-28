<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">删除</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" name="主机" :action="this.params.title" />
      <vxe-grid v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { DISK_TYPES } from '@Compute/constants'
import { mapGetters } from 'vuex'
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
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_SERVER_DELETE)
    },
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
      window.location.href = this.$appConfig.v1Perfix + '/workflow?type=me-process'
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
        const response = await this.params.list.onManager('batchDelete', {
          id: ids,
          managerArgs: { params },
        })
        if (this.params.success && R.is(Function, this.params.success)) {
          this.params.success(response)
        }
      }
      this.$message.success('操作成功')
    },
  },
}
</script>
