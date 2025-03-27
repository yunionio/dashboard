<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.perform_delete')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">{{$t('compute.text_1392')}}</div>
        <div v-if="isSomePrepaid" slot="message" class="mt-2">{{$t('compute.prepaid_delete_server.alert')}}</div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="this.params.title" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_1041')" v-bind="formItemLayout" v-if="isOpenWorkflow">
          <a-input v-decorator="decorators.reason" :placeholder="$t('compute.text_1105')" />
        </a-form-item>
        <template v-if="isShowAutoDelete">
          <!-- 快照 -->
          <a-form-item class="mb-0">
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
          <!-- 数据盘 -->
          <a-form-item class="mb-0">
            <a-tooltip>
              <template v-if="deleteDiskLimit.mustDelete" slot="title">
                {{deleteDiskLimit.tip}}
              </template>
              <a-checkbox
              :checked="form.fd.deleteDisk || (deleteDiskLimit.support && deleteDiskLimit.mustDelete)"
              :disabled="deleteDiskLimit.mustDelete"
              @change="deleteDiskChange">
                {{$t('compute.text_1385')}}
              </a-checkbox>
            </a-tooltip>
            <help-tooltip name="deleteDiskAtTheSameTime" />
          </a-form-item>
          <!-- EIP -->
          <a-form-item class="mb-0">
            <a-tooltip>
              <template v-if="deleteEipLimit.mustDelete || !deleteEipLimit.support" slot="title">
                {{deleteEipLimit.tip}}
              </template>
              <a-checkbox
              :checked="form.fd.deleteEip || (deleteEipLimit.support && deleteEipLimit.mustDelete)"
              :disabled="deleteEipLimit.mustDelete || !deleteEipLimit.support"
              @change="deleteEipChange">
                {{$t('compute.text_1386')}}
              </a-checkbox>
            </a-tooltip>
          </a-form-item>
        </template>
        <!-- 堡垒机 -->
        <a-form-model-item v-if="isShowDeleteBastionServer">
          <a-checkbox v-model="form.fd.delete_bastion_server">{{ $t('compute.delete_bastion_host') }}</a-checkbox>
        </a-form-model-item>
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
import i18n from '@/locales'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import WorkflowMixin from '@/mixins/workflow'
import { BATCH_OPERATE_SERVERS_MAX } from '@/constants/workflow'
import { findPlatform } from '@/utils/common/hypervisor'

