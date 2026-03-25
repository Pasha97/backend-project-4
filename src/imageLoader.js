import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'
import { buildAssetFilename } from './utils/common.js'

const isSameHost = (pageUrl, src) => {
  try {
    return new URL(src, pageUrl).hostname === new URL(pageUrl).hostname
  }
  catch {
    return false
  }
}

const extractImageSrcs = ($, pageUrl) => {
  const srcs = []
  $('img[src]').each((_i, el) => {
    const src = $(el).attr('src')
    if (isSameHost(pageUrl, src)) srcs.push(src)
  })
  return srcs
}

const downloadImage = (pageUrl, src, assetDirname, assetDirpath) => {
  const resolvedUrl = new URL(src, pageUrl).toString()
  const localFilename = buildAssetFilename(pageUrl, src)
  const localFilepath = path.join(assetDirpath, localFilename)
  const localRef = path.join(assetDirname, localFilename)

  return axios.get(resolvedUrl, { responseType: 'arraybuffer' })
    .then(res => fs.writeFile(localFilepath, res.data))
    .then(() => ({ originalSrc: src, localRef }))
}

export const processImages = ($, pageUrl, assetDirname, assetDirpath) => {
  const srcs = extractImageSrcs($, pageUrl)

  if (srcs.length === 0) return Promise.resolve($)

  return fs.mkdir(assetDirpath, { recursive: true })
    .then(() => Promise.all(srcs.map(src => downloadImage(pageUrl, src, assetDirname, assetDirpath))))
    .then((mappings) => {
      mappings.forEach(({ originalSrc, localRef }) => {
        $(`img[src="${originalSrc}"]`).attr('src', localRef)
      })
      return $
    })
}
