let util = {}
const fs = require('fs')

util.writeJsonFile = (filepath, text) => {
  let data = JSON.stringify(text)
  return new Promise((resolve, reject) => {
    fs.writeFile(filepath, data, (err) => {
      if (err) {
        reject(err)
        return;
      }
      resolve()
    })
  })
}

module.exports = util