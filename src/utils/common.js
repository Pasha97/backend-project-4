import { URL } from 'url'
import path from 'path'

const buildSlug = (url) => {
  const { hostname, pathname } = new URL(url)
  return `${hostname}${pathname}`
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+$/g, '')
}

export const buildFilename = url => `${buildSlug(url)}.html`

export const buildAssetDirname = url => `${buildSlug(url)}_files`

export const buildAssetFilename = (pageUrl, assetSrc) => {
  const resolved = new URL(assetSrc, pageUrl)
  const ext = path.extname(resolved.pathname)
  const base = resolved.pathname.slice(0, resolved.pathname.length - ext.length)
  const slug = `${resolved.hostname}${base}`
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+$/g, '')
  return `${slug}${ext}`
}
