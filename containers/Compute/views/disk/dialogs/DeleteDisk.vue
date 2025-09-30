<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.perform_delete')}}</div>
    <div slot="body">
      <!-- <a-alert class="mb-4" type="warning" v-if="isCeph">
        <div slot="message">{{$t('compute.text_419')}}</div>
      </a-alert> -->
      <dialog-selected-tips :count="params.data.length" :name="$t('dictionary.disk')" :action="this.params.title" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc" v-show="isShowAutoDelete">
        <!-- <a-form-item :label="$t('compute.text_420')" v-bind="formItemLayout">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.autoDelete" @change="autoDeleteChangeHandle" />
        </a-form-item>
        <a-form-item v-if="!form.fd.autoDelete" v-bind="formItemLayoutWithoutLabel">
          {{ $t('compute.text_1310', [snapshot.list.length]) }}
        </a-form-item> -->
        <!-- 快照 -->
        <a-form-item v-if="deleteSnapshotLimit.show" class="mb-0">
          <a-tooltip>
            <template v-if="deleteSnapshotLimit.mustDelete" slot="title">
              {{deleteSnapshotLimit.tip}}
            </template>
            <a-checkbox
            :checked="form.fd.deleteSnapshot || (deleteSnapshotLimit.support && deleteSnapshotLimit.mustDelete)"
            :disabled="deleteSnapshotLimit.mustDelete"
            @change="deleteSnapshotChange">
              {{$t('compute.text_420')}}
            </a-checkbox>
          </a-tooltip>
        </a-form-item>
      </a-form>
      <!-- <dialog-table v-if="form.fd.autoDelete" :data="snapshot.list" :columns="snapshot.columns" /> -->
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>
<script>
import * as R from 'ramda'
import i18n from '@/locales'
// import { DISK_TYPES, SERVER_TYPE } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
// import { sizestr } from '@/utils/utils'
import { findPlatform } from '@/utils/common/hypervisor'
// import { BRAND_MAP } from '@/constants'

const canDeleteBrandList = ['OneCloud', 'VMware', 'OpenStack', 'ZStack', 'DStack', 'Aliyun', 'Huawei', 'Qcloud', 'Aws', 'Azure', 'Google', 'Ksyun']

const deleteSnapshotLimit = {
  OneCloud: {
    mustDeleteOnCeph: true,
    tip: i18n.t('compute.disable_delete_snapshot_by_disk_tooltip', [i18n.t('common.storage.ceph')]),
  },
  Huawei: {
    mustDeleteOnBrand: true,
    tip: i18n.t('compute.disable_delete_snapshot_by_brand_on_disk_tooltip', [i18n.t('providers.huawei')]),
  },
}

export default {
  name: 'DiskDeleteDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      snapshotList: [],
      form: {
        fc: this.$form.createForm(this),
        fd: {
          autoDelete: false,
          deleteSnapshot: false,
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
        deleteSnapshot: [
          'deleteSnapshot',
          {
            valuePropName: 'checked',
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
    brand () {
      const brand = this.params.data[0].brand
      return brand
    },
    type () {
      return findPlatform(this.brand)
    },
    isShowAutoDelete () {
      return canDeleteBrandList.indexOf(this.brand) >= 0
    },
    isCeph () {
      const isSomeCeph = this.params.data.some((item) => {
        return item.storage_type === 'rbd'
      })
      return isSomeCeph
    },
    deleteSnapshotLimit () {
      const result = {
        show: true,
        support: true,
        mustDelete: false,
        tip: '',
      }
      if (!(this.snapshotList && this.snapshotList.length)) {
        result.show = false
      }
      if ((deleteSnapshotLimit[this.brand] && deleteSnapshotLimit[this.brand].mustDeleteOnBrand) || (deleteSnapshotLimit[this.brand] && deleteSnapshotLimit[this.brand].mustDeleteOnCeph && this.isCeph)) {
        result.mustDelete = true
        result.tip = deleteSnapshotLimit[this.brand].tip
      }
      return result
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
            if (this.form.fd.deleteSnapshot || (this.deleteSnapshotLimit.support && this.deleteSnapshotLimit.mustDelete)) {
              params.delete_snapshots = true
            }
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
      this.snapshotList = res.data.data
    },
    deleteSnapshotChange (val) {
      const { checked } = val.target
      this.form.fd.deleteSnapshot = checked
    },
  },
}
</script>
