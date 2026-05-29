<script>
    import { setLocalDir } from "../stores/routeStore";

    function minimize() {
        window.electronAPI.minimizeWindow();
    }

    function close() {
        window.electronAPI.closeApp();
    }
</script>

<section class="row" style="justify-content: space-between;">
    <div class="row">
        <i class="col fa-solid fa-clock" style="background-color: var(--green); padding: 6px; font-size: 12px; border-radius: 8px;"></i>
        <p style="font-weight: bold;">Time Tracker</p>
    </div>
    <div class="row" style="gap: 20px;">
        <i on:click={() => {setLocalDir('settings')}} class="button fa-solid fa-gear"></i>
        <i on:click={minimize} class="button fa-regular fa-window-minimize"></i>
        <i on:click={close} class="button fa-solid fa-close"></i>
    </div>
</section>

<style>
    section {
        background-color: var(--bg);
        font-size: medium;
        padding: 8px 12px;
        -webkit-app-region: drag;
    }

    i.button {
        -webkit-app-region: none;
        color: var(--text);
        cursor: pointer;
    }

    i.button:hover {
        color: var(--faded-text);
    }
</style>
