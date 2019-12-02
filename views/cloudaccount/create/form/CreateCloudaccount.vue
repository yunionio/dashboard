<template>
  <compontent :is="currentComponent" v-bind="props" ref="createForm" />
</template>

<script>
import AliyunUcloud from './components/AliyunUcloud'
import AwsHuawei from './components/AwsHuawei'
import Azure from './components/Azure'
import Qcloud from './components/Qcloud'
import VMware from './components/VMware'
import OpenstackZstack from './components/OpenstackZstack'
import S3CephXsky from './components/S3CephXsky'
import Gcp from './components/Gcp'

export default {
  name: 'CreateCloudaccount',
  components: {
    AliyunCreate: AliyunUcloud,
    UcloudCreate: AliyunUcloud,
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
    GcpCreate: Gcp,
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
