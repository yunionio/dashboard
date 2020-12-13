<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_470')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.lb_listener')" :count="params.data.length" :action="$t('network.text_470')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <acl :decorators="decorators" :form="form" :lbDetail="lbDetail" :listenerData="listenerData" />
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
import Acl from '@Network/views/loadbalancerlistener/components/Acl'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'LbListenerUpdateAclDialog',
  components: {
    Acl,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        acl_status: [
          'acl_status',
          {
            valuePropName: 'checked',
          },
        ],
        acl_type: [
          'acl_type',
          {
          },
        ],
        acl: [
          'acl',
          {
            rules: [
              { required: true, message: this.$t('network.text_363') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 17,
        },
        labelCol: {
          span: 7,
        },
      },
      lbDetail: this.params.lbDetail,
    }
  },
  mounted () {
    this.rollbackForm()
  },
  methods: {
    rollbackForm () {
      const itemData = this.params.data[0]
      const data = {
        [this.decorators.acl_status[0]]: itemData.acl_status === 'on',
        [this.decorators.acl_type[0]]: itemData.acl_type,
        [this.decorators.acl[0]]: itemData.acl_id,
      }
      R.forEachObjIndexed(value => {
        this.form.fc.getFieldDecorator(value[0], value[1])
      }, this.decorators)
      this.form.fc.setFieldsValue(data)
    },
    doUpdate (id, data) {
      return this.params.onManager('update', {
        id,
        managerArgs: {
          data,
        },
        steadyStatus: {
          status: Object.values(expectStatus.lb).flat(),
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const params = {
          acl_status: values.acl_status ? 'on' : 'off',
        }
        if (params.acl_status === 'on') {
          params.acl_type = values.acl_type
          params.acl = values.acl
        }
        await this.doUpdate(this.params.data[0].id, params)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
