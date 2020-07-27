<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('helm.text_72')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :name="$t('helm.text_73')" :action="$t('helm.text_72')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('helm.text_74')">
          <base-select
            v-decorator="decorators.revision"
            need-params
            :params="releaseParams"
            :options="options"
            id-key="revision"
            name-key="label"
            :select-props="{ placeholder: $t('helm.text_30') }" />
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'K8SRollbackDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      options: [],
      form: {
        fc: this.$form.createForm(this),
        fd: {},
      },
      data: this.params.data[0],
      containerImages: [],
      decorators: {
        revision: [
          'revision',
          {
            rules: [
              { required: true, message: this.$t('helm.text_30') },
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
      releaseParams: {
        cluster: this.params.cluster,
        namespace: this.params.namespace,
      },
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      const resource = `releases/${this.params.data[0].id}/history`
      const { data } = await new this.$Manager(resource, 'v1').list({ params: this.releaseParams })
      this.options = this.mapper(data)
    },
    mapper (data) {
      return data.map(val => {
        const time = this.$moment(new Date(val.updated))
        const date = time.format('YYYY-MM-DD')
        const fromNow = time.fromNow()
        return {
          ...val,
          label: `${val.chart}-${val.revision}: ${date}(${fromNow})`,
        }
      })
    },
    async doUpdate (values) {
      try {
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          managerArgs: {
            action: 'rollback',
            data: {
              namespace: this.params.namespace,
              cluster: this.params.cluster,
              revision: values.revision,
            },
          },
        })
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doUpdate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
