<template>
  <div class="mt-3 mb-3">
    <a-steps
      type="navigation"
      size="small"
      :current="current"
      :style="stepStyle">
      <a-step v-for="key in steps" :key="key" :title="config(key).title">
        <icon v-if="config(key).icon" type="blank" slot="icon" />
      </a-step>
    </a-steps>
  </div>
</template>

<script>
import { ENV_FORMS, ENV_FORMS_CONFIG } from '../constants.js'
export default {
  name: 'GuideSteps',
  props: {
    current: {
      type: Number,
      required: true,
    },
  },
  inject: ['env'],
  data () {
    return {
      stepStyle: {
        boxShadow: '0px -1px 0 0 #e8e8e8 inset',
      },
    }
  },
  computed: {
    steps () {
      return ENV_FORMS[this.env]
    },
  },
  methods: {
    config (name) {
      if (!ENV_FORMS_CONFIG[name]) return {}
      const { title, icon } = ENV_FORMS_CONFIG[name]
      return {
        title,
        icon,
      }
    },
  },
}
</script>

<style>

</style>
