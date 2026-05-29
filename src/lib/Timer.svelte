<script>
    import { onMount } from "svelte";
    import { formatSeconds } from "../common";

    let timeOnTask = 0;
    let paused = false;
    let killed = false;

    let type = "billable";
    let description = "";

    onMount(() => {
        window.electronAPI.send("start-activity", {});

        setInterval(() => {
            if(!paused && !killed) {
                timeOnTask += 1;
            }
        }, 1000);
    });

    function stopTimer() {
        window.electronAPI.stopTimer();
        killed = true;
    }

    function saveAndClose() {
        window.electronAPI.send("save-close", {
            description,
            type,
            timeOnTask
        });
        window.electronAPI.closeTimer();
    }

    function resume() {
        killed = false;
        window.electronAPI.resumeTimer();
    }
</script>

<section class="col">
    {#if killed}
        <div class="col" style="flex: 1; margin: 20px 10px;">
            <div class="col" style="gap: 0px; justify-content: center; text-align: center; margin-bottom: 20px;">
                <p style="font-size: 10px; color: var(--faded-text);">TIME RECORDED</p>
                <h2>{formatSeconds(timeOnTask)}</h2>
            </div>
            <select bind:value={type}>
                <option value="billable">Billable</option>
                <option value="non-billable">Non-Billable</option>
                <option value="misc">Misc.</option>
            </select>
            <textarea bind:value={description} placeholder="What did you work on?" />
            <hr style="margin-top: 0px;">
            <div class="row" style="margin-top: 10px; margin-bottom: -10px; justify-content: space-between;">
                <button on:click={saveAndClose} style="background-color: var(--green);">Save</button>
                <button on:click={resume} style="background-color: transparent;">Cancel</button>
            </div>
        </div>
    {:else}
        <div class="row" style="justify-content: space-between;">
            <h2>{formatSeconds(timeOnTask)}</h2>
            <div class="row">
                <i on:click={paused = !paused} class="fa-solid {paused ? "fa-play" : "fa-pause"}" style="padding: 8px; border: 1px solid var(--orange); color: var(--orange); background-color: var(--faded-orange); border-radius: 8px; font-size: small;"></i>
                <i on:click={stopTimer} class="fa-solid fa-square" style="padding: 8px; border: 1px solid var(--red); color: var(--red); background-color: var(--faded-red); border-radius: 8px; font-size: small;"></i>
            </div>
        </div>
    {/if}
</section>

<style>
    section {
        height: 100%;
        width: 100%;
        padding: 0px 10px;
        justify-content: center;
        -webkit-app-region: drag;
    }

    i {
        -webkit-app-region: none;
        width: 30px;
        height: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }

    select, textarea, button {
        -webkit-app-region: none;
    }
</style>
