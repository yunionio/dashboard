<template>
  <div>
    <page-header :title="$t('k8s.text_307')" />
    <a-form
      class="mt-3"
      :form="form.fc">
      <a-form-item
        :label="$t('k8s.text_348')"
        v-bind="formItemLayout">
        <a-radio-group v-decorator="decorators.storageType">
          <a-radio-button value="cephCSI">
            Ceph RBD
          </a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        :label="$t('k8s.text_41')"
        v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('k8s.text_60')" />
      </a-form-item>
      <a-form-item
        :label="$t('k8s.text_19')"
        v-bind="formItemLayout">
        <cluster-select
          v-decorator="decorators.cluster"
          @input="setCluster"
          style="width: 140px;" />
      </a-form-item>
      <a-form-item
        :label="$t('k8s.text_18')"
        class="mb-0"
        required
        v-bind="formItemLayout">
        <a-row>
          <a-col :span="4">
            <a-form-item>
              <namespace-select
                size="small"
                v-decorator="decorators.secretNamespace"
                :cluster="cluster"
                @change="secretNamespaceChange" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item>
              <base-select
                resource="secrets"
                v-decorator="decorators.secretName"
                :params="secretsParams"
                version="v1"
                :need-params="true"
                filterable
                showSync
                :placeholder="$t('k8s.text_349')" />
              <div class="ml-2" style="font-size: 12px;">{{$t('k8s.text_306')}}<a-button  style="font-size: 12px;" type="link" @click="toCreateSecret">{{$t('k8s.text_350')}}</a-button></div>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item
        :label="$t('k8s.text_351')"
        v-bind="formItemLayout">
        <a-select v-decorator="decorators.clusterId" :placeholder="$t('k8s.text_77')">
          <a-select-option v-for="item in cephcsiOpts" :value="item.clusterId" :key="item.clusterId">{{item.clusterId}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        label="Pool"
        v-bind="formItemLayout">
        <a-select v-decorator="decorators.pool" :placeholder="$t('k8s.text_352')">
          <a-select-option v-for="item in poolOpts" :value="item" :key="item">{{item}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        :label="$t('k8s.text_353')"
        v-bind="formItemLayout">
        <a-select v-decorator="decorators.csiFsType">
          <a-select-option value="ext4">ext4</a-select-option>
          <a-select-option value="xfs">xfs</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 20, offset: 3 }">
        <a-button class="mr-2" type="primary" @click="handleConfirm" :loading="loading">{{$t('common.create')}}</a-button>
        <a-button @click="cancel">{{$t('k8s.text_162')}}</a-button>
      </a-form-item>
    </a-form>
    <base-dialog v-if="showCreateCephCSI" @cancel="() => showCreateCephCSI = false">
      <div slot="header">{{$t('k8s.text_354')}}</div>
      <div slot="body">{{$t('k8s.text_355')}}</div>
      <div slot="footer">
        <a-button type="primary" @click="createCephCSI">{{$t('common.create')}}</a-button>
      </div>
    </base-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import k8sCreateMixin from '@K8S/mixins/create'

export default {
  name: 'StorageClassCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
  },
  mixins: [k8sCreateMixin],
  data () {
    const initCluster = _.get(this.$route, 'query.cluster') || this.$store.state.common.k8s.cluster
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.cluster) {
              this.fetchCephcsiOpts(values.cluster)
              this.fetchClusterStatus(values.cluster)
            }
            this.$nextTick(() => {
              this.fetchPoolOpts()
            })
          },
        }),
      },
      decorators: {
        storageType: [
          'storageType',
          {
            initialValue: 'cephCSI',
          },
        ],
        name: [
          'name',
          {
            validateTrigger: 'blur',
            rules: [
              { required: true, message: this.$t('k8s.text_60') },
            ],
          },
        ],
        cluster: [
          'cluster',
          {
            initialValue: initCluster,
            rules: [
              { required: true, message: this.$t('k8s.text_30') },
            ],
          },
        ],
        secretNamespace: [
          'secretNamespace',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_61') },
            ],
          },
        ],
        secretName: [
          'secretName',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_349') },
            ],
          },
        ],
        clusterId: [
          'clusterId',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_356') },
            ],
          },
        ],
        pool: [
          'pool',
          {
            rules: [
              { required: true, message: this.$t('k8s.text_357') },
            ],
          },
        ],
        csiFsType: [
          'csiFsType',
          {
            initialValue: 'ext4',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
      secretNamespace: '',
      cephcsiOpts: [],
      poolOpts: [],
      showCreateCephCSI: false,
    }
  },
  computed: {
    ...mapGetters(['userInfo', 'scope', 'isAdminMode']),
    secretsParams () {
      if (this.secretNamespace && this.cluster) {
        return {
          type: 'yunion.io/ceph-csi',
          namespace: this.secretNamespace,
          cluster: this.cluster,
          limit: 0,
        }
      }
      return {}
    },
  },
  created () {
    this.kubeclusterM = new this.$Manager('kubeclusters', 'v1')
    this.resourceM = new this.$Manager('storageclasses', 'v1')
  },
  methods: {
    async fetchClusterStatus (cluster) {
      const { data } = await this.kubeclusterM.get({
        id: `${cluster}/components-status`,
      })
      if (data && data.cephCSI && data.cephCSI.created === false) this.showCreateCephCSI = true
    },
    createCephCSI () {
      this.$router.push({
        path: '/k8s-kubecomponent/create',
        query: {
          kubeComponent: 'cephCSI',
          cluster: this.cluster,
        },
      })
    },
    async fetchPoolOpts () {
      const { clusterId, secretName, secretNamespace, cluster } = this.form.fc.getFieldsValue(['clusterId', 'secretName', 'secretNamespace', 'cluster'])
      if (clusterId && secretName && secretNamespace && cluster) {
        const params = {
          cephCSIRBD: {
            clusterId,
            secretName,
            secretNamespace,
          },
          cluster,
          name: 'rbd-climc',
          provisioner: 'rbd.csi.ceph.com',
        }
        const { data } = await this.resourceM.performClassAction({
          action: 'connection-test',
          data: params,
        })
        if (data && data.cephCSIRBD && data.cephCSIRBD.pools) {
          this.poolOpts = data.cephCSIRBD.pools
          this.form.fc.getFieldDecorator('pool', {
            preserve: true,
            initialValue: data.cephCSIRBD.pools[0],
          })
        }
      }
    },
    async fetchCephcsiOpts (cluster) {
      const { data } = await this.kubeclusterM.get({
        id: `${cluster}/component-setting`,
        params: { type: 'cephCSI' },
      })
      if (data && data.cephCSI && data.cephCSI.config) {
        this.cephcsiOpts = data.cephCSI.config
        if (this.cephcsiOpts.length) {
          this.form.fc.getFieldDecorator('clusterId', {
            preserve: true,
            initialValue: this.cephcsiOpts[0].clusterId,
          })
        }
      }
    },
    secretNamespaceChange (e) {
      this.secretNamespace = e
    },
    toCreateSecret () {
      const storageType = this.form.fc.getFieldValue('storageType')
      window.open(`${this.$router.resolve('/k8s-secret/create').href}?storageType=${storageType}`)
    },
    doCreate (values) {
      const data = {
        cephCSIRBD: {
          clusterId: values.clusterId,
          csiFsType: values.csiFsType,
          imageFeatures: 'layering',
          pool: values.pool,
          secretName: values.secretName,
          secretNamespace: values.secretNamespace,
        },
        cluster: values.cluster,
        name: values.name,
        provisioner: 'rbd.csi.ceph.com',
      }
      return this.resourceM.create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        this.loading = false
        this.$message.success(this.$t('k8s.text_184'))
        this.$router.push('/k8s-storageclass')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.$router.push('/k8s-storageclass')
    },
  },
}
</script>
