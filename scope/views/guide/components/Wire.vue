<template>
  <div>
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-row :gutter="20">
        <a-col :span="11">
          <a-form-item label="可用区">
             <base-select
              :remote="true"
              needParams
              :params="{ limit: 0, cloud_env: 'private_or_onpremise' }"
              v-decorator="['zone', options.zone]"
              resource="zones"
              :remote-fn="q => ({ search: q })"
              :select-props="{ placeholder: '请选择可用区' }" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="20" v-for="k in form.fc.getFieldValue('keys')" :key="k">
        <a-col :span="11">
          <a-form-item label="名称">
            <a-input v-decorator="[`${k}.name`, options.name]" placeholder="请输入名称" />
          </a-form-item>
        </a-col>
        <a-col :span="11">
          <a-form-item label="备注">
            <a-input v-decorator="[`${k}.description`]" placeholder="请输入备注" />
          </a-form-item>
        </a-col>
        <a-col :span="2" v-if="form.fc.getFieldValue('keys').length > 1">
           <a-button @click="handleRemove(k)" shape="circle" icon="minus" size="small" class="mt-2 ml-2" />
        </a-col>
        <a-col :span="24">
          <a-divider class="mt-1" />
        </a-col>
      </a-row>
      <a-row :gutter="10">
         <a-col :span="11">
           <a-form-item v-bind="offsetFormItemLayout">
              <a-button type="dashed" style="width: 50%" @click="handleAdd">
                <a-icon type="plus" /> 新增一个二层网络
              </a-button>
            </a-form-item>
         </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script>
import { getRequestT } from '@/utils/utils'

export default {
  name: 'GuideWire',
  inject: ['formItemLayout', 'offsetFormItemLayout', 'tempData'],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      options: {
        zone: {
          initialValue: 'default',
          rules: [
            { required: true, message: '请选择可用区' },
          ],
        },
        name: {
          validateFirst: true,
          rules: [
            { required: true, message: '请输入名称' },
            { validator: this.$validate('resourceName') },
          ],
        },
      },
    }
  },
  created () {
    this.form.fc.getFieldDecorator('keys', { initialValue: [new Date().valueOf()], preserve: true })
    this.manager = new this.$Manager('wires')
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
    async doSubmit () {
      try {
        const { zone, ...wireParams } = await this.form.fc.validateFields()
        delete wireParams.keys
        const promises = []
        for (let k in wireParams) {
          const params = {
            vpc_id: 'default',
            zone_id: zone,
            name: wireParams[k].name,
            description: wireParams[k].description,
          }
          promises.push(new Promise((resolve, reject) => {
            this.manager.create({
              data: params,
              params: { $t: getRequestT() },
            }).then(({ data }) => {
              resolve(data)
            }).catch(err => {
              reject(err)
            })
          }))
        }
        const wire = await Promise.all(promises)
        return ['wire', wire]
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
