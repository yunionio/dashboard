## 业务组件 oc-select 通用版本

### 场景1 使用静态数据

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <oc-selelct
          v-decorator="decorators.city"
          :data="[{key: '001', label: '北京'}, {key: '002', label: '上海'}]"
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
    changeHanlde (curObjArr) {
      console.log(curObjArr && curObjArr[0])
    },
  },
}
</script>

<style lang="less" scope>

</style>
```

### 场景2 使用动态数据

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <oc-selelct
          v-decorator="decorators.city"
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
    changeHanlde (curObjArr) {
      console.log(curObjArr && curObjArr[0])
    },
  },
}
</script>

<style lang="less" scope>

</style>
```

### 场景3 支持状态及状态描述

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <oc-selelct
          v-decorator="decorators.city"
          resource="hosts"
          show-status
          status-desc="绿色表示该账号有可以选择的网络资源"
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
    changeHanlde (curObjArr) {
      console.log(curObjArr && curObjArr[0])
    },
  },
}
</script>

<style lang="less" scope>

</style>
```

### 场景4 支持下拉列表项目左右两列信息展示

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <oc-selelct
          v-decorator="decorators.city"
          resource="hosts"
          show-status
          status-desc="绿色表示该账号有可以选择的网络资源"
          width="500px"
          layout="between"
          :formatter="(item) => { return { key: item.id, label: item.name, rightLabel: item.id, ...item } }"
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
    changeHanlde (curObjArr) {
      console.log(curObjArr && curObjArr[0])
    },
  },
}
</script>

<style lang="less" scope>

</style>
```

### 场景5 默认支持search条件查询

### 场景6 支持自定义检索参数处理函数

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <oc-selelct
          v-decorator="decorators.city"
          resource="hosts"
          show-status
          status-desc="绿色表示该账号有可以选择的网络资源"
          width="500px"
          layout="between"
          :formatter="(item) => { return { key: item.id, label: item.name, rightLabel: item.id, ...item } }"
          :searchParams="(val) => { return {filter: `name.contains(${val})`} }"
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
    changeHanlde (curObjArr) {
      console.log(curObjArr && curObjArr[0])
    },
  },
}
</script>

<style lang="less" scope>

</style>
```

### 场景7 支持自定义下拉列表项目的模版

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <oc-selelct
          v-decorator="decorators.city"
          resource="hosts"
          show-status
          status-desc="绿色表示该账号有可以选择的网络资源"
          width="500px"
          :formatter="(item) => { return { key: item.id, label: item.name, ...item } }"
          :searchParams="(val) => { return {filter: `name.contains(${val})`} }"
          @selectChange="changeHanlde">
          <template v-slot:optTpl="{ resOpts }">
            <a-select-option v-for="item of resOpts" :key="item.id" :value="item.id">
              <a-badge status="success" /> {{ item.name }}
            </a-select-option>
          </template>
        </oc-selelct>
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
    changeHanlde (curObjArr) {
      console.log(curObjArr && curObjArr[0])
    },
  },
}
</script>

<style lang="less" scope>

</style>
```

### 场景8 支持刷新下拉列表数据

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <oc-selelct
          v-decorator="decorators.city"
          resource="hosts"
          show-status
          show-sync
          status-desc="绿色表示该账号有可以选择的网络资源"
          width="500px"
          layout="between"
          :formatter="(item) => { return { key: item.id, label: item.name, rightLabel: item.id, ...item } }"
          :searchParams="(val) => { return {filter: `name.contains(${val})`} }"
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
    changeHanlde (curObjArr) {
      console.log(curObjArr && curObjArr[0])
    },
  },
}
</script>

<style lang="less" scope>

</style>
```

### 场景9 支持自定义接口参数

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <oc-selelct
          v-decorator="decorators.city"
          resource="hosts"
          show-status
          show-sync
          :params="{a: 1, b: 2}"
          status-desc="绿色表示该账号有可以选择的网络资源"
          width="500px"
          layout="between"
          :formatter="(item) => { return { key: item.id, label: item.name, rightLabel: item.id, ...item } }"
          :searchParams="(val) => { return {filter: `name.contains(${val})`} }"
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
    changeHanlde (curObjArr) {
      console.log(curObjArr && curObjArr[0])
    },
  },
}
</script>

<style lang="less" scope>

</style>
```

### 场景10 支持设置下拉列表宽度，默认300px

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <oc-selelct
          v-decorator="decorators.city"
          resource="hosts"
          show-status
          show-sync
          :params="{a: 1, b: 2}"
          status-desc="绿色表示该账号有可以选择的网络资源"
          width="800px"
          layout="between"
          :formatter="(item) => { return { key: item.id, label: item.name, rightLabel: item.id, ...item } }"
          :searchParams="(val) => { return {filter: `name.contains(${val})`} }"
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
    changeHanlde (curObjArr) {
      console.log(curObjArr && curObjArr[0])
    },
  },
}
</script>

<style lang="less" scope>

</style>
```

### 场景11 支持多选

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <oc-selelct
          v-decorator="decorators.city"
          resource="hosts"
          show-status
          show-sync
          :params="{a: 1, b: 2}"
          status-desc="绿色表示该账号有可以选择的网络资源"
          width="600px"
          layout="between"
          mode="multiple"
          :formatter="(item) => { return { key: item.id, label: item.name, rightLabel: item.id, ...item } }"
          :searchParams="(val) => { return {filter: `name.contains(${val})`} }"
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
    changeHanlde (curObjArr) {
      console.log(curObjArr)
    },
  },
}
</script>

<style lang="less" scope>

</style>
```

### 场景12 支持label标签说明

``` html
<template>
  <div>
    <a-form layout="inline" :form="form" @submit="handleSubmit">
      <a-form-item label="city">
        <oc-selelct
          v-decorator="decorators.city"
          resource="hosts"
          show-status
          show-sync
          :params="{a: 1, b: 2}"
          status-desc="绿色表示该账号有可以选择的网络资源"
          width="600px"
          label="城市"
          :formatter="(item) => { return { key: item.id, label: item.name, rightLabel: item.id, ...item } }"
          :searchParams="(val) => { return {filter: `name.contains(${val})`} }"
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
    changeHanlde (curObjArr) {
      console.log(curObjArr)
    },
  },
}
</script>

<style lang="less" scope>

</style>
```

> 说明：支持Ant Design Vue中的a-select组件(https://antdv.com/components/select-cn/)的所有属性，直接在oc-select组件使用即可。
