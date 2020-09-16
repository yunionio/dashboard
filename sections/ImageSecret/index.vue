<template>
  <div>
    <a-form-item class="mb-0">
      <a-radio-group v-decorator="decorators.secretType" @change="secretTypeChange">
        <a-radio-button value="none">{{$t('k8s.text_75')}}</a-radio-button>
        <a-radio-button value="select">{{$t('k8s.text_76')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="secretType === 'select'">
      <base-select
        v-decorator="decorators.imagePullSecrets"
        resource="secrets"
        version="v1"
        :params="params"
        :need-params="true"
        :select-props="{ mode: 'multiple', placeholder: $t('k8s.text_77') }" />
      <div slot="extra">{{$t('k8s.text_78')}}<a-button type="link" @click="createImageSecret">{{$t('k8s.text_79')}}</a-button>
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
        title: this.$t('k8s.text_80'),
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
