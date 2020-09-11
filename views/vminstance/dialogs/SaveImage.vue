<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1236')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1236')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_1237')" v-if="isKvm">
          <a-radio-group v-decorator="decorators.type" @change="handleTypeChange">
            <a-radio-button :value="types.system.key">{{ types.system.label }}</a-radio-button>
            <a-radio-button :value="types.host.key">{{ types.host.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.text_228')">
          <a-input v-decorator="decorators.generate_name" :placeholder="$t('validator.imageName')" @change="e => {form.fi.generate_name = e.target.value}" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_494')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.auto_start" />
          <template v-slot:extra>
            <div>{{$t('compute.text_1238')}}</div>
            <div v-if="form.fi.type === types.host.key" class="mt-2">{{$t('compute.text_1239', [ diskCount ])}}</div>
          </template>
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
import { typeClouds } from '@/utils/common/hypervisor'

const hypervisorMap = typeClouds.hypervisorMap

export default {
  name: 'VmSaveImageDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const types = {
      host: {
        key: 'host',
        label: this.$t('compute.text_1240'),
      },
      system: {
        key: 'system',
        label: this.$t('compute.text_1241'),
      },
    }
    const typeInitialValue = types.system.key
    return {
      loading: false,
      types,
      images: [],
      form: {
        fc: this.$form.createForm(this),
        fi: {
          type: typeInitialValue,
          generate_name: '',
        },
      },
      decorators: {
        type: [
          'type',
          {
            initialValue: typeInitialValue,
          },
        ],
        generate_name: [
          'generate_name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_210') },
              { validator: this.$validate('imageName') },
              { validator: this.checkTemplateName },
            ],
          },
        ],
        auto_start: [
          'auto_start',
          {
            initialValue: true,
            valuePropName: 'checked',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    isKvm () {
      return this.params.data[0].hypervisor === hypervisorMap.kvm.key
    },
    diskCount () {
      return this.params.data[0].disk_count
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        const action = values.type === this.types.host.key ? 'save-guest-image' : 'save-image'
        values.id = ids
        values.is_public = false
        values.name = values.generate_name
        delete values.type
        await this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action,
            data: values,
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    handleTypeChange (e) {
      this.form.fi.type = e.target.value
    },
    checkTemplateName (rule, value, callback) {
      if (!value) {
        return callback(new Error(this.$t('compute.text_660')))
      }
      return new this.$Manager('images', 'v1').list({
        params: {
          name: value,
          scope: this.$store.getters.scope,
        },
      }).then(res => {
        const data = res.data.data
        if (!R.isNil(data) && !R.isEmpty(data)) {
          callback(new Error(this.$t('compute.text_662')))
        } else {
          callback()
        }
      })
    },
  },
}
</script>
