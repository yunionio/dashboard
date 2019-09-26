import _ from 'lodash'
import * as R from 'ramda'

function diskFormatter (size) {
  let units = ['MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'YiB', 'ZiB']
  let unit = 'MiB'
  for (let i in units) {
    if (size < 1024) {
      unit = units[i]
      if (i <= 1) {
        size = Math.floor(size)
      } else {
        size = size.toFixed(1)
      }
      break
    }
    size = size / 1024
  }
  return `${size}${unit}`
}

function addToParams (params, condition, length, key, offset, rightfunc) {
  if (condition) {
    let leftfunc = i => key + (i + offset)
    for (let i = 0; i < length; i++) {
      let k = leftfunc(i)
      params[k] = rightfunc(i)
    }
  }
}

function _sortDisks (disks) {
  // sort disks.同样的(driver+adpater)连续排列
  let keyList = []
  let keyMap = {}
  disks.map((disk) => {
    let k = disk.driver + ':' + disk.adapter
    if (keyList.indexOf(k) >= 0) {
      keyMap[k].push(disk)
    } else {
      keyList.push(k)
      keyMap[k] = [disk]
    }
  })
  let sortedDisks = []
  keyList.map((key) => {
    // let _disks = keyMap[key].sort((a, b) => {
    //   let _a = a.device_fmts.length > 0 ? 1 : 0
    //   let _b = b.device_fmts.length > 0 ? 1 : 0
    //   return _a > _b
    // })

    sortedDisks = sortedDisks.concat(keyMap[key])
  })
  return sortedDisks
}

function diskConfToPostParams (baseParams, disks, isStringify = true) {
  let sortedDisks = _sortDisks(disks)
  if (isStringify) {
    stringifyParams(baseParams, disks, sortedDisks)
  } else {
    arrayifyParams(baseParams, sortedDisks)
  }
}

function stringifyParams (baseParams, disks, sortedDisks) {
  // convert disks config to post params & insert params to baseParams
  addToParams(baseParams, sortedDisks, sortedDisks.length, 'baremetal_disk_config.', 0, (i) => {
    let cfg = []
    if (disks[i].device.toLowerCase() === 'hdd') {
      cfg.push('rotate')
    }
    if (disks[i].device.toLowerCase() === 'ssd') {
      cfg.push('ssd')
    }
    cfg.push(disks[i].raid)
    cfg.push(disks[i].driver)
    cfg.push(disks[i].device_num)
    cfg.push(disks[i].adapter)
    return cfg.join(':')
  })
  let offset = 0
  let totalLength = sortedDisks.length
  let index = 0
  sortedDisks.map((disk) => {
    let lst = disk.device_fmts
    index += 1
    addToParams(baseParams, lst, lst.length, 'disk.', offset, (i) => {
      let cfg = []
      let size = 0
      if (lst.length === i + 1) {
        // 临时设置最后一个分区为autoextend.在末尾会根据具体情况替换
        size = '$autoextend$'
      } else {
        size = lst[i].size
      }

      if (lst[i].image_id) {
        cfg.push(lst[i].image_id)
        cfg.push(size)
      } else {
        cfg.push(size)
        // window系统没有format和mountpoint属性
        if (lst[i].format && lst[i].format !== '') {
          cfg.push(lst[i].format)
        }
        if (lst[i].mountpoint && lst[i].mountpoint !== '') {
          cfg.push(lst[i].mountpoint)
        }
      }

      return cfg.join(':')
    })

    // 如果已分区超过95%的容量就设置最后一个分区为自动扩展。否则默认在末尾增加一块盘
    offset += lst.length
    let lastIdx = offset - 1
    let capacity = disk.capacity
    let totalSize = 0
    lst.map((p) => { totalSize += p.size })
    if (lst.length >= 1) {
      if ((totalSize / capacity) > 0.95) {
        baseParams[`disk.${lastIdx}`] = baseParams[`disk.${lastIdx}`].replace('$autoextend$', 'autoextend')
      } else {
        baseParams[`disk.${lastIdx}`] = baseParams[`disk.${lastIdx}`].replace('$autoextend$', lst[lst.length - 1].size)
        // 如果不是最后一块盘则在末尾增加一块盘
        if (index < totalLength) {
          offset += 1
          baseParams[`disk.${lastIdx + 1}`] = 'autoextend'
        }
      }
    } else {
      // 直接末尾增加一块盘
      offset += 1
      baseParams[`disk.${lastIdx + 1}`] = 'autoextend'
    }
  })
}

function arrayifyParams (baseParams, sortedDisks) {
  baseParams.baremetal_disk_configs = sortedDisks.map((val, i) => {
    const diskConf = {
      conf: val.raid,
      driver: val.driver,
      count: val.device_num,
      range: _.range(val.device_start_index, val.device_start_index + val.device_num),
    }
    const adapterStr = val.adapter.replace('adapter', '')
    const adapterNum = Number(adapterStr)
    if (R.is(Number, adapterNum)) {
      diskConf.adapter = adapterNum
    } else {
      console.error('adapter 解析磁盘配置出错')
    }
    if (val.device.toLowerCase() === 'hdd') diskConf.type = 'rotate'
    if (val.device.toLowerCase() === 'ssd') diskConf.type = 'ssd'
    return diskConf
  })

  let totalLength = sortedDisks.length
  let index = 0
  baseParams['disks'] = []
  sortedDisks.map((disk) => {
    let lst = disk.device_fmts
    index += 1
    for (let i = 0; i < lst.length; i++) {
      let disk = {}
      if (lst.length === i + 1) {
        // 临时设置最后一个分区为autoextend.在末尾会根据具体情况替换
        disk.size = '$autoextend$'
      } else {
        disk.size = lst[i].size
      }

      if (lst[i].image_id) {
        disk.image_id = lst[i].image_id
      } else {
        // window系统没有format和mountpoint属性
        if (lst[i].format && lst[i].format !== '') {
          disk.fs = lst[i].format
        }
        if (lst[i].mountpoint && lst[i].mountpoint !== '') {
          disk.mountpoint = lst[i].mountpoint
        }
      }

      baseParams['disks'].push(disk)
    }

    // 如果已分区超过95%的容量就设置最后一个分区为自动扩展。否则默认在末尾增加一块盘
    let lastIdx = baseParams['disks'].length - 1
    let capacity = disk.capacity
    let totalSize = 0
    lst.map((p) => { totalSize += p.size })
    if (lst.length >= 1) {
      if ((totalSize / capacity) > 0.95) {
        baseParams['disks'][lastIdx].size = -1
      } else {
        baseParams['disks'][lastIdx].size = lst[lst.length - 1].size
        // 如果不是最后一块盘则在末尾增加一块盘
        if (index < totalLength) {
          baseParams['disks'].push({ size: -1 })
        }
      }
    } else {
      // 直接末尾增加一块盘
      baseParams['disks'].push({ size: -1 })
    }
  })
}

export default {
  diskFormatter,
  addToParams,
  diskConfToPostParams,
}
