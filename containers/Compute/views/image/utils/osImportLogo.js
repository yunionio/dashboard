const imagesLogoFiles = require.context('@/assets/images/os-images', false, /\.svg$/)

export const imagesLogos = []
imagesLogoFiles.keys().forEach((key) => {
  const name = key.replace(/^\.\//, '').replace(/\.svg$/, '')
  imagesLogos.push(name)
})

/** 发行版名称 → os-images 下文件名（不含扩展名） */
export function resolveOsLogoName (distributionOrOs) {
  const raw = String(distributionOrOs || '').toLowerCase().trim()
  const first = raw.split(/[\s_-]/)[0]
  const candidates = [first, raw.replace(/\s+/g, '')]
  if (raw.includes('rocky')) {
    candidates.push('rocky', 'rockylinux')
  }
  if (raw.includes('neokylin') || (raw.includes('neo') && raw.includes('kylin'))) {
    candidates.push('neokylin')
  }
  if (raw.includes('ubuntu')) {
    candidates.push('ubuntu')
  }
  if (raw.includes('anolis') || raw.includes('alinux')) {
    candidates.push('anolis')
  }
  if (raw.includes('openruyi') || raw.includes('ruyi')) {
    candidates.push('openruyi')
  }
  for (const c of candidates) {
    if (imagesLogos.includes(c)) return c
  }
  return 'unknow'
}

export function getOsImage (name) {
  const file = `./${name}.svg`
  if (imagesLogoFiles.keys().includes(file)) {
    return imagesLogoFiles(file)
  }
  return imagesLogoFiles('./unknow.svg')
}
