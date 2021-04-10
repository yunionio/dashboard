<template>
  <div class="w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item :label="$t('k8s.text_41')">
        <a-input :placeholder="$t('k8s.text_60')" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_305')">
        <a-input-number v-decorator="decorators.size" :min="1" :max="500" /> G
      </a-form-item>
      <a-form-item :label="$t('k8s.text_19')">
        <cluster-select v-decorator="decorators.cluster" @input="setCluster" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_23')">
        <namespace-select v-decorator="decorators.namespace" @input="setNamespace" :cluster="cluster" />
      </a-form-item>
      <a-form-item :label="$t('k8s.text_22')">
        <div slot="extra">{{$t('k8s.text_306')}}<help-link :href="storageClassHref">{{$t('k8s.text_307')}}</help-link>
        </div>
        <base-select
          show-sync
          v-decorator="decorators.storageClass"
          resource="storageclasses"
          version="v1"
          id-key="name"
          :resList.sync="storageclassOpts"
          :need-params="true"
          :params="storageclassParams"
          :select-props="{ placeholder: $t('k8s.text_308') }" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import * as R from 'ramda'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import k8sCreateMixin from '@K8S/mixins/create'

export default {
  name: 'K8sPersistentvolumeclaimCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
  },
  mixins: [k8sCreateMixin],
  data () {
    return {
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            R.forEachObjIndexed((value, key) => {
              this.form.fd[key] = value
            }, values)
          },
        }),
        fd: {
          cluster: this.$store.state.common.k8s.cluster,
        },
      },
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('k8s.text_60') },
              { min: 2, max: 24, message: this.$t('k8s.text_132'), trigger: 'blur' },
              { validator: this.$validate('k8sName') },
            ],
          },
        ],
        cluster: [
          'cluster',
          {
            initialValue: this.$store.state.common.k8s.cluster,
            rules: [
              { required: true, message: this.$t('k8s.text_30'), trigger: 'blur' },
            ],
          },
        ],
        namespace: [
          'namespace',
          {
            initialValue: this.$store.state.common.k8s.namespace,
            rules: [
              { required: true, message: this.$t('k8s.text_61'), trigger: 'blur' },
            ],
          },
        ],
        size: [
          'size',
          {
            initialValue: 1,
          },
        ],
        storageClass: [
          'storageClass',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_308'), trigger: 'blur' },
            ],
          },
        ],
      },
      storageclassOpts: [],
    }
  },
  computed: {
    storageClassHref () {
      return `/v2/k8s-storageclass/create?cluster=${this.form.fd.cluster}`
    },
    storageclassParams () {
      if (this.form.fd.cluster) {
        return {
          cluster: this.form.fd.cluster,
          limit: 0,
        }
      }
      return {}
    },
  },
  watch: {
    storageclassOpts (val, oldV) {
      let storageclass
      if (!R.equals(val, oldV)) {
        const defaultItem = val.find(v => v.isDefault)
        if (R.is(Object, defaultItem)) {
          storageclass = defaultItem.name
        }
      }
      this.form.fc.setFieldsValue({
        [this.decorators.storageClass[0]]: storageclass,
      })
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFieldsAndScroll({ scroll: { alignWithTop: true, offsetTop: 100 } }, (err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async _doCreate (data) {
      await new this.$Manager('persistentvolumeclaims', 'v1').create({ data })
    },
    async doCreate () {
      try {
        const values = await this.validateForm()
        const params = {
          ...values,
          size: values.size + 'G',
        }
        await this._doCreate(params)
        this.$message.success(this.$t('k8s.text_46'))
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
