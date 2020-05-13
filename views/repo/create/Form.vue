<template>
  <div class="w-75">
    <a-form :form="form.fc" v-bind="formItemLayout">
      <a-form-item label="名称">
        <a-input placeholder="请输入名称" v-decorator="decorators.name" />
      </a-form-item>
      <a-form-item label="磁盘大小">
        <a-input-number v-decorator="decorators.size" :min="1" :max="500" /> G
      </a-form-item>
      <a-form-item label="集群">
        <cluster-select v-decorator="decorators.cluster" @input="setCluster" :clusterObj.sync="clusterObj" />
      </a-form-item>
      <a-form-item label="命名空间">
        <namespace-select v-decorator="decorators.namespace" @input="setNamespace" :cluster="clusterObj.id" />
      </a-form-item>
      <a-form-item label="存储类">
        <div slot="extra">
          没有想要的？可以前往
          <help-link href="/v2/k8s-storageclass/create"> 新建存储类</help-link>
        </div>
        <base-select
          v-decorator="decorators.storageClass"
          resource="storageclasses"
          version="v1"
          :resList.sync="storageclassOpts"
          :need-params="true"
          :params="storageclassParams"
          :select-props="{ placeholder: '请选择存储类' }" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import * as R from 'ramda'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'

export default {
  name: 'K8sPersistentvolumeclaimCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
  },
  data () {
    return {
      form: {
        fc: this.$form.createForm(this),
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
              { required: true, message: '请输入名称' },
              { min: 2, max: 24, message: '长度在 2 到 24 个字符', trigger: 'blur' },
              { validator: this.$validate('k8sName') },
            ],
          },
        ],
        cluster: [
          'cluster',
          {
            rules: [
              { required: true, message: '请选择集群', trigger: 'blur' },
            ],
          },
        ],
        namespace: [
          'namespace',
          {
            rules: [
              { required: true, message: '请选择命名空间', trigger: 'blur' },
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
              { required: true, message: '请选择存储类', trigger: 'blur' },
            ],
          },
        ],
      },
      clusterObj: {},
      storageclassOpts: [],
    }
  },
  computed: {
    storageclassParams () {
      if (this.clusterObj.id) {
        return {
          cluster: this.clusterObj.id,
          limit: 0,
        }
      }
      return {}
    },
  },
  watch: {
    storageclassOpts (val, oldV) {
      let storageclass = ''
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
        this.$message.success('操作成功')
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
