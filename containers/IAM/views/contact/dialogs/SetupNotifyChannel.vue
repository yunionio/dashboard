<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('system.management_notify_channels') }}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('system.text_142')" :name="$t('system.text_317')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 5)" />
      <a-form :form="form" v-bind="formItemLayout">
        <a-form-item>
          <span slot="label">
            {{ $t('common_599') }}
            <a-tooltip effect="dark" placement="top">
              <a-icon type="info-circle" />
              <div slot="title">{{$t('system.contact')}}</div>
            </a-tooltip>
          </span>
          <a-checkbox-group
            v-decorator="decorators.enabled_contact_types">
            <a-checkbox
              v-for="(v, index) in contactArrOpts"
              :key="index"
              :value="v.value"
              :disabled="v.disabled">
              {{ v.label }}
            </a-checkbox>
          </a-checkbox-group>
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
import { contactMap } from '@/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SetupNotifyChannelsDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initialValue = {
      enabled_contact_types: ['webconsole'],
    }
    return {
      form: this.$form.createForm(this),
      contactArrOpts: [],
      decorators: {
        enabled_contact_types: [
          'enabled_contact_types',
          {
            initialValue: initialValue.enabled_contact_types,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  created () {
    this.generateContactArrOpts()
  },
  methods: {
    fetchConfig () {
      return new Promise((resolve, reject) => {
        new this.$Manager('receivers', 'v1').performClassAction({ action: 'get-types', data: {} }).then((res) => {
          const { types } = res.data
          resolve(types)
        }).catch((err) => {
          reject(err)
        })
      })
    },
    async generateContactArrOpts () {
      let config_contact_types = []
      try {
        config_contact_types = await this.fetchConfig()
      } catch (error) {
        throw error
      }
      const contactArrOpts = config_contact_types.filter((item) => {
        return !item.includes('robot')
      }).map((item) => {
        return {
          label: contactMap[item].label || item,
          value: item,
          disabled: item === 'webconsole',
        }
      })
      this.contactArrOpts = contactArrOpts
    },
    async handleConfirm () {
      this.loading = true
      try {
        const data = await this.form.validateFields()
        const ids = this.params.data.map((item) => { return item.id })
        await this.params.onManager('batchUpdate', {
          id: ids,
          managerArgs: { data: data },
        })
        this.loading = false
        if (this.params.success && R.is(Function, this.params.success)) {
          this.params.success()
        }
        this.cancelDialog()
      } catch (e) {
        this.loading = false
        throw e
      }
    },
  },
}
</script>

<style scoped>

</style>
