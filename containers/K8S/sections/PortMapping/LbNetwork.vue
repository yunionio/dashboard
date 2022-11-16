<template>
  <div>
    <a-form-item
      :wrapperCol="{ span: 24 }"
      class="mb-0 mr-1">
      <base-select
        class="w-100"
        filterable
        :params="params"
        :item.sync="selectNet"
        resource="networks"
        v-decorator="decorator"
        @change="networkChange"
        :selectProps="{ placeholder: $t('k8s.lb.select_network') }" />
      <a-button type="link" class="mr-1 mt-1" @click="triggerConfigIp">{{$t('compute.text_198')}}</a-button>
    </a-form-item>
    <template v-if="configIp">
      <a-form-item class="mb-0" :wrapperCol="{ span: 24 }">
        <a-input
          style="width: 300px"
          v-decorator="addrDecorator(inputAddr, selectNet)"
          @change="ipChange"
          :placeholder="$t('k8s.lb.input_address')" />
      </a-form-item>
    </template>
  </div>
</template>

<script>
export default {
  name: 'K8SPortMappingLbNetwork',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
    addrDecorator: {
      type: Array,
      required: true,
    },
    vpcId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      selectNet: {},
      inputAddr: '',
      configIp: false,
      params: {
        cloudregion: 'default',
        scope: this.$store.getters.scope,
        vpc_id: this.vpcId,
      },
    }
  },
  methods: {
    ipChange (e) {
      this.inputAddr = e.target.value
    },
    triggerConfigIp () {
      this.configIp = !this.configIp
    },
  },
}
</script>
