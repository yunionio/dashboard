<template>
  <div>
    <a-form
      v-bind="formItemLayout"
      :form="form.fc">
      <a-form-item label="名称">
        <a-input v-decorator="decorators.name" placeholder="请输入名称" />
      </a-form-item>
    </a-form>
    <div v-for="(item, i) in formList" :key="item.key" class="mb-3">
      <monitor-form
        :showDelete="formList.length > 1"
        :formItemLayout="formItemLayout"
        @paramsChange="val => paramsChange(val, i)"
        @remove="() => remove(i)" />
    </div>
    <div class="d-flex align-items-center">
      <a-button type="primary" shape="circle" icon="plus" size="small" :disabled="addDisabled"  @click="add" />
      <a-button type="link" @click="add" :disabled="addDisabled">添加查询</a-button>
    </div>
  </div>
</template>

<script>
import MonitorForm from './form'
import { uuid } from '@/utils/utils'

export default {
  name: 'MonitorForms',
  components: {
    MonitorForm,
  },
  data () {
    return {
      formList: [{ key: uuid() }],
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: '请输入名称' },
            ],
          },
        ],
      },
    }
  },
  computed: {
    addDisabled () {
      return !this.formList[this.formList.length - 1].model
    },
  },
  methods: {
    add () {
      this.$bus.$emit('togglePanel', false)
      this.$nextTick(() => {
        this.formList.push({ key: uuid() })
      })
    },
    paramsChange (params, i) {
      console.log(params, 'toParams')
      this.$set(this.formList[i], 'model', params)
      this.$emit('refresh', params, i)
    },
    remove (i) {
      this.formList.splice(i, 1)
      this.$emit('remove', i)
    },
  },
}
</script>

<style>

</style>
