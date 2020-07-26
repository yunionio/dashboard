<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">设置副本数</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" name="资源" action="设置副本数" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item label="副本数" v-if="!params.hideReplicas">
          <a-input v-decorator="decorators.replicas" :min="0" type="number" placeholder="请输入副本数" addonAfter="个" @blur="change" />
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
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'K8SSetLimitDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {},
      },
      data: this.params.data[0],
      decorators: {
        replicas: [
          'replicas',
          {
            rules: [
              { required: true, message: '请输入副本数' },
            ],
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
      replicas: 3,
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    change (e) {
      const val = Number(e.target.value)
      if (R.is(Number, val) && !Number.isNaN(val) && val >= 0) {
      } else {
        this.form.fc.setFieldsValue({
          replicas: this.replicas,
        })
      }
    },
    async fetchData () {
      const { data } = await this.params.onManager('get', {
        managerArgs: {
          id: this.data.name,
          params: {
            cluster: this.data.cluster,
            namespace: this.data.namespace,
          },
        },
      })
      this.replicas = data.replicas || 3
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          replicas: this.replicas,
        })
      })
    },
    async doUpdate (params) {
      const data = {
        replicas: params.replicas,
        cluster: this.data.cluster,
        namespace: this.data.namespace,
      }
      if (params.hideReplicas) delete data.replicas
      try {
        await this.params.onManager('update', {
          id: this.data.name,
          managerArgs: {
            data,
          },
          steadyStatus: Object.values(expectStatus.k8s_resource).flat(),
        })
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        await this.doUpdate(values)
        this.loading = false
        this.cancelDialog()
        if (R.is(Function, this.params.success)) this.params.success()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
