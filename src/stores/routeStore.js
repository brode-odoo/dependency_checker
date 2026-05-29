import { get, writable } from "svelte/store";

export let localDir = writable('checker');
export let prevDir = writable('checker');

export let setLocalDir = (page) => {
    prevDir.set(get(localDir));
    localDir.set(page);
}

export let goToPrevDir = () => {
    localDir.set(get(prevDir));
}
