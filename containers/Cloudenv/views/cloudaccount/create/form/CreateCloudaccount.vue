<template>
  <component :is="currentComponent" v-bind="props" ref="createForm" />
</template>

<script>
import Aliyun from './components/Aliyun'
import AwsHuawei from './components/AwsHuawei'
import Azure from './components/Azure'
import Qcloud from './components/Qcloud'
import Ucloud from './components/Ucloud'
import VMware from './components/VMware'
import OpenstackZstack from './components/OpenstackZstack'
import S3CephXsky from './components/S3CephXsky'
import Google from './components/Google'
import Apsara from './components/Apsara'
import Cloudpods from './components/Cloudpods'
import HCSO from './components/HCSO'
import Nutanix from './components/Nutanix'
import BingoCloud from './components/BingoCloud'

export default {
  name: 'CreateCloudaccount',
  components: {
    AliyunCreate: Aliyun,
    UcloudCreate: Ucloud,
    AwsCreate: AwsHuawei,
    HuaweiCreate: AwsHuawei,
    AzureCreate: Azure,
    QcloudCreate: Qcloud,
    VMwareCreate: VMware,
    OpenstackCreate: OpenstackZstack,
    ZstackCreate: OpenstackZstack,
    DstackCreate: OpenstackZstack,
    S3Create: S3CephXsky,
    CephCreate: S3CephXsky,
    XskyCreate: S3CephXsky,
    GoogleCreate: Google,
    CtyunCreate: AwsHuawei,
    ApsaraCreate: Apsara,
    EcloudCreate: Aliyun,
    JDcloudCreate: Aliyun,
    CloudpodsCreate: Cloudpods,
    HCSOCreate: HCSO,
    NutanixCreate: Nutanix,
    BingoCloudCreate: BingoCloud,
  },
  props: {
    currentItem: {
      type: Object,
      required: true,
    },
  },
  computed: {
    currentComponent () {
      return this.currentItem.component
    },
    props () {
      return {
        provider: this.currentItem.provider,
      }
    },
  },
}
</script>
