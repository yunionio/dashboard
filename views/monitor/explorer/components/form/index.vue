<template>
  <a-form
    v-bind="formItemLayout"
    :form="form.fc">
    <a-form-item label="名称">
      <a-input v-decorator="decorators.name" placeholder="请输入名称" />
    </a-form-item>
    <a-form-item label="监控指标" class="mb-0">
      <metric :decorators="decorators" />
    </a-form-item>
    <a-form-item label="资源过滤">
      <filters :decorators="decorators" />
    </a-form-item>
  </a-form>
</template>

<script>
import * as R from 'ramda'
import Metric from './Metric'
import Filters from './Filters'
import { resolveValueChangeField } from '@/utils/common/ant'

export default {
  name: 'ExplorerForm',
  components: {
    Metric,
    Filters,
  },
  data () {
    return {
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            this.$nextTick(() => {
              const newField = resolveValueChangeField(values)
              R.forEachObjIndexed((item, key) => {
                this.$set(this.form.fd, key, item)
              }, newField)
            })
          },
        }),
        fd: {},
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
}
</script>

<style>

</style>
