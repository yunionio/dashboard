<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1084')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" :message="message" />
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.text_1084')" :name="$t('dictionary.snapshotpolicy')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <loader loading v-if="!bindedDisksLoaded" />
      <a-form :form="form.fc" hideRequiredMark v-else>
        <a-form-item :label="$t('compute.text_376')" v-bind="formItemLayout">
          <list-select
            v-if="form.fc.getFieldValue('disks')"
            v-decorator="decorators.disks"
            :list-props="diskProps"
            :multiple="true"
            :formatter="v => v.name" />
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
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'
import ListSelect from '@/sections/ListSelect'
import DiskPropsMixin from '../mixins/diskProps'

export default {
  name: 'AttachDiskDialog',
  components: {
    ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin, DiskPropsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        disks: [
          'disks',
          {
            initialValue: [],
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
      disksInitLoaded: false,
      bindedDisks: [],
      bindedDisksLoaded: false,
    }
  },
  computed: {
    ...mapGetters(['scope']),
    isAzure () {
      return this.params.data[0].provider === HYPERVISORS_MAP.azure.provider
    },
    isUCloud () {
      return this.params.data[0].provider === HYPERVISORS_MAP.ucloud.provider
    },
    message () {
      return this.$t('compute.text_1086')
    },
    diskParams () {
      return { limit: 20, tenant: this.params.data[0].tenant_id }
    },
  },
  watch: {
    bindedDisks (val) {
      if (val) {
        const ids = val.map((item) => { return item.id })
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ disks: ids })
        })
      }
    },
  },
  created () {
    this.fetchBindedDisks()
  },
  methods: {
    mapperDisks (data) {
      data = data.concat(this.bindedDisks)
      data = R.uniqBy(item => item.id, data)
      data = data.filter((item) => { return ['OneCloud', 'Qcloud', 'Aliyun'].includes(item.brand) && item.guest_count > 0 })
      return data
    },
    async fetchBindedDisks () {
      const manager = new this.$Manager('disks')
      try {
        const { data: { data = [] } } = await manager.list({
          params: {
            scope: this.scope,
            snapshotpolicy_id: this.params.data[0].id,
          },
        })
        this.bindedDisks = data
        this.bindedDisksLoaded = true
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      const manager = new this.$Manager('disks')
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = values.disks
        const disk = this.getDisks(ids, this.bindedDisks)
        const data = {
          snapshotpolicy_id: this.params.data[0].id,
        }
        if (disk.addDisks.length > 0) {
          await manager.batchPerformAction({
            ids: disk.addDisks,
            action: 'set-snapshotpolicy',
            data,
          })
        }
        if (disk.delDisks.length > 0) {
          await manager.batchPerformAction({
            ids: disk.delDisks,
            action: 'unbind-snapshotpolicy',
            data,
          })
        }
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    getDisks (newDisks = [], oldDisks = []) {
      const addDisks = []
      const delDisks = []
      const oldDiskIds = oldDisks.map((item) => { return item.id })
      newDisks.forEach((diskId) => {
        if (!oldDiskIds.includes(diskId)) {
          addDisks.push(diskId)
        }
      })
      oldDiskIds.forEach((diskId) => {
        if (!newDisks.includes(diskId)) {
          delDisks.push(diskId)
        }
      })
      return {
        addDisks,
        delDisks,
      }
    },
  },
}
</script>
