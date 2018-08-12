<template>
  <Layout>
    <Header :style="{background: '#fff', boxShadow: '0 2px 3px 2px rgba(0,0,0,.1)'}"><h1>image trainer</h1></Header>
    <Content :style="{padding: '16 16px 16px'}">
      <Progress :percent="percent" />
      <div>
        <ve-line :data = "chartData"></ve-line>
      </div>
    </Content>
    <Footer>
      <Button type="primary" v-on:click="train" long style="margin: 10px 0">Start Train</Button>
      <Button type="primary" v-on:click="save" long style="margin: 10px 0">Save</Button>
    </Footer>
  </Layout>
</template>

<script>
  import {shell} from 'electron'
  import sweetalert2 from 'sweetalert2'
  import tf from '@tensorflow/tfjs'
  import {ImageData} from '../js/data'
  import {quantize, evaluate} from '../js/quantize'
  import {getModel} from '../js/model'
  import {convertOpenMV} from '../js/nn_convert'
  const path = require('path')
  const appData = require('electron').remote.app.getPath('appData')
  const projectPath = path.join(appData, 'EasyImageTrainer', 'project')

  export default {
    name: 'train-page',
    data () {
      return {
        chartData: {
          model: [],
          columns: ['batch', 'accuracy', 'loss'],
          rows: [{'batch': 0, 'accuracy': 0, 'loss': 0}]
        },
        percent: 0
      }
    },
    watch: {
      activeName (v) {
        this.$nextTick(_ => {
          this.$refs[`chart${v}`].echarts.resize()
        })
      }
    },
    methods: {
      train: async function () {
        const setting = {
          'name': 'mnist',
          'description': 'classify digit number',
          'width': 28,
          'height': 28,
          'color': 'RGB',
          'depth': 3,
          'conv_layers': 2,
          'gpu': true,
          'batchSize': 64,
          'class_unit': 10
        }
        const batchSize = setting.batchSize
        const imageData = new ImageData()
        imageData.load(projectPath, batchSize)
        const model = await getModel(setting)
        const num = imageData.getBatchNum()
        this.chartData.rows = []
        for (let i = 0; i < num; i++) {
          // console.log('start train: ' + i)
          let [xs, labels] = imageData.nextTrainBatch()
          const history = await model.fit(xs, labels)
          const loss = history.history.loss[0]
          const accuracy = history.history.acc[0]
          console.log(accuracy + '\t' + loss)
          this.model = model
          this.percent = Math.round(i * 100 / (num - 1))
          this.chartData.rows.push({
            'batch': i,
            'accuracy': accuracy,
            'loss': loss
          })
        }
      },
      test: function (imgArray) {
        const output = this.model.predict(tf.tensor(imgArray).reshape([1, 28, 28, 3]), {batchSize: 28, verbose: true})
        const predictions = output.max().data()
        const labels = 1
        let correct = 0
        let TEST_SIZE = 64
        for (let i = 0; i < TEST_SIZE; i++) {
          if (predictions[i] === labels[i]) {
            correct++
          }
        }
        const accuracy = ((correct / TEST_SIZE) * 100).toFixed(2)
        console.log('* Test set accuracy: ' + accuracy)
      },
      save_tfjs_model: function () {
        const a = this.model.save('downloads://tensorflow-js')
        console.log(a)
      },
      save: async function () {
        const imageData = new ImageData()
        imageData.load(projectPath, 64)
        let dataSet = imageData.nextTrainBatch()
        const quantLayers = await quantize(this.model, dataSet)
        console.log(quantLayers)
        const [rawLoss, rawAcc, qLoss, qAcc] = await evaluate(this.model, quantLayers, dataSet)
        console.log(quantLayers)
        convertOpenMV(quantLayers, path.join(projectPath, 'test.network'))
        sweetalert2({
          title: 'openmv',
          text: `raw accuracy:${rawAcc * 100}% quantized accuracy:${qAcc * 100}%\nraw loss: ${rawLoss} quantized loss: ${qLoss}`,
          type: 'success',
          confirmButtonText: 'open network folder'
        }).then((result) => {
          if (result.value) {
            shell.showItemInFolder(path.join(projectPath, 'test.network'))
          }
        })
      }
    }
  }
</script>

<style scoped>
</style>

