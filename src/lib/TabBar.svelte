<script>
    import { localDir, setLocalDir } from "../stores/routeStore";

    function openTimer() {
        window.electronAPI.openBottomLeftWindow();
    }
</script>

<section class="row" style="justify-content: space-between;">
    <div class="row" style="gap: 5px;">
        <button on:click={() => {setLocalDir('today')}} class="btn {$localDir == 'today' ? 'selected' : ''}">Today</button>
        <button on:click={() => {setLocalDir('history')}} class="btn {$localDir == 'history' ? 'selected' : ''}">History</button>
        <button on:click={() => {setLocalDir('reports')}} class="btn {$localDir == 'reports' ? 'selected' : ''}">Reports</button>
    </div>
    <div>
        <!-- <button on:click={()=>{
            localStorage.clear();
            window.location.reload();
        }} style="background-color: var(--green);">
            Clear Storage
        </button> -->
        <button on:click={openTimer} style="background-color: var(--green);">
            <i class="fa-solid fa-play" style="margin-right: 5px;"></i>
            Start
        </button>
    </div>
</section>

<style>
    .btn {
        background-color: transparent;
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
    }

    .btn:hover {
        background-color: var(--border);
    }

    .btn.selected {
        background-color: var(--border);
        border-bottom: 2px solid var(--green);
    }

    section {
        background-color: var(--bg);
        font-size: medium;
        padding: 8px 12px;
    }

    i.button {
        color: var(--text);
        cursor: pointer;
    }

    i.button:hover {
        color: var(--faded-text);
    }
</style>