const canDeleteBrandList = ['OneCloud', 'VMware', 'OpenStack', 'ZStack', 'DStack', 'Aliyun', 'Huawei', 'Qcloud', 'Aws', 'Azure', 'Google', 'HCSO', 'HCS']
const deleteEipLimit = {
  VMware: {
    support: false,
    tip: i18n.t('compute.disable_delete_eip_by_brand_tooltip', [i18n.t('providers.vmware')]),
  },
}
const deleteSnapshotLimit = {
  OneCloud: {
    mustDeleteOnCeph: true,
    tip: i18n.t('compute.disable_delete_snapshot_by_disk_tooltip', [i18n.t('common.storage.ceph')]),
  },
  Huawei: {
    mustDeleteOnBrand: true,
    tip: i18n.t('compute.disable_delete_snapshot_by_brand_tooltip', [i18n.t('providers.huawei')]),
  },
  HCSO: {
    mustDeleteOnBrand: true,
    tip: i18n.t('compute.disable_delete_snapshot_by_brand_tooltip', [i18n.t('providers.hcso')]),
  },
  HCS: {
    mustDeleteOnBrand: true,
    tip: i18n.t('compute.disable_delete_snapshot_by_brand_tooltip', [i18n.t('providers.hcs')]),
  },
  VMware: {
    mustDeleteOnBrand: true,
    tip: i18n.t('compute.disable_delete_snapshot_by_brand_tooltip', [i18n.t('providers.vmware')]),
  },
}
const deleteDiskLimit = {
  OneCloud: {
    mustDeleteOnLocalDisk: true,
    tip: i18n.t('compute.disable_delete_disk_by_disk_tooltip'),
  },
  VMware: {
    mustDeleteOnBrand: true,
    tip: i18n.t('compute.disable_delete_disk_by_brand_tooltip', [i18n.t('providers.vmware')]),
  },
}
export default {
  name: 'DeleteVmDialog',
  mixins: [DialogMixin, WindowsMixin, WorkflowMixin],
  data () {
    const isVmware = this.params.data[0].hypervisor === 'esxi'
    return {
      loading: false,
      disableDelete: isVmware,
      snapshotList: [],
      // diskList: [],
      form: {
        fc: this.$form.createForm(this),
        fd: {
          autoDelete: false,
          deleteEip: false,
          deleteSnapshot: false,
          deleteDisk: false,
          delete_bastion_server: false,
        },
      },
      decorators: {
        autoDelete: [
          'autoDelete',
          {
            valuePropName: 'checked',
            initialValue: isVmware,
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
      const isSomeCanDelete = this.params.data.some((item) => {
        return canDeleteBrandList.indexOf(item.brand) !== -1
      })
      return isSomeCanDelete
    },
    isShowDeleteBastionServer () {
      return this.params.data.some(item => item.metadata?.bastion_server)
    },
    deleteEipLimit () {
      const result = {
        support: true,
        mustDelete: false,
        tip: '',
      }
      this.params.data.map((item) => {
        if (deleteEipLimit[item.brand] && deleteEipLimit[item.brand].support === false) {
          result.support = false
          result.tip = deleteEipLimit[item.brand].tip
        }
      })
      return result
    },
    deleteSnapshotLimit () {
      const result = {
        support: true,
        mustDelete: false,
        tip: '',
      }
      this.params.data.map((item) => {
        if ((deleteSnapshotLimit[item.brand] && deleteSnapshotLimit[item.brand].mustDeleteOnBrand) || (deleteSnapshotLimit[item.brand] && deleteSnapshotLimit[item.brand].mustDeleteOnCeph && this.checkDiskType(item, 'rbd'))) {
          result.mustDelete = true
          result.tip = deleteSnapshotLimit[item.brand].tip
        }
      })
      return result
    },
    deleteDiskLimit () {
      const result = {
        support: true,
        mustDelete: false,
        tip: '',
      }
      this.params.data.map((item) => {
        if ((deleteDiskLimit[item.brand] && deleteDiskLimit[item.brand].mustDeleteOnBrand) || (deleteDiskLimit[item.brand] && deleteDiskLimit[item.brand].mustDeleteOnLocalDisk && this.checkDiskType(item, 'local'))) {
          result.mustDelete = true
          result.tip = deleteDiskLimit[item.brand].tip
        }
      })
      return result
    },
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(this.WORKFLOW_TYPES.APPLY_SERVER_DELETE)
    },
    confirmText () {
      return this.isOpenWorkflow ? this.$t('compute.text_288') : this.$t('dialog.ok')
    },
    disableToolTip () {
      if (this.disableDelete) {
        return this.$t('compute.disable_delete_snapshot_tooltip')
      }
      return ''
    },
    isSomePrepaid () {
      return this.params.data.some(item => item.billing_type === 'prepaid')
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        if (this.isOpenWorkflow) {
          if (this.params.data.length > BATCH_OPERATE_SERVERS_MAX) {
            this.$message.error(this.$t('compute.workflow.operate_servers_check.message', [this.$t('compute.perform_delete'), BATCH_OPERATE_SERVERS_MAX]))
            this.loading = false
            return
          }
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
        paramter: JSON.stringify(this.getFormParams()),
      }
      await this.createWorkflow(variables)
      this.$message.success(this.$t('compute.text_1214'))
      this.$router.push('/workflow')
    },
    getFormParams () {
      const params = {}
      if (this.form.fd.deleteSnapshot || (this.deleteSnapshotLimit.support && this.deleteSnapshotLimit.mustDelete)) {
        params.delete_snapshots = true
      }
      if (this.form.fd.deleteDisk || (this.deleteDiskLimit.support && this.deleteDiskLimit.mustDelete)) {
        params.delete_disks = true
      }
      if (this.form.fd.deleteEip || (this.deleteEipLimit.support && this.deleteEipLimit.mustDelete)) {
        params.delete_eip = true
      }
      if (this.form.fd.delete_bastion_server) {
        params.delete_bastion_server = true
      }
      return params
    },
    async handleDelete () {
      if (this.params.ok) {
        await this.params.ok()
      } else {
        const ids = this.params.data.map(item => item.id)
        await this.form.fc.validateFields()
        let params = {}
        params = {
          ...params,
          ...this.params.requestParams,
          ...this.getFormParams(),
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
    fetchDiskData (id) {
      const diskManager = new this.$Manager('disks')
      const params = {
        filter: `server_id.in(${id})`,
        // server_id: id,
      }
      if (this.isAdminMode) { params.admin = true }
      return diskManager.list({ params })
    },
    fetchInstanceSnapshotData (id) {
      const instanceSnapshotManager = new this.$Manager('instance_snapshots')
      const params = { filter: `guest_id.in(${id})` }
      return instanceSnapshotManager.list({ params })
    },
    deleteEipChange (val) {
      const { checked } = val.target
      this.form.fd.deleteEip = checked
    },
    deleteDiskChange (val) {
      const { checked } = val.target
      this.form.fd.deleteDisk = checked
    },
    deleteSnapshotChange (val) {
      const { checked } = val.target
      this.form.fd.deleteSnapshot = checked
    },
    checkDiskType ({ disks_info = [] }, type) {
      const isSomeType = disks_info.some(item => {
        return type === item.storage_type
      })
      return isSomeType
    },
  },
}
</script>
