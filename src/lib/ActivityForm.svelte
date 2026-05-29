<script>
    import { activities } from "../stores/activityStore";

    let description = "";
    let type = "billable";
    const types = ["billable", "non-billable", "misc."];

    function handleSubmit() {
        if (description.trim()) {
            // Update the most recent activity with the description and type
            activities.updateMostRecent(description, type);
            
            // Close the Electron window
            if (window.electronAPI && window.electronAPI.closeWindow) {
                window.electronAPI.closeWindow();
            }
        }
    }

    function handleCancel() {
        // Close without saving
        if (window.electronAPI && window.electronAPI.closeWindow) {
            window.electronAPI.closeWindow();
        }
    }
</script>

<section class="form-container">
    <div class="form">
        <h3>New Activity</h3>
        
        <div class="form-group">
            <label for="description">Description</label>
            <input 
                id="description"
                type="text" 
                placeholder="Enter activity description"
                bind:value={description}
                on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
            />
        </div>

        <div class="form-group">
            <label for="type">Type</label>
            <select id="type" bind:value={type}>
                {#each types as t}
                    <option value={t}>{t}</option>
                {/each}
            </select>
        </div>

        <div class="button-group">
            <button class="btn-cancel" on:click={handleCancel}>Cancel</button>
            <button class="btn-submit" on:click={handleSubmit}>Start</button>
        </div>
    </div>
</section>

<style>
    .form-container {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        -webkit-app-region: drag;
        padding: 20px;
    }

    .form {
        width: 100%;
        max-width: 300px;
        display: flex;
        flex-direction: column;
        gap: 15px;
        -webkit-app-region: no-drag;
    }

    h3 {
        margin: 0;
        text-align: center;
        font-size: 1.2em;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
    }

    label {
        font-size: 0.9em;
        font-weight: 500;
    }

    input,
    select {
        padding: 8px;
        border: 1px solid var(--border-color, #ccc);
        border-radius: 4px;
        font-size: 0.95em;
        font-family: inherit;
    }

    input:focus,
    select:focus {
        outline: none;
        border-color: var(--blue);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .button-group {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }

    button {
        flex: 1;
        padding: 8px;
        border: none;
        border-radius: 4px;
        font-size: 0.95em;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
    }

    button:hover {
        opacity: 0.9;
    }

    .btn-cancel {
        background-color: var(--faded-red);
        color: var(--red);
        border: 1px solid var(--red);
    }

    .btn-submit {
        background-color: var(--faded-green);
        color: var(--green);
        border: 1px solid var(--green);
    }
</style>
