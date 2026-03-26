import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'
import createDebug from 'debug'
import { buildAssetFilename } from './utils/common.js'

const debug = createDebug('page-loader')

const RESOURCE_TYPES = [
  { selector: 'img', attr: 'src' },
  { selector: 'link', attr: 'href' },
  { selector: 'script', attr: 'src' },
]

const isSameHost = (pageUrl, src) => {
  try {
    return new URL(src, pageUrl).hostname === new URL(pageUrl).hostname
  }
  catch {
    return false
  }
}

const extractAssets = ($, pageUrl) => {
  const assets = []
  RESOURCE_TYPES.forEach(({ selector, attr }) => {
    $(`${selector}[${attr}]`).each((_i, el) => {
      const val = $(el).attr(attr)
      if (isSameHost(pageUrl, val)) assets.push({ attr, val })
    })
  })
  return assets
}

const downloadAsset = (pageUrl, src, assetDirname, assetDirpath) => {
  const resolvedUrl = new URL(src, pageUrl).toString()
  const localFilename = buildAssetFilename(pageUrl, src)
  const localFilepath = path.join(assetDirpath, localFilename)
  const localRef = path.join(assetDirname, localFilename)

  debug('downloading %s → %s', resolvedUrl, localFilepath)

  return axios.get(resolvedUrl, { responseType: 'arraybuffer' })
    .catch(err => { throw new Error(`Failed to download ${resolvedUrl}: ${err.message}`) })
    .then(res => fs.writeFile(localFilepath, res.data))
    .then(() => ({ attr: null, originalSrc: src, localRef }))
}

export const processAssets = ($, pageUrl, assetDirname, assetDirpath) => {
  const assets = extractAssets($, pageUrl)

  if (assets.length === 0) return Promise.resolve($)

  debug('creating assets dir %s', assetDirpath)

  return fs.mkdir(assetDirpath, { recursive: true })
    .then(() => Promise.all(
      assets.map(({ attr, val }) =>
        downloadAsset(pageUrl, val, assetDirname, assetDirpath)
          .then(result => ({ ...result, attr, originalSrc: val })),
      ),
    ))
    .then((mappings) => {
      mappings.forEach(({ attr, originalSrc, localRef }) => {
        $(`[${attr}="${originalSrc}"]`).attr(attr, localRef)
      })
      return $
    })
}
