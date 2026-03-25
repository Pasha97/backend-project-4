import axios from 'axios'
import fs from 'fs/promises'
import path from 'path'
import { buildFilename } from './utils/common.js'

const pageLoader = (url, outputDir) => {
  const filename = buildFilename(url)
  const filepath = path.join(outputDir, filename)

  return axios.get(url)
    .then(response => fs.writeFile(filepath, response.data))
    .then(() => filepath)
}

export default pageLoader
