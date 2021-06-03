## 业务组件 Select 通用版本

### 场景1 使用静态数据（支持搜索及清空选择）

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <os-selelct
          v-decorator="decorators.city"
          width="500px"
          :data="data"
          @selectChange="changeHanlde" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      data: [
        { key: '1', label: '北京' },
        { key: '2', label: '上海' },
      ],
      decorators: {
        city: [
          'city',
          {
            initialValue: '1',
            rules: [{ required: true, message: 'Please select your city!' }],
          },
        ],
      },
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this, { name: 'customized_form_controls' })
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
        }
      })
    },
    changeHanlde (v) {
      console.log(v)
    },
  },
}
</script>
```

### 场景2 使用远程服务接口数据（支持搜索及清空选择）

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <os-selelct
          v-decorator="decorators.city"
          width="500px"
          resource="hosts"
          :formatter="(item) => { return { key: item.id, label: item.name, ...item } }"
          @selectChange="changeHanlde" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      decorators: {
        city: [
          'city',
          {
            initialValue: '1',
            rules: [{ required: true, message: 'Please select your city!' }],
          },
        ],
      },
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this, { name: 'customized_form_controls' })
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
        }
      })
    },
    changeHanlde (v) {
      console.log(v)
    },
  },
}
</script>
```

### 场景3 支持状态，默认是显示为可用，可以通过数据属性disabled来控制不可用并禁用项目选择

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <os-selelct
          v-decorator="decorators.city"
          width="500px"
          resource="hosts"
          show-status
          :formatter="(item) => { return { key: item.id, label: item.name, ...item } }"
          @selectChange="changeHanlde" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      decorators: {
        city: [
          'city',
          {
            initialValue: '1',
            rules: [{ required: true, message: 'Please select your city!' }],
          },
        ],
      },
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this, { name: 'customized_form_controls' })
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
        }
      })
    },
    changeHanlde (v) {
      console.log(v)
    },
  },
}
</script>
```

### 场景4 支持选择项目自定义模版，默认是显示为可用，可以通过数据属性disabled来控制不可用并禁用项目选择

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <os-selelct
          v-decorator="decorators.city"
          width="500px"
          resource="hosts"
          show-status
          @selectChange="changeHanlde">
          <template v-slot:optTpl="{ resOpts }">
            <a-select-option :key="-1" :value="-1" :disabled="true">
              <a-badge status="success" text="绿色表示该账号有可以选择的网络资源" />
            </a-select-option>
            <a-select-option v-for="item of resOpts" :key="item.id" :value="item.id" :label="item.name">
              <a-badge status="success" /> {{ item.name }}
            </a-select-option>
          </template>
        </os-selelct>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      decorators: {
        city: [
          'city',
          {
            initialValue: '1',
            rules: [{ required: true, message: 'Please select your city!' }],
          },
        ],
      },
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this, { name: 'customized_form_controls' })
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
        }
      })
    },
    changeHanlde (v) {
      console.log(v)
    },
  },
}
</script>
```

### 场景5 支持左右两列信息展示

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <os-selelct
          v-decorator="decorators.city"
          width="500px"
          resource="hosts"
          show-status
          mode="between"
          :formatter="(item) => { return { key: item.id, leftLabel: item.name, rightLabel: item.id, ...item } }"
          @selectChange="changeHanlde" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      decorators: {
        city: [
          'city',
          {
            initialValue: '1',
            rules: [{ required: true, message: 'Please select your city!' }],
          },
        ],
      },
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this, { name: 'customized_form_controls' })
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
        }
      })
    },
    changeHanlde (v) {
      console.log(v)
    },
  },
}
</script>
```

### 场景6 支持状态及状态的描述信息展示

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <os-selelct
          v-decorator="decorators.city"
          width="500px"
          resource="hosts"
          mode="between"
          show-status
          status-desc="绿色表示该账号有可以选择的网络资源"
          :formatter="(item) => { return { key: item.id, leftLabel: item.name, rightLabel: item.id, ...item } }"
          @selectChange="changeHanlde" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">
          Submit
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
export default {
  data () {
    return {
      decorators: {
        city: [
          'city',
          {
            initialValue: '1',
            rules: [{ required: true, message: 'Please select your city!' }],
          },
        ],
      },
    }
  },
  beforeCreate () {
    this.form = this.$form.createForm(this, { name: 'customized_form_controls' })
  },
  methods: {
    handleSubmit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
        }
      })
    },
    changeHanlde (v) {
      console.log(v)
    },
  },
}
</script>
```
