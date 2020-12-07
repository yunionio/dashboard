<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_426')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :name="$t('dictionary.disk')" :action="$t('compute.text_426')" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_427')" v-bind="formItemLayout">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.isOpen" />
        </a-form-item>
        <template v-if="enable">
          <a-form-item :label="$t('compute.text_428')" v-bind="formItemLayout">
            <a-row :gutter="8">
              <a-col :span="12">
                <a-select v-decorator="decorators.snapshotpolicy" :filterOption="filterOption" showSearch>
                  <a-select-option v-for="item in snapshotpolicyOptions" :key="item.id">
                    {{getPolicyLabel(item)}}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="12">
                <a-icon type="sync" class="mr-1" @click="refresh" />
                <!-- <router-link target="_blank" :to="{ path: '/snapshotpolicy' }" style="color: #409EFF;">{{$t('compute.text_429')}}</router-link> -->
                <dialog-trigger :vm="params.vm" :extParams="{ tenant, domain }" :name="$t('compute.text_430')" value="CreateSnapshotPolicyDialog" resource="snapshotpolicies" @success="successCallback" />
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item :label="$t('compute.text_431')" v-bind="formItemLayout">
            <span class="ant-form-text">
              {{ weekTips }}
            </span>
          </a-form-item>
          <a-form-item :label="$t('compute.text_432')" v-bind="formItemLayout">
            <span class="ant-form-text">
              {{ timeTips }}
            </span>
          </a-form-item>
          <a-form-item :label="$t('compute.text_433')" v-bind="formItemLayout">
            <span class="ant-form-text">
              {{ dayTips }}
            </span>
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
import * as R from 'ramda'
import { weekOptions, timeOptions } from '../../../constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DiskSetSnapshotDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.hasOwnProperty('snapshotpolicy')) {
              this.assembly(values.snapshotpolicy)
            }
            if (values.hasOwnProperty('isOpen')) {
              this.enable = !this.enable
              if (values.isOpen === true && this.snapshotpolicyOptions.length) {
                this.$nextTick(function () {
                  this.form.fc.setFieldsValue({ snapshotpolicy: this.snapshotpolicyOptions[0].id })
                })
              }
            }
          },
        }),
      },
      decorators: {
        isOpen: [
          'isOpen',
          {
            valuePropName: 'checked',
            initialValue: this.params.data[0].snapshotpolicies && this.params.data[0].snapshotpolicies.length > 0,
          },
        ],
        snapshotpolicy: [
          'snapshotpolicy',
          {
            initialValue: this.params.data[0].snapshotpolicies && this.params.data[0].snapshotpolicies.length ? this.params.data[0].snapshotpolicies[0].id : '',
            rules: [
              { required: true },
            ],
          },
        ],
      },
      formItemLayout: {
        labelCol: {
          sm: { span: 3 },
        },
        wrapperCol: {
          sm: { span: 21 },
        },
      },
      snapshotpolicyOptions: [],
      attchedPolices: this.params.data[0].snapshotpolicies && this.params.data[0].snapshotpolicies.length ? this.params.data[0].snapshotpolicies : [],
      weekTips: '',
      timeTips: '',
      dayTips: '',
      enable: this.params.data[0].snapshotpolicies && this.params.data[0].snapshotpolicies.length,
    }
  },
  computed: {
    domain () {
      return this.params.data[0].domain_id
    },
    tenant () {
      return this.params.data[0].tenant_id
    },
  },
  created () {
    this.fetchSnaphotpolicy().then(() => {
      if (this.params.data[0].snapshotpolicies && this.params.data[0].snapshotpolicies.length) {
        this.assembly(this.params.data[0].snapshotpolicies[0].id)
      }
    })
    this.manager = new this.$Manager('snapshotpolicies')
  },
  methods: {
    refresh () {
      this.fetchSnaphotpolicy()
    },
    detachPolicy (id) {
      return this.manager.delete({
        id,
        ctx: [['disks', this.params.data[0].id]],
      })
    },
    detachPolices () {
      const promiseArr = this.attchedPolices.map(item => {
        return this.detachPolicy(item.id)
      })
      return Promise.all(promiseArr)
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        this.loading = true
        if (this.enable) {
          await this.detachPolices()
          await this.manager.performAction({
            id: values.snapshotpolicy,
            action: '',
            data: null,
            ctx: [['disks', this.params.data[0].id]],
          })
        } else {
          if (this.attchedPolices.length) {
            await this.detachPolices()
          }
        }
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    getPolicyLabel (item) {
      let text = item.name
      if (item.repeat_weekdays && item.repeat_weekdays.length) {
        text += this.$t('compute.text_434') + item.repeat_weekdays.map(item => weekOptions[item - 1]).join('、')
      }
      if (item.time_points && item.time_points.length) {
        text += '，' + item.time_points.map(item => timeOptions[item]).join('、')
      }
      if (item.retention_days === -1) {
        text += this.$t('compute.text_435')
      } else if (item.retention_days) {
        text += this.$t('compute.text_436', [item.retention_days])
      }
      if (text.length > 24) {
        return text.substring(0, 24) + '...'
      }
      return text
    },
    async fetchSnaphotpolicy () {
      const manager = new this.$Manager('snapshotpolicies')
      const params = {
        scope: this.scope,
        tenant: this.params.data[0].tenant_id,
      }
      try {
        const res = await manager.list({ params })
        const data = res.data.data
        if (data && data.length) {
          this.snapshotpolicyOptions = data.filter((item) => {
            return item.status === 'ready'
          })
        }
      } catch (error) {}
    },
    assembly (id) {
      const snapshotpolicyObj = R.indexBy(R.prop('id'), this.snapshotpolicyOptions)
      const selectItem = snapshotpolicyObj[id]
      this.weekTips = (
        selectItem.repeat_weekdays &&
        selectItem.repeat_weekdays.map(item => weekOptions[item - 1]).join('、')
      ) || '-'
      this.timeTips = (
        selectItem.time_points &&
        selectItem.time_points.map(item => timeOptions[item]).join('、')
      ) || '-'
      let ret = '-'
      if (selectItem.retention_days === -1) {
        ret = this.$t('compute.text_437')
      } else if (selectItem.retention_days) {
        ret = this.$t('compute.text_438', [selectItem.retention_days])
      }
      this.dayTips = ret
    },
    async successCallback () {
      await this.fetchSnaphotpolicy()
      this.form.fc.setFieldsValue({ snapshotpolicy: this.snapshotpolicyOptions[0].id })
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>
