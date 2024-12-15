import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

declare global {
  interface Array<T> {
    move(from: number, to: number): void
  }
}

Array.prototype.move = function (from: number, to: number): void {
  this.splice(to, 0, this.splice(from, 1)[0]);
}

const app = createApp(App)
app.mount('#app')


