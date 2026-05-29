<script>
  import { projectModules } from "../stores/moduleStore";
  import { localDir, setLocalDir } from "../stores/routeStore";


</script>

<section class="col">
    <h1>
        <i class="fa-solid fa-cubes" />
        DepAnalyzer
    </h1>
    <div class="col nav-section analysis" style="gap: 0px;">
        <p class="title">ANALYSIS</p>
        <button class="{$localDir == 'checker' ? "selected" : ""}" on:click={() => {
            setLocalDir('checker');
        }}>
            <i class="fa-solid fa-magnifying-glass-chart"/>
            Dependency Check
        </button>
        {#if Object.keys($projectModules).length > 0}
            <button class="{$localDir == 'graph' ? "selected" : ""}" on:click={() => {
                setLocalDir('graph');
            }}>
                <i class="fa-solid fa-diagram-project"/>
                Module Graph
            </button>
        {/if}
        <!-- <button class="{$localDir == 'history' ? "selected" : ""}">
            <i class="fa-solid fa-clock-rotate-left"/>
            History
        </button> -->
    </div>
    <!-- <div class="nav-section analysis col" style="gap: 0px;">
        <p class="title">CONFIGURATION</p>
        <button class="{$localDir == 'saved-paths' ? "selected" : ""}">
            <i class="fa-solid fa-folder-tree"/>
            Saved Paths
        </button>
        <button class="{$localDir == 'settings' ? "selected" : ""}">
            <i class="fa-solid fa-gear"/>
            Settings
        </button>
    </div> -->
</section>

<style>
    section {
        min-width: 240px;
        height: 100%;
        background-color: var(--purple);
        color: white;
    }

    h1 {
        font-size: 20px;
        margin: 15px;
    }

    .nav-section p {
        margin: 10px;
        font-weight: 600;
        font-size: 12px;
        color: var(--faded-white);
    }

    .nav-section button {
        margin: 0px;
        min-height: 35px;
        text-align: left;
        border-radius: 0px;
        background-color: transparent;
    }

    .nav-section button:hover {
        background-color: rgb(255 255 255 / 0.05);
    }

    .nav-section button.selected {
        background-color: rgb(255 255 255 / 0.1);
        border-left: 4px inset rgb(255 255 255 / 0.2);
    }

    .nav-section i {
        margin-right: 10px;
    }
</style>
