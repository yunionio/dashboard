<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">关联硬盘</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" :message="message" />
      <dialog-selected-tips :count="params.data.length" action="关联硬盘" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <loader loading v-if="!(bindedDisksLoaded && disksInitLoaded)" />
      <a-form :form="form.fc" hideRequiredMark v-show="bindedDisksLoaded && disksInitLoaded">
        <a-form-item label="磁盘" v-bind="formItemLayout" v-if="bindedDisksLoaded">
          <base-select
            class="w-100"
            filterable
            remote
            v-decorator="decorators.disks"
            resource="disks"
            :mapper="mapperDisks"
            :params="{ limit: 20 }"
            :init-loaded.sync="disksInitLoaded"
            :select-props="{ allowClear: true, placeholder: '请选择磁盘', mode: 'tags' }" />
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
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'AttachDiskDialog',
  mixins: [DialogMixin, WindowsMixin],
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
    isAzure () {
      return this.params.data[0].provider === HYPERVISORS_MAP.azure.provider
    },
    isUCloud () {
      return this.params.data[0].provider === HYPERVISORS_MAP.ucloud.provider
    },
    message () {
      return '多个时间点的快照策略暂不支持绑定，只支持解绑操作'
    },
  },
  watch: {
    bindedDisks (val) {
      if (val) {
        const ids = val.map((item) => { return item.id })
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ 'disks': ids })
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
      return data
    },
    async fetchBindedDisks () {
      const manager = new this.$Manager('disks')
      try {
        const { data: { data = [] } } = await manager.list({
          params: {
            scope: this.scope,
            snapshotpolicy_id: this.params.data[0]['id'],
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
        console.log(1)
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        const data = {}
        values.disks.forEach((id, idx) => {
          data[`disk.${idx}`] = id
        })
        await manager.batchPerformAction({
          ids,
          action: 'bind-disks',
          data,
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
