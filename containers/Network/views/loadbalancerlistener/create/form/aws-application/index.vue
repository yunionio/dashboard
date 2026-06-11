<template>
  <div>
    <loading-block :loading="loading" v-if="loading" />
    <template v-else>
      <keep-alive>
        <components
          :is="step.steps[step.currentStep].component"
          :lbDetail="lbDetail"
          ref="formRef"
          :allFd.sync="allFd"
          :currentComponent="currentComponent"
          :listenerData="listenerData"
          :isUpdate="isUpdate" />
      </keep-alive>
    </template>
  </div>
</template>

<script>
import Protocol from './Protocol'
import Backendgroup from './Backendgroup'
import Healthcheck from './Healthcheck'
import mixin from '../mixins/form'
export default {
  components: {
    Protocol,
    Backendgroup,
    Healthcheck,
  },
  mixins: [mixin],
}
</script>
