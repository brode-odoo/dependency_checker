<script lang="ts">
  import { onMount } from "svelte";
  import { loading, loadingText } from "../stores/loadingStore";
  import { odooModules, projectModules } from "../stores/moduleStore";

  let odooOptions = [
    {
      'value': 'odoo_19',
      'name': 'Odoo 19',
      'file': '/odoo_dependencies_19.0.json',
    },
    {
      'value': 'odoo_18',
      'name': 'Odoo 18',
      'file': '/odoo_dependencies_18.0.json',
    },
    {
      'value': 'odoo_17',
      'name': 'Odoo 17',
      'file': '/odoo_dependencies_17.0.json',
    },
    {
      'value': 'odoo_16',
      'name': 'Odoo 16',
      'file': '/odoo_dependencies_16.0.json',
    },
    {
      'value': 'odoo_15',
      'name': 'Odoo 15',
      'file': '/odoo_dependencies_15.0.json',
    },
    {
      'value': 'odoo_14',
      'name': 'Odoo 14',
      'file': '/odoo_dependencies_14.0.json',
    },
    {
      'value': 'odoo_13',
      'name': 'Odoo 13',
      'file': '/odoo_dependencies_13.0.json',
    },
    {
      'value': 'odoo_12',
      'name': 'Odoo 12',
      'file': '/odoo_dependencies_12.0.json',
    },
    {
      'value': 'odoo_11',
      'name': 'Odoo 11',
      'file': '/odoo_dependencies_11.0.json',
    },
    {
      'value': 'odoo_10',
      'name': 'Odoo 10',
      'file': '/odoo_dependencies_10.0.json',
    },
    // TODO add a selection for a custom Odoo directory for future/custom versions.
    // This will pull up a directory selector and parse the modules the same way
    // the project modules are set.
    // {
    //   'value': 'custom',
    //   'name': 'Custom',
    //   'file': '/odoo_17_dependencies.json',
    // },
  ];

  let moduleScanned = 0;
  let dupDependencies = [];

  let openDepDetails = false;
  let selectedDepDetails = {};
  
  let selectedVersion:String;

  let projectFileInput:HTMLElement;
  let projectDirectory = "";

  let odooMods = {};
  let projectMods = {};

  $: if($odooModules) odooMods = $odooModules;
  $: if($projectModules) projectMods = $projectModules;
  $: if(selectedVersion) initOdooModules();

  onMount(() => {
    selectedVersion = odooOptions[0].value;
  });

  async function initOdooModules() {
    const fileName = odooOptions.filter((o) => o.value == selectedVersion)[0]['file'];
    const response = await fetch(fileName);
    const data = await response.json();
    odooModules.set(data);
  }

  // Listen for the file selector dialog to be cancelled
  // and make sure the loading stops so the user can continue
  // to use the application.
  window.addEventListener("cancel", ()=> {
    loading.set(false);
  });

  // Pulls the text from the filtered __manifest__ files to pull the dependencies
  // and adds them to a dictionary.
  async function readFile(file) {
    const content = await file.text();
    try {
      const pathSplit = file.webkitRelativePath.split('/');
      const dependsRegex = /['"]depends['"]\s*:\s*\[([\s\S]*?)\]/;
      const dependsMatch = content.match(dependsRegex);
      let depends = [];
      if(dependsMatch) depends = dependsMatch[1].replace(/['"\s]/g, '').split(',').filter(Boolean);
      if(pathSplit.length < 1) return;

      const moduleName = pathSplit[pathSplit.length - 2];
      projectModules.set({...projectMods, ...{
        [moduleName]: depends
      }});
    } catch (error) {
      console.error("Error for: ", file.webkitRelativePath);
      console.error("Content: ", content);
      console.error("Failed to parse manifest:", error);
    }
  }

  // Once a directory is selected we want to filter the files to only send
  // __manifest__.py files to be read and parsed.
  async function handleDirectorySelect(event) {
    try {
      projectModules.set({});
      const files = event.target.files;
      if (!files || files.length === 0) {
        loading.set(false);
        return;
      }

      const manifestFiles = Array.from(files).filter((f) => f.name == '__manifest__.py');
      const dirName = files[0].webkitRelativePath.split('/')[0];
      projectDirectory = `${dirName}/`;

      loadingText.set("Getting dependencies...");
      const promises = manifestFiles.map(file => readFile(file));
      await Promise.all(promises);

      console.log("All modules loaded:", JSON.stringify(projectModules));
    }catch(error) {
      console.log("Select Dir Error: ", error);
    }

    loading.set(false);
  }

  function getAllDependencies(depName, odooMods, projectMods, visited = new Set()) {
    if (visited.has(depName)) return [];
    visited.add(depName);

    const immediateDeps = odooMods[depName] || projectMods[depName] || [];
	if(immediateDeps.length == 0) {
		console.log("Cant find ", depName);
	}

    let foundDeps = [...immediateDeps];

    for (const nextDep of immediateDeps) {
      const deeperDeps = getAllDependencies(nextDep, odooMods, projectMods, visited);
      foundDeps = [...foundDeps, ...deeperDeps];
    }

    return foundDeps;
  }

  function findReasonPath(targetDup, currentDepsList, odooMods, projectMods, visited = new Set(), currentPath = []) {
    for (const dep of currentDepsList) {
      if (visited.has(dep)) continue;
      visited.add(dep);

      const subDeps = odooMods[dep] || projectMods[dep] || [];

      // Base Case: If this module directly contains the duplicate...
      if (subDeps.includes(targetDup)) {
        // Return the path we took to get here, plus this module
        return [...currentPath, dep];
      }

      // Recursive Case: Pass down the current path with the new step added to it
      const pathFound = findReasonPath(
        targetDup,
        subDeps,
        odooMods,
        projectMods,
        visited,
        [...currentPath, dep]
      );

      // If a deeper branch successfully found a path, return it immediately
      if (pathFound) {
        return pathFound;
      }
    }

    return null;
  }

  function analyzeDependencies() {
    moduleScanned = 0;
    dupDependencies = [];
    loadingText.set('Analyzing dependencies...');
    loading.set(true);
    for (const modKey of Object.keys(projectMods)) {
      const immediateDeps = projectMods[modKey];
      if (!immediateDeps || immediateDeps.length < 2) continue;

      moduleScanned += 1;

      let accumulatedDeepDeps = new Set();

      for (const dep of immediateDeps) {
        if (accumulatedDeepDeps.has(dep)) {
          // Find the full path array leading to this dependency
          const pathArray = findReasonPath(dep, immediateDeps, odooMods, projectMods);

          dupDependencies.push({
            'target_module': modKey,
            'dependency': dep,
            'source': pathArray[0],
            'source_tree': pathArray
          });
        }

        const deepTree = getAllDependencies(dep, odooMods, projectMods);
        for (const subDep of deepTree) {
          accumulatedDeepDeps.add(subDep);
        }
      }
    }
    dupDependencies = dupDependencies;

	if(dupDependencies.length == 0) console.log("No Duplicate Deps Found");
    loading.set(false);
  }

  function showDepDetails(dep) {
	selectedDepDetails = dep;
	openDepDetails = true;
  }
</script>

<section class="col" style="flex: 1; box-sizing: border-box; height: 100vh;">
  <div class="col top-directory-section">
    <div class="row" style="justify-content: end;">
      <button on:click={analyzeDependencies} class="green" disabled={Object.keys(projectMods).length == 0}>
        <i class="fa-solid fa-play" />
        Run Analysis
      </button>
      <button class="white">
        <i class="fa-solid fa-download" />
        Export Report
      </button>
    </div>
    <div class="directory-selector-panel">
      <div class="row">
        <div class="col no-gap" style="flex: 1;">
          <p>CHOOSE ODOO VERSION</p>
          <div class="row no-gap">
            <select bind:value={selectedVersion} style="flex: 1;">
              {#each odooOptions as option}
                <option value={option['value']}>
                  {option['name']}
                </option>
              {/each}
            </select>
          </div>
        </div>
        <div class="col no-gap" style="flex: 1;">
          <p>TARGET PROJECT DIRECTORY</p>
          <div class="row no-gap">
            <input type="text" bind:value={projectDirectory} style="padding-left: 40px; border-top-right-radius: 0px; border-bottom-right-radius: 0px; flex: 1;" placeholder="/psus-custom-project" disabled/>
            <i class="fa-solid fa-folder-open" style="position: absolute; margin-left: 10px; opacity: 0.5;"/>
            <button on:click={()=>{
              loadingText.set("Loading manifest files...");
              loading.set(true);
              projectFileInput.click();
			  dupDependencies = [];
            }} class="faded" style="border-top-left-radius: 0px; border-bottom-left-radius: 0px;">Browse</button>
            <input
              type="file"
              webkitdirectory
              directory
              bind:this={projectFileInput}
              on:change={handleDirectorySelect}
              style="display: none;"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="row" style="flex: 1; justify-content: start; align-items: start; min-height: 0;">
    <div class="col" style="flex: 1; height: 100%; min-height: 0;">
      {#if dupDependencies.length > 0}
        <div class="row scanned-dep-stats">
          <div class="row stat-card">
            <div class="col">
              <p>Total Modules Scanned</p>
              <h1>{moduleScanned}</h1>
            </div>
            <i class="fa-solid fa-boxes-stacked"/>
          </div>
          <div class="row stat-card">
            <div class="col">
              <p>Total Dependencies</p>
              <h1>{moduleScanned}</h1>
            </div>
            <i class="fa-solid fa-link"/>
          </div>
          <div class="row stat-card warning">
            <div class="col">
              <p>Duplicates Detected</p>
              <h1>{dupDependencies.length}</h1>
            </div>
            <i class="fa-solid fa-warning"/>
          </div>
        </div>
        <div class="col dep-analysis-results">
          <div style="padding: 15px; padding-bottom: 0px;">
            <h2 style="font-size: 14px;">Dependency Analysis Results</h2>
          </div>
          <hr/>
          <div class="col" style="overflow-y: auto; margin-top: -10px;">
            <table>
              <thead style="text-align: left;">
                <tr>
                  <th style=" padding-left: 20px;"></th>
                  <th>TARGET MODULE</th>
                  <th>DEPENDENCY</th>
                  <th>SOURCE OF DUPLICATION</th>
                  <th style="text-align: right; padding-right: 20px;">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {#each dupDependencies as dup}
                  <tr>
                    <td style=" padding-left: 20px;"><i class="fa-solid fa-caret-right"/></td>
                    <td><b>{dup.target_module}</b></td>
                    <td><i class="fa-solid fa-box" style="color: var(--faded-text);"/> {dup.dependency}</td>
                    <td>Already provided by <b>{dup.source}</b></td>
                    <td style="text-align: right;  padding-right: 20px;"><i on:click={() => {
						showDepDetails(dup);
                    }} class="fa-solid fa-arrow-up-right-from-square"/></td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {:else}
        {#if Object.keys(odooMods).length > 0}
          <div class="row module-breakdown" style="flex: 1; align-items: start;">
            <!-- ODOO MODULES CONTAINER -->
            <div class="col no-gap container" style="height: 100%;">
              <span class="row" style="justify-content: space-between; padding: 10px;">
                <h2>Odoo Core Modules</h2>
                <div class="row">
                  <p class="module-count">{Object.keys(odooMods).length} modules</p>
                </div>
              </span>
              <hr/>
              <div class="col no-gap" style="overflow-y: auto;">
                  {#each Object.keys(odooMods).sort() as module}
                    <div class="row module-card">
                      <span class="row">
                        <i class="fa-solid fa-cube"/>
                        <div class="col no-gap" style="line-height: 14px;">
                          <h2>{module}</h2>
                        </div>
                      </span>
                      <p>{odooMods[module].length} {odooMods[module].length > 1 ? "deps" : "dep"}</p>
                    </div>
                  {/each}
              </div>
            </div>

            <!-- TARGET PROJECT CONTAINER -->
            <div class="col  no-gap container" style="height: 100%;">
              <span class="row" style="justify-content: space-between; padding: 10px;">
                <h2>Target Project Modules</h2>
                {#if Object.keys(projectMods).length > 0}
                  <div class="row">
                    <p class="module-count">{Object.keys(projectMods).length} modules</p>
                  </div>
                {/if}
              </span>
              <hr/>
              {#if Object.keys(projectMods).length > 0}
                <div class="col" style="overflow-y: auto;">
                  {#each Object.keys(projectMods).sort() as module}
                    <div class="row module-card">
                      <span class="row">
                        <i class="fa-solid fa-cube"/>
                        <div class="col no-gap" style="line-height: 14px;">
                          <h2>{module}</h2>
                        </div>
                      </span>
                      <p>{projectMods[module].length} {projectMods[module].length > 1 ? "deps" : "dep"}</p>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="col" style="justify-content: center; align-items: center; flex: 1;">
                  <div class="col no-directory-selected">
                    <i class="col fa-solid fa-folder-open"/>
                    <h2>No Modules Found</h2>
                    <p style="font-size: 11px; line-height: 14px; color: var(--faded-text);">Click the <b>Browse</b> button next to the <b>Target Project Directory</b> field above and select your projects root folder.</p>
                    <button on:click={()=>{
                      loadingText.set("Loading manifest files...");
                      loading.set(true);
                      projectFileInput.click();
                    }} class="faded" style="width: fit-content; font-size: 12px; margin-right: auto; margin-left: auto; margin-top: 10px;"><i class="fa-solid fa-upload"/> Select Directory</button>
                  </div>
                </div>
              {/if}
            </div>
          </div>

          <div class="row stats module-breakdown" style="padding-top: 0px;">
            <div class="row container" style="gap: 20px; padding: 15px; justify-content: space-around;">
              <div class="row">
                <i class="fa-solid fa-cube"/>
                <div class="col">
                  <p>Odoo Core Modules</p>
                  <h1>{Object.keys(odooMods).length}</h1>
                </div>
              </div>
              <div class="row">
                <i class="fa-solid fa-cube"/>
                <div class="col">
                  <p>Custom Modules</p>
                  <h1>{Object.keys(projectMods).length > 0 ? Object.keys(projectMods).length : "-"}</h1>
                </div>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
    <div class="col dependency-details" style="{openDepDetails ? "margin-left: -10px; transform: translate(0, 0);" : ""}">
      <div class="title-section row" style="justify-content: space-between; background-color: rgb(249 250 251);">
        <p>Dependency Details</p>
        <i on:click={()=>{openDepDetails = false;}} class="fa-solid fa-close"/>
      </div>
	  <div class="col" style="padding: 15px; padding-top: 0;">
	  	<div>
			<h2 style="font-size: 16px;">{selectedDepDetails['dependency']}</h2>
			<p style="font-size: 12px; color: var(--faded-text);">Required by: <b style="color: var(--text);">{selectedDepDetails['target_module']}</b></p>
		</div>
		<div>
			<p style="font-weight: bold; font-size: 11px; color: var(--faded-text);">CONFLICT ANALYSIS</p>
			<div class="conflict-analysis">
				<p>This dependency may be unnecessary because it is already inherited through another module in your dependency tree.</p>
				<div class="col" style="margin-top: 15px;">
					{#each selectedDepDetails['source_tree'] as depSource, index}
						<p style="{index == 0 ? "font-weight: bold;" : ""} margin-left: {8 * index}px">
							{#if index == 0}
								<i class="fa-solid fa-file-code"/>
							{:else}
								<i class="fa-solid fa-arrow-turn-up" style="color: var(--faded-text); rotate: 90deg;"/>
							{/if}
							{depSource}
						</p>

						{#if index == selectedDepDetails['source_tree'].length - 1}
							<p style="margin-left: {(8 * index) + 8}px">
								<i class="fa-solid fa-arrow-turn-up" style="color: var(--faded-text); rotate: 90deg;"/>
								{selectedDepDetails['dependency']}
							</p>
						{/if}
					{/each}
				</div>
			</div>
		</div>
		<div style="margin-top: 10px;">
			<p style="font-weight: bold; font-size: 11px; color: var(--faded-text);">SUGGESTED ACTION</p>
			<div class="suggested-action">
				<p>Remove <code>'{selectedDepDetails['dependency']}'</code> from the <code>depends</code> list in <code>{selectedDepDetails['target_module']}/__manifest__.py</code></p>
			</div>
		</div>
	  </div>
    </div>
  </div>
</section>

<!-- {"target_module":"modKey","dependency":"dep","source":"dep","source_tree":["dep1","dep2","dep3","dep4"]} -->

<style>
  section {
    height: 100vh;
    width: calc(100vw - 220px);
    margin: 0;
  }

  .top-directory-section {
    background-color: var(--panel);
    padding: 15px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  .directory-selector-panel {
    background-color: rgb(249 250 251);
    border: 1px solid rgb(229 231 235);
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .directory-selector-panel p {
    font-weight: 600;
    font-size: x-small;
  }

  .module-breakdown {
    padding: 20px;
    background-color: transparent;
    gap: 30px;
    min-height: 0;
  }

  .module-breakdown .container {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    flex: 1;
  }

  .module-breakdown input {
    max-width: 150px;
    padding-left: 24px;
    font-size: 12px;
    padding-top: 9px;
    height: 25px;
  }

  .module-breakdown .fa-magnifying-glass {
    position: absolute;
    color: var(--faded-text);
    font-size: 12px;
    margin-top: 10px;
    margin-left: 8px;
  }

  .module-breakdown .module-count {
    margin: 0;
    font-size: 10px;
    background-color: rgb(113 75 103 / 0.1);
    padding: 0px 8px;
    max-height: 20px;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .no-directory-selected {
    padding: 20px;
    border: 1px dashed var(--border);
    border-radius: 1rem;
    width: 60%;
    text-align: center;
  }

  .no-directory-selected i.fa-folder-open {
    padding: 20px;
    background-color: rgb(128, 128, 128, 0.5);
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    border-radius: 999px;
    opacity: 0.25;
  }

  .module-card {
    font-size: 12px;
    border-bottom: 1px solid var(--border);
    padding: 8px;
    justify-content: space-between;
  }

  h2 {
    font-size: 13px;
  }

  .module-breakdown.stats .col {
    line-height: 8px;
  }

  .module-breakdown.stats i {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px;
    border-radius: 999px;
    background-color: rgba(128, 128, 128, 0.2);
    font-size: 14px;
  }
  .module-breakdown.stats h1 {
    font-size: 18px;
  }

  .module-breakdown.stats p {
    font-size: 12px;
    color: var(--faded-text);
    font-weight: 500;
  }

  .scanned-dep-stats {
    padding: 20px;
    padding-top: 0px;
    gap: 20px;
  }

  .stat-card {
    flex: 1;
    border-radius: 0.5rem;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    justify-content: space-between;
    padding: 20px;
  }

  .stat-card .col {
    line-height: 15px;
  }

  .stat-card p {
    font-size: 12px;
    font-weight: 500;
    color: var(--faded-text);
  }

  .stat-card h1 {
    font-size: 24px;
  }

  .stat-card i {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px;
    background-color: rgba(59, 130, 246, 0.1);
    color: rgba(59, 130, 246, 1);
    border-radius: 999px;
  }

  .stat-card i.fa-warning {
    color: rgb(224 62 45);
    background-color: rgba(224, 62, 45, 0.1);
  }

  .stat-card.warning {
    border-left: 4px solid rgb(224 62 45);
  }

  .dep-analysis-results {
    border-radius: 0.5rem;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    flex: 1;
    margin: 20px;
    margin-top: -10px;
    min-height: 0;
  }

  thead {
    font-size: 12px;
    color: var(--faded-text);
  }

  thead tr th {
    border-bottom: 1px solid var(--border);
  }

  tbody tr td{
    font-size: 14px;
    border-bottom: 0.5px solid var(--border);
    padding: 5px 0px;
  }

  td .fa-arrow-up-right-from-square:hover {
    cursor: pointer;
    color: var(--faded-text);
  }

  .dependency-details {
    background-color: white;
    min-width: 250px;
	max-width: 250px;

    height: calc(100% + 10px);
    margin-top: -10px;
    box-shadow: -1px 0px 5px rgba(0, 0, 0, 0.1);

    margin-left: -250px;
    transform: translate(250px, 0);
    transition: all 300ms ease-in-out;
  }

  .dependency-details .title-section {
    border-bottom: 1px solid var(--border);
    padding: 10px;
    font-size: small;
    font-weight: 600;
  }

  .dependency-details .title-section i {
    color: var(--faded-text);
    cursor: pointer;
  }

  .conflict-analysis {
	border: 1px solid var(--border);
	padding: 8px;
	border-radius: 0.2rem;
  }

  .conflict-analysis p {
	font-size: 12px;
	line-height: 14px;
  }

  .conflict-analysis div {
	border-left: 2px solid var(--border);
	padding-left: 4px;
  }

  .suggested-action {
	background-color: rgb(239, 246, 255);
	color: rgb(30, 64, 175);
	font-size: 12px;
	line-height: 20px;
	border-radius: 0.2rem;
	padding: 8px;
	word-wrap: break-word;
	white-space: normal;
  }

  .suggested-action code {
	background-color: white;
	border: 1px solid rgba(30, 64, 175, 0.25);
	padding: 1px;
	padding-left: 2px;
	padding-right: 2px;
	white-space: pre-wrap;
	word-break: break-all;
  }
</style>
