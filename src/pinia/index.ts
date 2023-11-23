
import { defineStore } from 'pinia'


export const useUserStore = defineStore({
  id: 'user',
  state: () =>({}),
  getters: {},
  actions: {}
})

export const useAdminStore = defineStore({
  id: 'admin',
  state: () =>({
    power: true
  }),
  getters: {},
  actions: {}
})

