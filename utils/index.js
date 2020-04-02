import * as R from 'ramda'

export const getSpecContainerParams = (fd, tabs) => {
  const tabKeys = tabs.map(val => val.key)
  const containers = tabKeys.map(val => {
    const env = []
    const volumeMounts = []
    const resources = {
      requests: {},
    }
    if (fd.containerEnvNames && R.is(Object, fd.containerEnvNames[val]) && !R.isEmpty(fd.containerEnvNames[val])) {
      Object.keys(fd.containerEnvNames[val]).forEach(key => {
        env.push({ name: fd.containerEnvNames[val][key], value: fd.containerEnvValues[val][key] })
      })
    }
    if (fd.containerVolumeMountNames && R.is(Object, fd.containerVolumeMountNames[val]) && !R.isEmpty(fd.containerVolumeMountNames[val])) {
      Object.keys(fd.containerVolumeMountNames[val]).forEach(key => {
        volumeMounts.push({ name: fd.containerVolumeMountNames[val][key], mountPath: fd.containerVolumeMountPaths[val][key] })
      })
    }
    const p = {
      name: fd.containerNames[val],
      image: fd.containerimages[val],
      securityContext: {
        privileged: fd.containerPrivilegeds[val],
      },
    }
    if (volumeMounts.length) p.volumeMounts = volumeMounts
    if (env.length) p.env = env
    if (fd.containerCommands[val]) {
      p.command = fd.containerCommands[val].split(' ')
    }
    if (fd.containerArgs[val]) {
      p.args = fd.containerArgs[val].split(' ')
    }
    if (fd.containerCpus[val]) resources.requests.cpu = fd.containerCpus[val] + 'm'
    if (fd.containerMemorys[val]) resources.requests.memory = fd.containerMemorys[val] + 'Mi'
    return p
  })
  const params = {
    containers,
  }
  const volumesSum = params.containers.reduce((prev, next) => prev.concat(next.volumeMounts), []).filter(v => !!v)
  const volumesUnion = R.uniqBy(R.prop('name'), volumesSum) // 根据 name 去重
  const volumes = volumesUnion.map(val => ({
    name: val.name,
    persistentVolumeClaim: {
      claimName: val.name,
    },
  }))
  if (volumes && volumes.length) {
    params.volumes = volumes
  }
  return params
}

export const getLabels = (fd, key, value) => {
  const obj = {}
  if (R.is(Object, fd[key])) {
    const keys = Object.keys(fd[key])
    keys.forEach(k => {
      obj[fd[key][k]] = fd[value][k]
    })
  }
  return obj
}
