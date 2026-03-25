import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'
import * as cheerio from 'cheerio'
import { buildFilename, buildAssetDirname } from './utils/common.js'
import { processAssets } from './assetLoader.js'

const pageLoader = (url, outputDir) => {
  const htmlFilepath = path.join(outputDir, buildFilename(url))
  const assetDirname = buildAssetDirname(url)
  const assetDirpath = path.join(outputDir, assetDirname)

  return axios.get(url)
    .then(response => cheerio.load(response.data))
    .then($ => processAssets($, url, assetDirname, assetDirpath))
    .then($ => fs.writeFile(htmlFilepath, $.html()))
    .then(() => htmlFilepath)
}

export default pageLoader
