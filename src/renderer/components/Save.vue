<template>
  <Layout>
    <Header :style="{background: '#fff', boxShadow: '0 2px 3px 2px rgba(0,0,0,.1)'}"><h1>Save OpenMV</h1></Header>
    <Content :style="{padding: '16px 16px 16px'}">
      <Card>
        <p slot="title">OpenMV</p>
        <pre>{{code}}</pre>
      </Card>
    </Content>
    <Layout>
      <Footer>
        next
      </Footer>
    </Layout>
  </Layout>
</template>

<script>
  import {shell} from 'electron'
  import sweetalert2 from 'sweetalert2'
  import {quantize, evaluate} from '../js/quantize'
  import {convertOpenMV} from '../js/nn_convert'
  export default {
    name: 'save-page',
    data () {
      return {
        code: `#CNN code
import sensor, image, time, os, nn

sensor.reset()                         # Reset and initialize the sensor.
sensor.set_contrast(3)
sensor.set_pixformat(sensor.RGB565)    # Set pixel format to RGB565
sensor.set_framesize(sensor.QVGA)      # Set frame size to QVGA (320x240)
sensor.set_windowing((128, 128))       # Set 128x128 window.
sensor.skip_frames(time=1000)
sensor.set_auto_gain(False)
sensor.set_auto_exposure(False)

# Load cifar10 network
net = nn.load('/test.network')
# Faster, smaller and less accurate.
#net = nn.load('/test.network')
labels = ${['a', 'b']}

clock = time.clock()                # Create a clock object to track the FPS.
while(True):
    clock.tick()                    # Update the FPS clock.
    img = sensor.snapshot()         # Take a picture and return the image.
    out = net.forward(img)
    max_idx = out.index(max(out))
    score = int(out[max_idx]*100)
    if (score < 70):
        score_str = "??:??%"
    else:
        score_str = "%s:%d%% "%(labels[max_idx], score)
    img.draw_string(0, 0, score_str, color=(255, 0, 0))

    print(clock.fps())             # Note: OpenMV Cam runs about half as fast when connected
                                   # to the IDE. The FPS should increase once disconnected.
`

      }
    },
    methods: {
      save_tfjs_model: function () {
        const a = this.model.save('downloads://tensorflow-js')
        console.log(a)
      },
      save: async function () {
        const quantLayers = await quantize(this.model)
        const [rawLoss, rawAcc, qLoss, qAcc] = await evaluate(this.model, quantLayers)

        convertOpenMV(quantLayers, 'tmp/test.network')
        sweetalert2({
          title: 'openmv convert',
          text: '准确率：' + rawAcc + '% 压缩后的准确率：' + qAcc + '%\n' + rawLoss + ' ' + qLoss,
          type: 'success',
          confirmButtonText: 'open network folder'
        }).then((result) => {
          if (result.value) {
            const path = 'tmp/test.network'
            shell.showItemInFolder(path)
          }
        })
      }
    }
  }
</script>

<style scoped>
</style>

