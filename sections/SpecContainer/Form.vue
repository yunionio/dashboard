<template>
  <div>
    <a-form-item label="名称">
      <a-input placeholder="请输入名称" v-decorator="decorators.name" />
    </a-form-item>
    <a-form-item label="容器镜像">
      <a-input placeholder="请输入容器镜像" v-decorator="decorators.image" />
    </a-form-item>
    <a-form-item label="CPU">
      <a-input placeholder="请输入CPU核数" type="number" v-decorator="decorators.cpu" addonAfter="核" :min="1" />
    </a-form-item>
    <a-form-item label="内存">
      <a-input placeholder="请输入内存" type="number" v-decorator="decorators.memory" addonAfter="G" :min="1" />
    </a-form-item>
    <a-form-item label="容器命令">
      <a-input placeholder="容器命令，选填" v-decorator="decorators.command" />
    </a-form-item>
    <a-form-item label="命令参数">
      <a-input placeholder="命令参数，选填" v-decorator="decorators.arg" />
    </a-form-item>
    <a-form-item label="数据卷">
      <labels
        :decorators="decorators.volumeMount"
        title="存储声明"
        keyLabel="存储声明"
        valueLabel="挂载点"
        keyPlaceholder="请选择存储卷"
        valuePlaceholder="例如：/mnt"
        :keyBaseSelectProps="keyBaseSelectProps" />
    </a-form-item>
    <a-form-item label="环境变量">
      <labels :decorators="decorators.env" title="变量" keyLabel="变量" />
    </a-form-item>
    <a-form-item label="">
      <a-checkbox v-decorator="decorators.privileged">以特权模式运行</a-checkbox>
    </a-form-item>
  </div>
</template>

<script>
import Labels from '@K8S/sections/Labels'

export default {
  name: 'K8SSpecContainerForm',
  components: {
    Labels,
  },
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    cluster: String,
    namespace: String,
  },
  computed: {
    keyBaseSelectProps () {
      const params = {}
      if (this.cluster) {
        params.scope = this.$store.getters.scope
        params.unused = true
        params.cluster = this.cluster
        if (this.namespace) params.namespace = this.namespace
      }
      const props = {
        resource: 'persistentvolumeclaims',
        version: 'v1',
        params,
        needParams: true,
        idKey: 'name',
      }
      return props
    },
  },
}
</script>
