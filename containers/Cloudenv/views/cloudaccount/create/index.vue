<template>
  <div class="cloudaccount-create">
    <steps class="mb-3" v-model="step" />
    <component :is="currentComponent" :current-item.sync="currentItem" ref="stepRef" />
    <page-footer>
      <div slot="left">
        <div class="d-flex align-items-center">
          <div class="mr-2">已选择: </div>
          <div class="item d-flex p-1 mb-0 align-items-center active">
            <img :src="currentItem.logo" />
            <h5 class="ml-2" v-if="showName(currentItem)">{{ currentItem.name }}</h5>
          </div>
        </div>
      </div>
      <div slot="right">
        <a-button class="mr-3" @click="perv" v-if="step.currentStep === 1">上一步</a-button>
        <a-button type="primary" @click="next">{{ nextStepTitle }}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import { CLOUDACCOUNT_TYPES } from '@Cloudenv/views/cloudaccount/constants'
import SelectCloudaccount from './form/SelectCloudaccount'
import CreateCloudaccount from './form/CreateCloudaccount'
import VmNetwork from './form/VmNetwork'
import step from '@/mixins/step'

export default {
  name: 'Cloudaccount',
  components: {
    SelectCloudaccount,
    CreateCloudaccount,
    VmNetwork,
  },
  mixins: [step],
  data () {
    return {
      c: null,
      currentItem: Object.values(Object.values(CLOUDACCOUNT_TYPES)[0])[0],
      currentComponent: 'SelectCloudaccount',
      step: {
        steps: [
          { title: '选择云平台', key: 'platform' },
          { title: '配置云账号', key: 'cloudaccount' },
        ],
        currentStep: 0,
      },
    }
  },
  computed: {
    nextText () {
      if (this.step.currentStep >= this.step.steps.length - 1) {
        return '确认'
      }
      return '下一步'
    },
  },
  watch: {
    'step.currentStep' (step) {
      if (step === 0) {
        this.currentComponent = 'SelectCloudaccount'
      } else if (step === 1) {
        this.currentComponent = 'CreateCloudaccount'
      } else {
        this.currentComponent = 'VmNetwork'
      }
    },
    currentItem (val) {
      if (val.name === 'VMware') {
        this.step.steps = [
          { title: '选择云平台', key: 'platform' },
          { title: '配置云账号', key: 'cloudaccount' },
          { title: '配置IP子网', key: 'network' },
        ]
      } else {
        this.step.steps = [
          { title: '选择云平台', key: 'platform' },
          { title: '配置云账号', key: 'cloudaccount' },
        ]
      }
    },
  },
  methods: {
    showName (item) {
      if (item.data) {
        if (item.data.hiddenName === true) {
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    },
    validateForm () {
      const refs = this.$refs.stepRef.$refs
      const { createForm } = refs
      return new Promise((resolve, reject) => {
        if (createForm && createForm.validateForm) {
          createForm.validateForm().then(values => {
            console.log(values, 'values111')
            resolve(values)
          }).catch(err => {
            reject(err)
          })
        } else {
          resolve()
        }
      })
    },
    next () {
      const { currentStep } = this.step
      const next = currentStep + 1
      this.setStep(next)
    },
    perv () {
      const { currentStep } = this.step
      const prev = currentStep - 1
      this.setStep(prev)
    },
  },
}
</script>

<style lang="scss">
.cloudaccount-create {
  .item {
    width: 120px;
    cursor: pointer;
    display: block;
    font-size: 14px;
    margin-bottom: 10px;
    border: 1px solid #eee;
    text-align: center;
    border-radius: 3px;
    box-sizing: border-box;
    &.active {
      border-color:#4DA1FF;
      h5{
        color:#4DA1FF;
      }
    }
    &:hover {
      border-color:#4DA1FF;
      h5{
        color:#4DA1FF;
      }
    }
    h5 {
      margin: 0;
      font-size: 13px;
      font-weight: 400;
    }
    img {
      height: 24px;
    }
  }
}
</style>
