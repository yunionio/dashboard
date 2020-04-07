<template>
  <div>
    <a-form :form="form.fc" v-bind="formItemLayout">
      <!-- <a-row :gutter="20">
        <a-col :span="11">
          <a-form-item label="二层网络">
            <base-select
              :remote="true"
              needParams
              :params="{ limit: 0 }"
              v-decorator="['wire', options.wire]"
              resource="wires"
              :remote-fn="q => ({ search: q })"
              :select-props="{ placeholder: '请选择二层网络' }" />
          </a-form-item>
        </a-col>
      </a-row> -->
      <a-form-item label="IP子网">
        <a-row :gutter="10" v-for="(item, index) in networkBaremetalList" :key="index">
          <a-col :span="1">
            <a-tag v-if="!index" color="blue">物理机</a-tag>
          </a-col>
          <a-col :span="4">
            <a-form-item>
              <a-input disabled :value="item.name" placeholder="子网名称" />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item>
              <a-input disabled :value="item.guest_ip_start" placeholder="起始IP地址" />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item>
              <a-input disabled :value="item.guest_ip_end" placeholder="结束IP地址" />
            </a-form-item>
          </a-col>
          <a-col :span="2">
            <a-form-item>
              <a-input-number disabled class="w-100" :value="item.guest_ip_mask" />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item>
              <a-input disabled :value="item.guest_gateway" placeholder="默认网关地址" />
            </a-form-item>
          </a-col>
        </a-row>
          <!-- 虚拟机 -->
        <a-row :gutter="10" v-for="(k, index) in form.fc.getFieldValue('keys')" :key="k">
          <a-col :span="1">
            <a-tag v-if="!index" color="blue">虚拟机</a-tag>
          </a-col>
          <a-col :span="4">
            <a-form-item>
              <a-input  v-decorator="[`${k}.name`, options.name]" placeholder="子网名称" />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item>
              <a-input v-decorator="[`${k}.guest_ip_start`, options.guest_ip_start]" placeholder="起始IP地址" />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item>
              <a-input v-decorator="[`${k}.guest_ip_end`, options.guest_ip_end]" placeholder="结束IP地址" />
            </a-form-item>
          </a-col>
          <a-col :span="2">
            <a-form-item>
              <a-select class="w-100" v-decorator="[`${k}.guest_ip_mask`, options.guest_ip_mask]">
                <a-select-option v-for="item in netMaskOptions" :key="item.value" :value="item.value">{{item.value}} </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item>
              <a-input v-decorator="[`${k}.guest_gateway`, options.guest_gateway]" placeholder="默认网关地址" />
            </a-form-item>
          </a-col>
          <a-col :span="2" v-if="form.fc.getFieldValue('keys').length > 1">
            <a-button @click="handleRemove(k)" shape="circle" icon="minus" size="small" class="mt-2 ml-2" />
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item v-bind="offsetFormItemLayout">
        <a-row :gutter="10">
          <a-col :span="11">
            <a-form-item v-bind="offsetFormItemLayout">
              <a-button type="dashed" style="width: 50%" @click="handleAdd">
                <a-icon type="plus" /> 增加虚拟机网段
              </a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  name: 'GuideNetworkCreate',
  inject: ['formItemLayout', 'offsetFormItemLayout', 'tempData'],
  data () {
    return {
      loading: false,
      networkBaremetalList: [],
      form: {
        fc: this.$form.createForm(this),
      },
      netMaskOptions: [
        { label: '16', value: '16' },
        { label: '17', value: '17' },
        { label: '18', value: '18' },
        { label: '19', value: '19' },
        { label: '20', value: '20' },
        { label: '21', value: '21' },
        { label: '22', value: '22' },
        { label: '23', value: '23' },
        { label: '24', value: '24' },
        { label: '25', value: '25' },
        { label: '26', value: '26' },
        { label: '27', value: '27' },
        { label: '28', value: '28' },
        { label: '29', value: '29' },
        { label: '30', value: '30' },
      ],
      options: {
        wire: {
          rules: [
            { required: true, message: '请选择二层网络' },
          ],
        },
        name: {
          initialValue: '',
          validateTrigger: ['change', 'blur'],
          validateFirst: true,
          rules: [
            { required: true, message: '请输入名称' },
            { validator: this.$validate('resourceName') },
          ],
        },
        guest_ip_start: {
          validateTrigger: ['change', 'blur'],
          validateFirst: true,
          rules: [
            { required: true, message: '请输入起始IP' },
            { validator: this.$validate('IPv4') },
          ],
        },
        guest_ip_end: {
          validateTrigger: ['change', 'blur'],
          validateFirst: true,
          rules: [
            { required: true, message: '请输入结束IP' },
            { validator: this.$validate('IPv4') },
          ],
        },
        guest_ip_mask: {
          initialValue: '16',
        },
        guest_gateway: {
          validateTrigger: ['change', 'blur'],
          validateFirst: true,
          rules: [
            { required: true, message: '请输入默认网管' },
            { validator: this.$validate('IPv4') },
            { validator: this.validateGateway },
          ],
        },
      },
    }
  },
  created () {
    this.form.fc.getFieldDecorator('keys', { initialValue: [new Date().valueOf()], preserve: true })
    this.manager = new this.$Manager('networks')
    this.fetchNetwork()
  },
  methods: {
    handleAdd () {
      const { fc } = this.form
      const keys = fc.getFieldValue('keys')
      const nextKeys = keys.concat(new Date().valueOf())
      fc.setFieldsValue({
        keys: nextKeys,
      })
    },
    handleRemove (k) {
      const { fc } = this.form
      const keys = fc.getFieldValue('keys')
      fc.setFieldsValue({
        keys: keys.filter(_ => _ !== k),
      })
    },
    async fetchNetwork () {
      try {
        const { data } = await this.manager.list({
          params: {
            limit: 0,
            server_type: 'baremetal',
          },
        })
        this.networkBaremetalList = (data.data || [])
      } catch (err) {
        throw err
      }
    },
    async doSubmit () {
      try {
        const { zone, ...values } = await this.form.fc.validateFields()
        delete values.keys
        const promises = []
        for (let k in values) {
          const params = {
            vlan_id: '1',
            server_type: 'guest',
            ...values[k],
          }
          promises.push(new Promise((resolve, reject) => {
            this.manager.create({
              data: params,
            }).then(({ data }) => {
              resolve(data)
            }).catch(err => {
              reject(err)
            })
          }))
        }
        await Promise.all(promises)
        return true
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
