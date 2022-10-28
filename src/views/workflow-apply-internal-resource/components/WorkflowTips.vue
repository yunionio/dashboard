<template>
  <div class="tip-wrapper mt-2 mb-2" :class="resourceType === 'whole' ? 'yellow-bg' : ''">
    <div class="tip">{{tipTitle}}</div>
    <template v-for="(item, index) in tipList">
      <div class="tip" :key="index">
        {{item}}
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: 'WorkflowTips',
  props: {
    tips: {
      type: Array,
      default: () => [],
    },
    resourceType: String,
  },
  data () {
    return {
      tipOptions: {
        cloudResource: [
          this.$t('wz_workflow_form.tips.cloud_resource1'),
          this.$t('wz_workflow_form.tips.cloud_resource2'),
          this.$t('wz_workflow_form.tips.cloud_resource3'),
          this.$t('wz_workflow_form.tips.cloud_resource4'),
          this.$t('wz_workflow_form.tips.cloud_resource5'),
          this.$t('wz_workflow_form.tips.cloud_resource6'),
          this.$t('wz_workflow_form.tips.cloud_resource7'),
        ],
        basicSecurityServices: [
          this.$t('wz_workflow_form.tips.basicSecurityServices1'),
          this.$t('wz_workflow_form.tips.basicSecurityServices2'),
          this.$t('wz_workflow_form.tips.basicSecurityServices3'),
        ],
        cloudSecurityTable: [
          this.$t('wz_workflow_form.tips.cloudSecurityTable1'),
          this.$t('wz_workflow_form.tips.cloudSecurityTable2'),
          this.$t('wz_workflow_form.tips.cloudSecurityTable3'),
          this.$t('wz_workflow_form.tips.cloudSecurityTable4'),
          this.$t('wz_workflow_form.tips.cloudSecurityTable5'),
          this.$t('wz_workflow_form.tips.cloudSecurityTable6'),
          this.$t('wz_workflow_form.tips.cloudSecurityTable7'),
        ],
        whole: [
          this.$t('wz_workflow_form.tips.whole1'),
          this.$t('wz_workflow_form.tips.whole2'),
          this.$t('wz_workflow_form.tips.whole3'),
        ],
      },
    }
  },
  computed: {
    tipTitle () {
      if (this.resourceType) {
        return this.resourceType === 'whole' ? this.$t('wz_workflow_form.tips.whole_title') : this.$t('wz_workflow_form.tips.title')
      }
      return ''
    },
    tipList () {
      if (this.tips.length) {
        return this.tips
      } else {
        return this.tipOptions[this.resourceType] || []
      }
    },
  },
}
</script>

<style lang="less" scoped>
.tip-wrapper {
  padding: 5px;
  border-radius: 5px;
  .tip {
    height: 30px;
    line-height: 30px;
    font-size: 14px;
    color: gray;
  }
}
.yellow-bg {
  background: rgba(255, 223, 37, 1);
  padding: 24px;
}
</style>
