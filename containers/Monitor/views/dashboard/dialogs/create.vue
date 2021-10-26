<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('monitor.dashboard.dialog.create')}}</div>
    <div slot="body">
      <a-form :form="form" v-bind="formLayout">
        <a-form-item :label="$t('IAM.text_1')">
          <scope-select v-decorator="decorators.scope" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_228')">
          <a-input v-decorator="decorators.name" :placeholder="$t('common.placeholder')"  />
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
import ScopeSelect from '@Monitor/components/MonitorCard/sections/select/scope'

export default {
  name: 'CreateMonitorDashboard',
  components: {
    ScopeSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: this.$form.createForm(this),
      decorators: {
        scope: [
          'scope',
          {
            initialValue: { id: '', scope: this.$store.getters.scope },
            rules: [
              { validator: this.validateScope },
            ],
          },
        ],
        name: [
          'name',
          {
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
      },
      formLayout: {
        wrapperCol: {
          md: { span: 20 },
          xl: { span: 19 },
          xxl: { span: 21 },
        },
        labelCol: {
          md: { span: 4 },
          xl: { span: 5 },
          xxl: { span: 3 },
        },
      },
    }
  },
  methods: {
    validateScope (rule, value, callback) {
      if (this.scope === value.scope) {
        callback()
      } else {
        if (value.id) {
          callback()
        } else {
          const msg = this.$t('common.placeholder')
          callback(msg)
        }
      }
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
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
        const values = await this.validateForm()
        const data = {
          scope: values.scope.scope,
          name: values.name,
        }
        if (this.scope !== values.scope.scope && values.scope.id && values.scope.id.length > 0) {
          data[`${values.scope.scope}_id`] = values.scope.id
        }
        await new this.$Manager('alertdashboards', 'v1').create({ data })
        this.loading = false
        if (this.params.refresh && typeof this.params.refresh === 'function') {
          this.params.refresh()
        }
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>

<style scoped>

</style>
