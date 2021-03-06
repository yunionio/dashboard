<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.perform_delete')}}</div>
    <div slot="body">
      <a-alert class="mb-4" type="warning" v-if="isCeph">
        <div slot="message">{{$t('compute.text_419')}}</div>
      </a-alert>
      <dialog-selected-tips :count="params.data.length" :name="$t('dictionary.disk')" :action="this.params.title" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc" v-show="isShowAutoDelete">
        <a-form-item :label="$t('compute.text_420')" v-bind="formItemLayout">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.autoDelete" @change="autoDeleteChangeHandle" />
        </a-form-item>
        <a-form-item v-if="!form.fd.autoDelete" v-bind="formItemLayoutWithoutLabel">
          {{ $t('compute.text_1310', [snapshot.list.length]) }}
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
import { DISK_TYPES, SERVER_TYPE } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { sizestr } from '@/utils/utils'
import { findPlatform } from '@/utils/common/hypervisor'
import { BRAND_MAP } from '@/constants'

export default {
  name: 'DiskDeleteDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      snapshot: {
        list: [],
        columns: [
          {
            field: 'name',
            title: this.$t('compute.text_228'),
            minWidth: 200,
            formatter: ({ row }) => {
              return row.name
            },
          },
          {
            field: 'size',
            title: this.$t('compute.text_422'),
            width: 70,
            formatter: ({ row }) => {
              return sizestr(row.size, 'M', 1024)
            },
          },
          {
            field: 'disk_type',
            title: this.$t('compute.text_381'),
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
      formItemLayoutWithoutLabel: {
        wrapperCol: {
          span: 21,
          offset: 3,
        },
      },
    }
  },
  computed: {
    type () {
      const brand = this.params.data[0].brand
      return findPlatform(brand)
    },
    isShowAutoDelete () {
      const brand = this.params.data[0].brand
      return this.type === SERVER_TYPE.idc || brand === BRAND_MAP.OpenStack.brand
    },
    isCeph () {
      const isSomeCeph = this.params.data.some((item) => {
        return item.storage_type === 'rbd'
      })
      return isSomeCeph
    },
  },
  created () {
    if (this.isShowAutoDelete) {
      const ids = this.params.data.map((item) => { return item.id })
      this.fetchSnapshotsByDiskId(ids.join(','))
    }
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
          }
          if (this.isShowAutoDelete) {
            params.delete_snapshots = this.form.fd.autoDelete
          }
          const res = await this.params.onManager('batchDelete', {
            id: ids,
            managerArgs: { params },
          })
          const isOk = res.data.data.every(item => item.status === 200)
          if (isOk) {
            if (this.params.success && R.is(Function, this.params.success)) {
              this.params.success(res)
            }
            this.$message.success(this.$t('compute.text_423'))
          }
          this.cancelDialog()
        }
      } finally {
        this.loading = false
      }
    },
    autoDeleteChangeHandle (val) {
      this.form.fd.autoDelete = val
    },
    async fetchSnapshotsByDiskId (diskId) {
      const manager = new this.$Manager('snapshots')
      const params = {
        scope: this.$store.getters.scope,
        filter: `disk_id.in(${diskId})`,
        is_instance_snapshot: false,
      }
      const res = await manager.list({ params })
      this.snapshot.list = res.data.data
    },
  },
}
</script>
