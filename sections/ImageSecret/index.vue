<template>
  <div>
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorators.secretType" @change="secretTypeChange">
        <a-radio-button value="none">无</a-radio-button>
        <a-radio-button value="select">已有密钥</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="secretType === 'select'">
      <base-select
        v-decorator="decorators.imagePullSecrets"
        resource="secrets"
        version="v1"
        idKey="name"
        :params="params"
        :need-params="true"
        :select-props="{ mode: 'multiple', placeholder: '请选择' }" />
      <div slot="extra">
        没有想要的密钥？可以立即
        <a-button type="link" @click="createImageSecret">新建密钥</a-button>
      </div>
    </a-form-item>
  </div>
</template>

<script>
import { SECRET_DEFAULT_TYPE } from '@K8S/constants'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'K8SImageSecrets',
  mixins: [WindowsMixin],
  props: {
    decorators: {
      type: Object,
      default: val => val.secretType && val.imagePullSecrets,
    },
    cluster: {},
    namespace: {},
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
  },
  data () {
    return {
      secretType: 'none',
    }
  },
  computed: {
    params () {
      if (this.cluster && this.namespace) {
        return {
          type: SECRET_DEFAULT_TYPE,
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
      this.createDialog('K8SImageSecretCreateDialog', {
        title: '新建镜像密钥',
        cluster: this.cluster,
        namespace: this.namespace,
        success: name => {
          if (this.form.fc) {
            this.form.fc.setFieldsValue({
              [this.decorators.imagePullSecrets[0]]: [name],
            })
          }
        },
      })
    },
  },
}
</script>
