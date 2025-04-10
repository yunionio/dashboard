<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message" v-if="params.data.length === 1">{{$t('compute.text_1400')}}</div>
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
          <a-radio-group name="radioGroup" :defaultValue="true" v-if="isGroupAction" v-model="isOpenUsb">
            <a-radio :value="true">{{$t('compute.text_902')}}</a-radio>
            <a-radio :value="false">{{$t('compute.text_723')}}</a-radio>
          </a-radio-group>
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-model="isOpenUsb" v-else />
        </a-form-item>
        <a-form-item :label="$t('compute.text_1401')" v-show="isOpenUsb" :extra="$t('compute.text_1402')">
          <!-- 批量设置 -->
          <base-select
            v-if="isGroupAction"
            v-decorator="decorators.device"
            :params="usbParams"
            :need-params="false"
            :labelFormat="labelFormat"
            :disabled-items="disabledItems"
            filterable
            :resList.sync="usbOpt"
            :mapper="mapper"
            resource="isolated_devices"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_1172'), mode: 'default' }">
            <template v-slot:optionTemplate>
              <a-select-option v-for="item in usbOpt" :key="item.id" :value="item.id" :disabled="item.__disabled">
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
            :params="usbParams"
            :need-params="false"
            filterable
            :options="usbOptions"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_1403'), mode: 'multiple', loading: usbOptionsLoading }" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_294')" v-show="isOpenUsb && isGroupAction" :extra="$t('compute.text_1175')">
          <a-input-number :min="1" v-decorator="decorators.number" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_494')" :extra="$t('compute.text_495')" v-if="isOpenAutoStart">
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
// import * as R from 'ramda'
import {
  getIpsTableColumn,
} from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmAttachUsbDialog', // 目前只支持单挑操作，批量逻辑未调整
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.text_1399'),
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
              { required: true, type: 'any', message: this.$t('compute.text_1403'), trigger: 'change' },
            ],
          },
        ],
        autoStart: [
          'autoStart',
          {
            valuePropName: 'checked',
            initialValue: false,
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
      usbOpt: [],
      usbOptions: [],
      isOpenUsb: false,
      bindUsbs: [],
      usbOptionsLoading: false,
      columns: [
        {
          field: 'name',
          title: this.$t('compute.text_228'),
        },
        getIpsTableColumn({ field: 'ip', title: 'IP' }),
        {
          field: 'usb',
          title: 'USB',
          slots: {
            default: ({ row }) => {
              const ret = []
              if (row.isolated_devices) {
                row.isolated_devices.map(item => {
                  if (item.dev_type === 'USB') {
                    ret.push(<list-body-cell-wrap row={{ showName: `${item.addr || ''} ${item.model || ''}` }} field="showName" />)
                  }
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
    isOpenAutoStart () {
      return this.selectedItems.every(item => item.status === 'ready')
    },
  },
  created () {
    this.$D = new this.$Manager('servers', 'v1')
    this.initUsb()
  },
  methods: {
    initUsb () {
      const { isolated_devices = [] } = this.params.data[0]
      const devices = isolated_devices.filter(item => item.dev_type === 'USB')
      if (devices?.length > 0) {
        this.isOpenUsb = true
      }
      this.initUsbOptions()
    },
    async initUsbOptions () {
      try {
        this.usbOptionsLoading = true
        const acttachedRes = await new this.$Manager('isolated_devices', 'v2').list({
          params: {
            $t: 2,
            guest_id: this.params.data[0].id,
          },
        })
        const { data: acttachedList = [] } = acttachedRes.data
        const probleDevRes = await new this.$Manager('isolated_devices', 'v2').list({
          params: {
            $t: 1,
            host_id: this.params.data[0].host_id,
          },
        })
        const { data: probleDevList = [] } = probleDevRes.data
        const device = acttachedList.filter(item => {
          return item.dev_type === 'USB'
        }).map(item => {
          return item.id
        })
        this.bindUsbs = device
        this.form.fc.setFieldsValue({
          device,
        })
        const list = [...acttachedList]
        probleDevList.forEach(item => {
          if (!item.guest_id && !list.some(l => l.id === item.id)) {
            list.push(item)
          }
        })
        const usbOptions = list.filter(item => {
          return item.dev_type === 'USB'
        }).map(item => {
          return {
            key: item.id,
            id: item.id,
            name: `${item.addr || ''} ${item.model || ''}`,
          }
        })
        usbOptions.sort((a, b) => {
          return a.key - b.key
        })
        this.usbOptions = usbOptions
      } catch (err) {
        throw err
      } finally {
        this.usbOptionsLoading = false
      }
    },
    async doAttachSubmit (data) {
      const add_devices = []
      const del_devices = []

      data.device.map(item => {
        if (!this.bindUsbs.includes(item)) {
          add_devices.push(item)
        }
      })
      this.bindUsbs.map(item => {
        if (!data.device.includes(item)) {
          del_devices.push(item)
        }
      })
      const params = {
        add_devices,
        del_devices,
        auto_start: data.autoStart,
      }
      const ids = this.params.data.map(item => item.id)
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
      const params = {
        add_devices: [],
        del_devices: this.bindUsbs,
        auto_start: data.autoStart,
      }
      const ids = this.params.data.map(item => item.id)

      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'set-isolated-device',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.isOpenUsb) {
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
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        if (key === 'device') {
          this.form.fd[key] = values[key]
        } else {
          this.form.fd[key] = values[key]
        }
      })
    },
  },
}
</script>
