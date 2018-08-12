const tf = require('@tensorflow/tfjs')
const fs = require('fs')
const jmage = require('./jmage')
const path = require('path')
class ImageData {
  constructor () {
    this.trainIndex = 0
    this.testIndex = 0
    this.batch = []
    this.batchSize = 0
    this.classUnit = 0
  }
  load (projectPath, batchSize) {
    this.batchSize = batchSize
    const imgList = []
    const list = fs.readdirSync(projectPath)
    let classUnit = 0
    list.forEach(function (dirName) {
      let stat = fs.statSync(path.join(projectPath, dirName))
      if (stat && stat.isDirectory()) {
        let imgs = fs.readdirSync(path.join(projectPath, dirName))
        classUnit += 1
        imgs.forEach(function (imgName) {
          let stat = fs.statSync(path.join(projectPath, dirName, imgName))
          if (stat && imgName[0] !== '.') { // ignore hidden files, such as .DS_Store
            imgList.push({
              label: dirName,
              img_path: path.join(projectPath, dirName, imgName),
              index: parseInt(dirName.split('_')[0])
            })
          }
        })
      }
    })
    this.classUnit = classUnit
    let i, j, temp
    for (i = imgList.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1))
      temp = imgList[i]
      imgList[i] = imgList[j]
      imgList[j] = temp
    }
    const batch = []
    const groupNum = Math.ceil(imgList.length / this.batchSize)

    for (let i = 0; i < groupNum; i++) {
      batch[i] = imgList.slice(this.batchSize * i, this.batchSize * (i + 1))
    }
    this.batch = batch
  }
  getBatchNum () {
    return this.batch.length
  }

  nextTrainBatch () {
    let i = this.trainIndex
    if (i > this.getBatchNum()) {
      return null
    }
    let oneBatch = this.batch[i]
    let datasetImg = new Float32Array(oneBatch.length * 28 * 28 * 3)
    let datasetLabels = new Uint8Array(oneBatch.length * this.classUnit)
    for (let j in oneBatch) {
      let img = oneBatch[j]
      let imgArray = jmage.decode(img['img_path'])
      datasetImg.set(imgArray, j * 28 * 28 * 3)

      let labelData = new Uint8Array(this.classUnit)
      labelData[img.index] = 1
      datasetLabels.set(labelData, j * this.classUnit)
    }
    let xs = tf.tensor2d(datasetImg, [oneBatch.length, 28 * 28 * 3]).reshape([oneBatch.length, 28, 28, 3])
    const labels = tf.tensor2d(datasetLabels, [oneBatch.length, this.classUnit])

    this.trainIndex += 1
    return [xs, labels]
  }

  // nextTestBatch() {

  // }
}

export {ImageData}
