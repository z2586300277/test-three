import { watch } from "vue";

export function Hooks(arr:any){
    watch(arr, (n) => {
        console.log(n)
    })
}