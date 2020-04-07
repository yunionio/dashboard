<template>
   <div class="guide-create">
     <steps :current="step" />
     <a-alert class="mb-3" type="warning" v-if="formConfig.helpMessages">
        <div slot="message">
           <div class="mt-2 mb-2" v-for="(msg, ind) in formConfig.helpMessages" :key="ind">{{ind+1}}. {{msg}}</div>
        </div>
      </a-alert>
     <div>
       <component :is="currentComponent" ref="REF_FORM" />
     </div>
     <page-footer style="left:0">
      <div slot="left" v-if="currentItem" style="padding-left: 60px">
        <div class="d-flex align-items-center">
          <div class="mr-2">已选择: </div>
          <div class="item d-flex p-1 mb-0 align-items-center active">
            <img :src="currentItem.logo" />
            <h5 class="ml-2" v-if="currentItem.name">{{ currentItem.name }}</h5>
          </div>
        </div>
      </div>
      <div slot="right">
        <a-button :loading="loading" class="mr-3" type="primary" @click="handleNext">下一步</a-button>
        <a-button @click="handleJump">跳过</a-button>
      </div>
    </page-footer>
   </div>
</template>

<script>
import * as R from 'ramda'
import Steps from './components/Steps'
import { ENV_FORMS, ENV_FORMS_CONFIG, SUB_EBV_ITMS } from './constants'
import componentsMixin from './mixins/componentsMixin'

export default {
  name: 'GuideForm',
  components: {
    Steps,
  },
  mixins: [componentsMixin],
  data () {
    return {
      loading: false,
      env: this.$route.query.env,
      nevKey: this.$route.query.key,
      step: 0,
      tempData: {},
    }
  },
  computed: {
    currentItem () {
      const { env, key } = this.$route.query
      if (env && key) {
        return SUB_EBV_ITMS[env][key]
      }
      return null
    },
    currentComponent () {
      return ENV_FORMS[this.env][this.step]
    },
    formConfig () {
      return ENV_FORMS_CONFIG[this.currentComponent]
    },
  },
  provide () {
    return {
      env: this.env,
      envKey: this.nevKey,
      tempData: this.tempData,
      formItemLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 3 },
          xxl: { span: 2 },
        },
      },
      offsetFormItemLayout: {
        wrapperCol: {
          md: {
            span: 21,
            offset: 2,
          },
        },
      },
    }
  },
  methods: {
    handleJump () {
      ++this.step
      if (this.over()) return false
    },
    over () {
      const nextUrl = ENV_FORMS[this.env][this.step]
      if (nextUrl.startsWith('/')) {
        this.$router.push({
          path: nextUrl,
        })
        return true
      }
      return false
    },
    async handleNext () {
      this.loading = true
      try {
        const ret = await this.$refs.REF_FORM.doSubmit()
        console.log(ret)
        if (ret && R.type(ret) === 'Array' && ret.length > 0) {
          const [k, refData] = ret
          if (k) {
            ++this.step
          }
          if (refData) {
            this.tempData[k] = refData
          }
          return true
        }
        if (ret === true) {
          ++this.step
        }
        if (this.over()) return false
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
<style lang="scss">
.guide-create {
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
