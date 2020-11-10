<template>
  <i :style="iconStyle" class="image-icon" />
</template>

<script>
import { IMAGE_MSG, CUSTOME_IMG } from './constants'
import i18n from '@/locales'

const sprites = require('./assets/sprites.png')
const unknow = require('./assets/unkonw.png')
const opensuse = require('./assets/suse.png')
const fedora = require('./assets/fedora.png')
const openeuler = require('./assets/openeuler.png')
const euleros = require('./assets/euleros.png')
const amazon = require('./assets/amazon.png')
const aliyun = require('./assets/aliyun.png')
const tencent = require('./assets/tencent.png')

export default {
  name: 'ImageIcon',
  props: {
    image: {
      type: String,
      required: true,
      validator: val => {
        if (Object.keys(IMAGE_MSG).includes(val.toLowerCase())) {
          return true
        } else {
          if (val !== 'other') {
            console.warn(i18n.t('common_16', [val]))
          }
          return true
        }
      },
    },
  },
  data () {
    return {
      sprites,
    }
  },
  computed: {
    imageInfo () {
      const tps = this.image.split(' ')
      const image = tps[0].toLowerCase()
      if (IMAGE_MSG[image]) {
        return {
          ...IMAGE_MSG[image],
          isUnknow: false,
        }
      } else if (CUSTOME_IMG[image]) {
        return {
          ...CUSTOME_IMG[image],
          isUnknow: false,
        }
      } else {
        return {
          label: this.$t('common_17'),
          position: '0px 0px',
          isUnknow: true,
        }
      }
    },
    iconStyle () {
      const { isUnknow, url } = this.imageInfo
      const style = {
        width: '16px',
        height: '16px',
        display: 'inline-block',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundImage: `url("${isUnknow ? unknow : sprites}")`,
        backgroundPosition: this.imageInfo.position,
      }
      if (url) {
        let curImg = opensuse
        switch (url) {
          case 'opensuse':
            curImg = opensuse
            break
          case 'fedora':
            curImg = fedora
            break
          case 'openeuler':
            curImg = openeuler
            break
          case 'euleros':
            curImg = euleros
            break
          case 'amazon':
            curImg = amazon
            break
          case 'aliyun':
            curImg = aliyun
            break
          case 'tencent':
            curImg = tencent
            break
          default:
            break
        }
        style.backgroundImage = `url("${curImg}")`
      }
      return style
    },
  },
}
</script>
