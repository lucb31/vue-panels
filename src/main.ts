import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

Array.prototype.move = function (from: number, to: number) {
  this.splice(to, 0, this.splice(from, 1)[0]);
}

const app = createApp(App)
app.mount('#app')


