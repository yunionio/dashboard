<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title || $t('cloudenv.text_364')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="params.name" class="mt-3" :count="params.data.length" :action="params.action" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('common.full_sync_resource_type')">
          <a-select
            mode="multiple"
            v-decorator="[
              'resource',
              {
                initialValue: ['all'],
                rules: [{ required: true, message: $t('cloudenv.text_284', [$t('common.full_sync_resource_type')]) }]
              },
            ]"
            @change="handleResourceChange">
            <a-select-option v-for="v in resources" :key="v" :value="v">
              {{ v === 'all' ? $t('cloudenv.text_297') : getResourceI18n(v) }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'FullSyncResourceDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      resources: ['all', 'network', 'compute', 'loadbalancer', 'objectstore', 'rds', 'cache', 'nat', 'nas', 'waf', 'mongodb', 'es', 'kafka', 'app', 'container', 'quota', 'intervpcnetwork', 'cdn', 'dnszone'],
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
    }
  },
  methods: {
    getResourceI18n (v) {
      if (this.$te(`dictionary.${v}`)) {
        return this.$t(`dictionary.${v}`)
      }
      return v
    },
    handleResourceChange (v) {
      this.$nextTick(() => {
        if (v.join(',').endsWith('all')) {
          this.form.fc.setFieldsValue({
            resource: ['all'],
          })
        } else {
          if (v.includes('all') && v.length > 1) {
            this.form.fc.setFieldsValue({
              resource: v.filter(v => v !== 'all'),
            })
          }
        }
      })
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const ids = this.params.data.map(item => item.id)
        const values = await this.validateForm()

        if (this.params.onManager) {
          await this.params.onManager('batchPerformAction', {
            id: ids,
            steadyStatus: this.params.steadyStatus || {},
            managerArgs: {
              action: 'sync',
              data: {
                full_sync: true,
                force: true,
                resources: values.resource[0] === 'all' ? [] : values.resource,
              },
            },
          })
        } else {
          const ids = this.params.data.map(item => item.cloudprovider_id)
          await new this.$Manager('cloudproviders').batchPerformAction({
            ids: ids,
            action: 'sync',
            data: {
              resources: values.resource[0] === 'all' ? [] : values.resource,
              region: [
                this.params.data[0].cloudregion_id,
              ],
            },
            params: {
              full_sync: true,
              force: true,
            },
          })
        }
        this.params.callback && this.params.callback()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
