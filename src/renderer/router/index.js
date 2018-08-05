import Vue from 'vue'
import Router from 'vue-router'
import Example from '../components/Example'
import Folder from '../components/Folder'
import Train from '../components/Train'
import Save from '../components/Save'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: require('@/App'),
      redirect: Example
    },
    {
      path: '/Example',
      name: 'example-page',
      component: Example
    },
    {
      path: '/Folder',
      name: 'folder-page',
      component: Folder
    },
    {
      path: '/Train',
      name: 'train-page',
      component: Train
    },
    {
      path: '/Save',
      name: 'save-page',
      component: Save
    }
  ]
})
