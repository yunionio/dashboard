<template>
  <div class="d-flex">
    <a-form-item>
      <a-input addonBefore="服务端口" v-decorator="decorators.port" type="number" />
    </a-form-item>
    <a-form-item>
      <a-input addonBefore="目标端口" v-decorator="decorators.targetPort" type="number" />
    </a-form-item>
    <a-form-item>
      <a-input-group compact>
        <div class="d-flex">
          <a-input class="oc-addonBefore ant-input-group-addon" style="width: 60px;" defaultValue="协 议" readonly />
          <a-select style="width: 100px;" v-decorator="decorators.protocol">
            <a-select-option value="TCP">TCP</a-select-option>
            <a-select-option value="UDP">UDP</a-select-option>
          </a-select>
        </div>
      </a-input-group>
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'K8SPortMappingPort',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.port && val.targetPort && val.protocol,
    },
  },
}
</script>
