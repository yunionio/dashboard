<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_540')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="params.name || $t('dictionary.host')" :count="params.data.length" :action="$t('compute.text_540')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 2)" />
       <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_541')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.schedTags" :placeholder="$t('compute.text_123')" mode="multiple">
            <a-select-option v-for="item in schedTags" :key="item.id" :value="item.id">
              {{item.name}}
            </a-select-option>
          </a-select>
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

export default {
  name: 'HostsAdjustLabelDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        schedTags: [
          'schedTags',
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
      schedTags: [],
      useSchedTags: [],
    }
  },
  created () {
    this.loadSchedTags()
  },
  methods: {
    loadSchedTags (query) {
      const manager = new this.$Manager('schedtags')
      const params = { 'filter.0': 'resource_type.equals(hosts)', scope: this.scope }
      if (query && query.length > 0) {
        params['filter.1'] = 'name.contains(' + query + ')'
      }
      manager.list({ params })
        .then((res) => {
          this.schedTags = R.uniqBy(obj => obj.id, R.concat(res.data.data.map(item => ({
            id: item.id,
            name: item.name,
          })), this.useSchedTags))
          const allUseSchedTags = R.uniqBy(obj => obj.id, R.flatten(this.params.data.map(item => item.schedtags || [])))
          if (allUseSchedTags) {
            this.useSchedTags = allUseSchedTags.map(item => ({ id: item.id, name: item.name }))
            this.form.fc.setFieldsValue({ schedTags: allUseSchedTags.map(item => item.id) })
          }
        })
    },
    doBindSchedTags (data) {
      return this.params.onManager('batchPerformAction', {
        id: this.params.data.map(item => item.id),
        managerArgs: {
          action: 'set-schedtag',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        values.schedTags.forEach((item, idx) => {
          values[`schedtag.${idx}`] = item
        })
        Reflect.deleteProperty(values, 'schedTags')
        this.loading = true
        await this.doBindSchedTags(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
