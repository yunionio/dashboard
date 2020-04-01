<template>
  <div>
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorators.secretType" @change="secretTypeChange">
        <a-radio-button value="new">新建密钥</a-radio-button>
        <a-radio-button value="select">已有密钥</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-button v-if="secretType === 'new'" type="link" @click="createImageSecret">新建密钥</a-button>
    <a-form-item v-if="secretType === 'select'">
      <base-select
        v-decorator="decorators.imagePullSecrets"
        resource="registrysecrets"
        version="v1"
        idKey="name"
        :params="params"
        :need-params="true"
        :select-props="{ mode: 'multiple', placeholder: '请选择' }" />
    </a-form-item>
  </div>
</template>

<script>
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ImageSecrets',
  mixins: [WindowsMixin],
  props: {
    decorators: {
      type: Object,
      default: val => val.secretType && val.imagePullSecrets,
    },
    cluster: {},
    namespace: {},
  },
  data () {
    return {
      secretType: 'new',
    }
  },
  computed: {
    params () {
      if (this.cluster && this.namespace) {
        return {
          cluster: this.cluster,
          namespace: this.namespace,
        }
      }
      return {}
    },
  },
  methods: {
    secretTypeChange (e) {
      this.secretType = e.target.value
    },
    createImageSecret () {
      this.createDialog('ImageSecretCreateDialog', {
        title: '新建镜像密钥',
        cluster: this.cluster,
        namespace: this.namespace,
      })
    },
  },
}
</script>
