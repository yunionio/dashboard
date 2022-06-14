<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1054')}}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('compute.text_228')">
          <a-input :placeholder="$t('validator.serverCreateName')" v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-input :placeholder="$t('scope.text_55')" v-decorator="decorators.description" />
        </a-form-item>
        <a-form-item :label="$t('compute.tap')">
          {{params.tapService.name}}
        </a-form-item>
        <a-form-item :label="$t('compute.tap_direction')">
          <a-radio-group v-decorator="decorators.direction">
            <a-radio-button value="IN">{{ $t('compute.direction_in') }}</a-radio-button>
            <a-radio-button value="OUT">{{ $t('compute.direction_out') }}</a-radio-button>
            <a-radio-button value="BOTH">{{ $t('compute.direction_both') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.text_175')">
          <a-radio-group v-decorator="decorators.type">
            <a-radio-button value="vswitch">{{ $t('compute.vswitch') }}</a-radio-button>
            <a-radio-button value="vnic">{{ $t('compute.vswitch') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <template v-if="serverType === 'vswitch'">
          <a-form-item :label="$t('compute.text_175')">
            <a-radio-group v-decorator="decorators.type">
              <a-radio-button value="vswitch">{{ $t('compute.vswitch') }}</a-radio-button>
              <a-radio-button value="vnic">{{ $t('compute.vswitch') }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
        </template>
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
  name: 'TapFlowCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {
          type: 'vswitch',
        },
      },
      decorators: {
        cpu_core_count: [
          'cpu_core_count',
          {
            initialValue: 4,
          },
        ],
        memory_size_mb: [
          'memory_size_mb',
          {
            initialValue: 16,
          },
        ],
        description: ['description'],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    serverType () {
      return this.form.fd.type
    },
  },
  methods: {
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
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        values.memory_size_mb = values.memory_size_mb * 1024
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
