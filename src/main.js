import { registerPlugins } from '@/plugins'
import App from './App.vue'
import { createApp } from 'vue'
import 'vue3-toastify/dist/index.css'
import { JsonForms } from "@jsonforms/vue"

import '/src/styles/index.scss'
import '@vuepic/vue-datepicker/dist/main.css';

import '@jsonforms/vue-vanilla/vanilla.css';

const app = createApp(App)
app.component('JsonForms', JsonForms)

import Category from '/src/views/Category.vue'
app.component('Category', Category)

import Detail from '/src/views/Detail.vue'
app.component('Detail', Detail)

registerPlugins(app)

import mitt from 'mitt';
const emitter = mitt();
app.config.globalProperties.emitter = emitter;

app.mount('#app')
