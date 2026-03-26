import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'
import * as cheerio from 'cheerio'
import createDebug from 'debug'
import { buildFilename, buildAssetDirname } from './utils/common.js'
import { processAssets } from './assetLoader.js'

const debug = createDebug('page-loader')

const pageLoader = (url, outputDir) => {
  const htmlFilepath = path.join(outputDir, buildFilename(url))
  const assetDirname = buildAssetDirname(url)
  const assetDirpath = path.join(outputDir, assetDirname)

  debug('loading page %s', url)

  return axios.get(url)
    .catch((err) => { throw new Error(`Failed to fetch ${url}: ${err.message}`) })
    .then((response) => {
      debug('fetched %s, status %d', url, response.status)
      return fs.access(outputDir)
        .catch(() => { throw new Error(`Output directory does not exist: ${outputDir}`) })
        .then(() => cheerio.load(response.data))
    })
    .then($ => processAssets($, url, assetDirname, assetDirpath))
    .then(($) => {
      debug('saving HTML to %s', htmlFilepath)
      return fs.writeFile(htmlFilepath, $.html())
        .catch((err) => { throw new Error(`Failed to write to ${htmlFilepath}: ${err.message}`) })
    })
    .then(() => {
      debug('done, file saved: %s', htmlFilepath)
      return htmlFilepath
    })
}

export default pageLoader
