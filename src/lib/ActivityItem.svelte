<script>
    import { formatSeconds, timeToSeconds } from "../common";
    import { removeActivity, updateActivity } from "../stores/activityStore";

    export let activity = {
        id: -1,
        description: "Blank Description",
        timeOnTask: 0,
        type: 'misc',
        dateCreated: new Date()
    };

    let currentTime = formatSeconds(activity.timeOnTask);
    let timeError = false;
    let edit = false;
    let showDelConf = false;

    function updateAct() {
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
        if(!timeRegex.test(currentTime)) {
            timeError = true;
            return;
        }

        timeError = false;
        updateActivity({
            id: activity.id,
            description: activity.description,
            timeOnTask: timeToSeconds(currentTime),
            type: activity.type
        });
        edit = false;
    }

    function deleteAct() {
        removeActivity(activity.id);
        showDelConf = false;
    }
</script>

<div class="activity row">
    {#if showDelConf}
        <div class="delConfPopup">
            <div class="col">
                <p style="font-weight: bold;">Are You Sure?</p>
                <p style="font-size: small; color: var(--faded-text);">Deleting this activity will completely remove it from your history with no way to get it back</p>
                <hr style="margin-top: 0px; margin-bottom: 10px;">
                <div class="row" style="justify-content: space-between; width: 75%; margin-left: auto; margin-right: auto;">
                    <button on:click={deleteAct} style="background-color: var(--red);">Delete</button>
                    <button on:click={showDelConf = false} style="background-color: transparent;">Cancel</button>
                </div>
            </div>
        </div>
    {/if}
    {#if edit}
        <div class="row">
            <div style="border-radius: 999px; width: 10px; height: 10px; {activity.type == 'billable' ? "background-color: var(--green);" : activity.type == 'non-billable' ? "background-color: var(--blue);" : "background-color: var(--orange);"}"></div>
            <!-- <p style="max-width: 450px; max-lines: 1;">{activity.description}</p> -->
            <textarea bind:value={activity.description} style="min-width: 400px;"></textarea>
        </div>
        <div class="row">
            <select bind:value={activity.type}>
                <option value='billable'>Billable</option>
                <option value='non-billable'>Non-Billable</option>
                <option value='misc'>Misc.</option>
            </select>
            <input type="text" bind:value={currentTime} style="max-width: 70px; {timeError ? 'border: 1px solid var(--red);' : ''}"/>
            <button on:click={updateAct} style="background-color: var(--green);">Save</button>
        </div>
    {:else}
        <div class="row">
            <div style="border-radius: 999px; width: 10px; height: 10px; {activity.type == 'billable' ? "background-color: var(--green);" : activity.type == 'non-billable' ? "background-color: var(--blue);" : "background-color: var(--orange);"}"></div>
            <p class="actDescription">{activity.description}</p>
        </div>
        <div class="row">
            <p
            style="font-size: 12px;
                padding: 0px 6px;
                border-radius: 999px;
                {activity.type == 'billable' ? "background-color: var(--faded-green);" : activity.type == 'non-billable' ? "background-color: var(--faded-blue);" : "background-color: var(--faded-orange);"}
                {activity.type == 'billable' ? "border: 1px solid var(--green);" : activity.type == 'non-billable' ? "border: 1px solid var(--blue);" : "border: 1px solid var(--orange);"}
                {activity.type == 'billable' ? "color: var(--green);" : activity.type == 'non-billable' ? "color: var(--blue);" : "color: var(--orange);"}
            "
            >{activity.type == 'billable' ? "Billable" : activity.type == 'non-billable' ? "Non-Billable" : "Misc."}</p>
            <p>{formatSeconds(activity.timeOnTask)}</p>
            <i on:click={edit = !edit} class="iconBtn fa-solid fa-edit"></i>
            <i on:click={showDelConf = true} class="iconBtn fa-solid fa-trash"></i>
        </div>
    {/if}
</div>

<style>
  .activity {
    justify-content: space-between;
    padding: 10px;
    align-items: center;
    border-bottom: 1px solid var(--border);
    overflow: hidden;
    min-height: fit-content;
  }

  .activity:hover {
    background-color: var(--faded-border);
  }

  .activity .iconBtn {
    font-size: small;
    color: var(--faded-text);
    cursor: pointer;
  }

  .activity .iconBtn.fa-trash:hover {
    color: var(--red);
  }

  .activity .iconBtn.fa-edit:hover {
    color: var(--green);
  }

  .actDescription {
    display: inline-block;
    text-overflow: ellipsis;
    word-wrap: break-word;
    max-height: 20px;
    max-width: 450px;
    max-lines: 1;
    font-size: medium;
    overflow: hidden;
    line-height: 15pt;
  }

  .delConfPopup {
    left: 0;
    top: 0;
    position: absolute;
    z-index: 999;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(2px);

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .delConfPopup .col {
    padding: 20px;
    background-color: var(--panel-bg);
    border-radius: 12px;
    border: 1px solid var(--border);

    max-width: 350px;
  }
</style>
