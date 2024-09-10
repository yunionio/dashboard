<template>
  <div class="blocked-resources">
    <a-form-item :label="$t('cloudenv.block_resources')">
      <a-switch
        :checkedChildren="$t('cloudenv.text_84')"
        :unCheckedChildren="$t('cloudenv.text_85')"
        v-decorator="decorators.isOpenBlockedResources"
        @change="blockedResourcesChangeHandle" />
    </a-form-item>
    <a-form-item :label="$t('cloudenv.block_resources_type')" v-if="isOpenBlockedResources">
      <base-select
        v-decorator="decorators.blockedResources"
        :options="BLOCKED_RESOURCES"
        :select-props="{ placeholder: $t('common.tips.select', [$t('cloudenv.block_resources_type')]), allowClear: true, mode: 'multiple' }" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { BLOCKED_RESOURCES } from '@Cloudenv/constants'

export default {
  name: 'BlockedResources',
  props: {
    decorators: {
      type: Object,
      validator: val => R.is(Array, val.isOpenBlockedResources) && R.is(Array, val.blockedResources),
    },
  },
  data () {
    return {
      BLOCKED_RESOURCES,
      isOpenBlockedResources: this.decorators.isOpenBlockedResources[1]?.initialValue || false,
    }
  },
  methods: {
    blockedResourcesChangeHandle (v) {
      this.isOpenBlockedResources = v
    },
  },
}
</script>

<style lang="scss" scoped></style>
