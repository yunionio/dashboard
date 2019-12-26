<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">设置自动快照</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="自动快照" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.isOpen">
            <a-radio value="open">
              开启
            </a-radio>
            <a-radio value="close">
              关闭
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <template v-if="enable">
          <a-form-item label="策略名称" v-bind="formItemLayout">
            <a-row :gutter="8">
              <a-col :span="12">
                <a-select v-decorator="decorators.snapshotpolicy">
                  <a-select-option v-for="item in snapshotpolicyOptions" :key="item.id">
                    {{getPolicyLabel(item)}}
                  </a-select-option>
                </a-select>
              </a-col>
              <a-col :span="12">
                <a-icon type="sync" class="mr-1" @click="refresh" />
                <router-link target="_blank" :to="{ path: '/snapshotpolicy' }" style="color: #409EFF;">创建自定快照策略</router-link>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item label="备份日期" v-bind="formItemLayout">
            <span class="ant-form-text">
              {{ weekTips }}
            </span>
          </a-form-item>
          <a-form-item label="备份时间" v-bind="formItemLayout">
            <span class="ant-form-text">
              {{ timeTips }}
            </span>
          </a-form-item>
          <a-form-item label="保留时间" v-bind="formItemLayout">
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
  name: 'SetSnapshotDialog',
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
              if (values.isOpen === 'open' && this.snapshotpolicyOptions.length) {
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
            initialValue: 'close',
          },
        ],
        snapshotpolicy: [
          'snapshotpolicy',
          {
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
      attchedPolices: this.params.data[0].snapshotpolicies,
      weekTips: '',
      timeTips: '',
      dayTips: '',
      enable: false,
    }
  },
  created () {
    this.fetchSnaphotpolicy()
    this.manager = new this.$Manager('snapshotpolicies')
  },
  methods: {
    refresh () {
      this.fetchSnaphotpolicy()
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
    detachPolicy (id) {
      return this.manager.delete({
        id,
        ctx: [['disks', this.params.data[0]['id']]],
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
        let values = await this.validateForm()
        this.loading = true
        if (this.enable) {
          await this.detachPolices()
          await this.manager.performAction({
            id: values.snapshotpolicy,
            action: '',
            data: null,
            ctx: [['disks', this.params.data[0]['id']]],
          })
        } else {
          if (this.attchedPolices.length) {
            await this.detachPolices()
          }
        }
        this.loading = false
        this.params.list.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    getPolicyLabel (item) {
      let text = item.name
      if (item.repeat_weekdays && item.repeat_weekdays.length) {
        text += ' -- 每' + item.repeat_weekdays.map(item => weekOptions[item - 1]).join('、')
      }
      if (item.time_points && item.time_points.length) {
        text += '，' + item.time_points.map(item => timeOptions[item]).join('、')
      }
      if (item.retention_days === -1) {
        text += '，永久'
      } else if (item.retention_days) {
        text += `，${item.retention_days}天`
      }
      if (text.length > 24) {
        return text.substring(0, 24) + '...'
      }
      return text
    },
    async fetchSnaphotpolicy () {
      const manager = new this.$Manager('snapshotpolicies')
      let params = {
        scope: this.scope,
      }
      try {
        const res = await manager.list({ params })
        const data = (res.data.data || []).filter(item => {
          return !this.attchedPolices.find(a => a.id === item.id)
        })
        if (data && data.length) this.snapshotpolicyOptions = data
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
        ret = '永久'
      } else if (selectItem.retention_days) {
        ret = `${selectItem.retention_days}天`
      }
      this.dayTips = ret
    },
  },
}
</script>
