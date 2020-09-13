<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message" v-if="params.data.length === 1">{{$t('compute.text_1167')}}</div>
        <div slot="message" v-else>
          <p>{{$t('compute.text_1168')}}</p>
          <p>{{$t('compute.text_1169')}}</p>
        </div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_1170')">
          <a-radio-group name="radioGroup" :defaultValue="true" v-if="isGroupAction" v-model="isOpenGpu">
            <a-radio :value="true">{{$t('compute.text_902')}}</a-radio>
            <a-radio :value="false">{{$t('compute.text_723')}}</a-radio>
          </a-radio-group>
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-model="isOpenGpu" v-else />
        </a-form-item>
        <a-form-item :label="$t('compute.text_607')" v-show="isOpenGpu" :extra="$t('compute.text_1171')">
          <!-- 批量设置 -->
          <base-select
            v-if="isGroupAction"
            v-decorator="decorators.device"
            :params="gpuParams"
            :need-params="false"
            :labelFormat="labelFormat"
            :disabled-items="disabledItems"
            filterable
            :resList.sync="gpuOpt"
            :mapper="mapper"
            resource="isolated_devices"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_1172'), mode: 'default' }">
            <template v-slot:optionTemplate>
              <a-select-option v-for="item in gpuOpt" :key="item.id" :value="item.id" :disabled="item.__disabled">
                <div class="d-flex">
                  <span class="text-truncate flex-fill mr-2" :title="item.model">{{ item.model }}</span>
                  <span style="color: #8492a6; font-size: 13px" v-show="item.totalCount > item.usedCount">{{$t('compute.text_1173', [ item.totalCount - item.usedCount , item.totalCount ])}}</span>
                  <span style="color: #8492a6; font-size: 13px" v-show="item.totalCount === item.usedCount">{{$t('compute.text_1174')}}</span>
                </div>
              </a-select-option>
            </template>
          </base-select>
          <!-- 单条操作 -->
          <base-select
            v-else
            v-decorator="decorators.device"
            :params="gpuParams"
            :need-params="false"
            :labelFormat="labelFormat"
            :disabled-items="disabledItems"
            filterable
            :resList.sync="gpuOpt"
            resource="isolated_devices"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_1172'), mode: 'multiple' }" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_294')" v-show="isOpenGpu && isGroupAction" :extra="$t('compute.text_1175')">
          <a-input-number :min="1" v-decorator="decorators.number" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_494')" :extra="$t('compute.text_495')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.autoStart" />
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
import {
  getIpsTableColumn,
} from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmAttachGpuDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.text_1176'),
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: {
          device: [],
        },
      },
      decorators: {
        device: [
          'device',
          {
            rules: [
              { required: true, type: 'any', message: this.$t('compute.text_1172'), trigger: 'change' },
            ],
          },
        ],
        autoStart: [
          'autoStart',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ],
        number: [
          'number',
          {
            initialValue: 1,
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
      gpuOpt: [],
      isOpenGpu: false,
      bindGpus: [],
      columns: [
        {
          field: 'name',
          title: this.$t('compute.text_228'),
        },
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
        {
          field: 'gpu',
          title: 'GPU',
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.isolated_devices) {
                row.isolated_devices.map(item => {
                  ret.push(<span>{item.model}</span>)
                })
              }
              return ret
            },
          },
        },
      ],
    }
  },
  computed: {
    selectedItems () {
      return this.params.data
    },
    gpuParams () {
      if (this.selectedItems && this.selectedItems.length > 0) {
        let host = ''
        this.selectedItems.map(item => {
          host += item.host_id + ','
        })
        host = host.substring(0, host.lastIndexOf(','))
        return { 'filter.0': `host_id.in(${host})`, limit: 0 }
      }
      return {}
    },
    attchGpu () {
      return this.form.fd.device.filter((id) => { return !this.bindGpus.includes(id) })
    },
    detachGpu () {
      return this.bindGpus.filter((id) => { return !this.form.fd.device.includes(id) })
    },
    disabledItems () {
      if (this.isGroupAction) {
        return this.gpuOpt.filter(val => {
          if (val.usedCount === val.totalCount) {
            return true
          } else if (val.totalCount - val.usedCount < this.params.data.length) {
            return true
          }
          return false
        }).map(item => { return item.id })
      } else {
        return this.gpuOpt.filter(val => { return val.guest_id && val.guest_id !== this.selectedItems[0].id }).map(item => { return item.id })
      }
    },
    isGroupAction () { // 是否是批量操作
      if (this.params.data.length > 1) return true
      return false
    },
  },
  watch: {
    gpuOpt () {
      if (!this.isGroupAction) {
        this.bindGpus = this.gpuOpt.filter(item => item.guest_id === this.params.data[0].id).map(item => { return item.id })
        if (this.bindGpus.length > 0) {
          this.form.fc.setFieldsValue({ device: this.bindGpus })
          this.isOpenGpu = true
        }
      }
    },
    disabledItems () {
      if (this.disabledItems && this.disabledItems.length && this.isGroupAction) { // 禁用某些选项
        this.disabledItems.forEach(disabledId => {
          this.gpuOpt.forEach(item => {
            if (disabledId === item.id) {
              item.__disabled = true
            }
          })
        })
      }
    },
  },
  methods: {
    async doAttachSubmit (data) {
      const params = {
        add_devices: this.attchGpu,
        del_devices: this.detachGpu,
        auto_start: data.autoStart,
      }
      const ids = this.params.data.map(item => item.id)
      if (ids.length > 1) {
        const selectedNum = this.params.data.length
        const { number: count } = data
        const gpuItem = this.gpuOpt.filter(item => { return item.id === this.attchGpu[0] })
        const model = gpuItem[0].model
        const remain = gpuItem[0].totalCount - gpuItem[0].usedCount
        if (selectedNum * count > remain) {
          this.$message.warning(this.$t('compute.text_1177'))
          throw new Error(this.$t('compute.text_1178'))
        }
        return this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'attach-isolated-device',
            data: {
              model,
              count,
              auto_start: data.autoStart,
            },
          },
        })
      }
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'set-isolated-device',
          data: params,
        },
      })
    },
    async doDetachSubmit (data) {
      // 批量解除绑定
      let params = {}
      if (this.isGroupAction) {
        params = {
          detach_all: true,
          auto_start: data.autoStart,
        }
      } else {
        params = {
          add_devices: [],
          del_devices: this.bindGpus,
          auto_start: data.autoStart,
        }
      }
      const ids = this.params.data.map(item => item.id)

      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: this.isGroupAction ? 'detach-isolated-device' : 'set-isolated-device',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.isOpenGpu) {
          const values = await this.form.fc.validateFields()
          await this.doAttachSubmit(values)
        } else {
          const values = await this.form.fc.getFieldsValue()
          await this.doDetachSubmit(values)
        }
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    mapper (data) {
      let newData = []
      newData = this.grpupMapper(data)
      return newData
    },
    // 格式化基本数据
    genResourceData (data) {
      const obj = {}
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        if (!obj[item.model]) {
          obj[item.model] = {
            usedCount: item.guest ? 1 : 0,
            totalCount: 1,
          }
          if (!item.guest) {
            obj[item.model] = {
              ...obj[item.model],
              ...item,
            }
          }
          // 兼容如果某个型号第一个就是已使用情况
          if (item.guest && !obj[item.model].id) {
            obj[item.model] = {
              ...obj[item.model],
              ...item,
            }
          }
        } else {
          obj[item.model].totalCount += 1
          if (item.guest) {
            obj[item.model].usedCount += 1
          } else {
            obj[item.model] = {
              ...obj[item.model],
              ...item,
            }
          }
        }
      }
      const newData = []
      R.forEachObjIndexed((value, key) => {
        newData.push(value)
      }, obj)
      return newData
    },
    grpupMapper (data) {
      const obj = {}
      for (var i = 0; i < data.length; i++) {
        const item = data[i]
        if (!obj[item.host_id]) {
          obj[item.host_id] = [
            item,
          ]
        } else {
          obj[item.host_id].push(item)
        }
      }
      for (const key in obj) {
        obj[key] = this.genResourceData(obj[key])
      }
      return this.filterSameModel(obj)
    },
    // 获取多个宿主机下共有的GPU型号数据
    filterSameModel (obj) {
      // 转成二维数组
      const arrs = []
      Object.values(obj).map(item => arrs.push(item))
      let arr = arrs.shift()
      for (let i = arrs.length; i--;) {
        const obj = {}
        arr = arr.concat(arrs[i]).filter((item, key) => {
          const objItem = obj[item.model]
          if (!objItem) {
            obj[item.model] = item
            obj[item.model].inx = key
          }
          if (objItem && objItem.inx !== key) {
            const readyRemain = objItem.totalCount - objItem.usedCount
            const targetRemain = item.totalCount - item.usedCount
            if (readyRemain > targetRemain) {
              objItem.totalCount = item.totalCount
              objItem.usedCount = item.usedCount
            } else {
              item.totalCount = objItem.totalCount
              item.usedCount = objItem.usedCount
            }
            return true
          }
          return false
        })
      }
      this.selectedItems.map(item => {
        if (!obj[item.host_id]) {
          arr = []
        }
      })
      return arr
    },
    labelFormat (val) {
      return val.model
    },
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        if (key === 'device') {
          if (this.isGroupAction) {
            this.form.fd[key] = [values[key]]
          } else {
            this.form.fd[key] = values[key]
          }
        } else {
          this.form.fd[key] = values[key]
        }
      })
    },
  },
}
</script>
