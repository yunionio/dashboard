<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">删除</div>
    <div slot="body">
      <a-alert v-if="alertProps" v-bind="alertProps" class="mb-2" />
      <dialog-selected-tips :count="params.data.length" name="硬盘" :action="this.params.title" />
      <vxe-grid v-if="params.columns && params.columns.length" class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="删除快照" v-bind="formItemLayout">
          <a-switch v-decorator="decorators.autoDelete" @change="autoDeleteChangeHandle" />
        </a-form-item>
      </a-form>
      <vxe-grid v-if="form.fd.autoDelete" class="mb-2" :data="snapshot.list" :columns="snapshot.columns" />
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'

export default {
  name: 'DeleteDiskDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      snapshot: {
        list: [],
        columns: [
          {
            field: 'name',
            title: '名称',
            minWidth: 200,
            formatter: ({ row }) => {
              return row.name
            },
          },
          {
            field: 'size',
            title: '快照大小',
            width: 70,
            formatter: ({ row }) => {
              return sizestr(row.size, 'M', 1024)
            },
          },
          {
            field: 'disk_type',
            title: '磁盘类型',
            width: 70,
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
    }
  },
  computed: {
    alertProps () {
      const { alert } = this.params
      const data = {
        'String': { message: alert, type: 'warning' },
        'Object': alert,
      }
      const t = R.type(alert)
      return data[t] || null
    },
  },
  created () {
    this.fetchSnapshotsByDiskId(this.params.data[0].id)
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        if (this.params.ok) {
          await this.params.ok()
        } else {
          const ids = this.params.data.map(item => item.id)
          let params = {}
          params = {
            ...params,
            ...this.params.requestParams,
            delete_snapshots: this.form.fd.autoDelete,
          }
          const response = await this.params.list.onManager('batchDelete', {
            id: ids,
            managerArgs: { params },
          })
          if (this.params.success && R.is(Function, this.params.success)) {
            this.params.success(response)
          }
        }
        this.cancelDialog()
        this.$message.success('操作成功')
      } finally {
        this.loading = false
      }
    },
    autoDeleteChangeHandle (val) {
      this.form.fd.autoDelete = val
    },
    async fetchSnapshotsByDiskId (diskId) {
      const manager = new this.$Manager('snapshots')
      const params = { disk_id: diskId }
      const res = await manager.list({ params })
      this.snapshot.list = res.data.data
    },
  },
}
</script>
