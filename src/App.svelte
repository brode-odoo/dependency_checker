<script>
    import { localDir } from './stores/routeStore';
    import Checker from './pages/Checker.svelte';
    import NavMenu from './lib/NavMenu.svelte';
    import { get } from 'svelte/store';
    import { loading, loadingText } from './stores/loadingStore';

    let dir = window.location.hash;
    let showLoading = false;

    $: showLoading = $loading;
</script>

<div class="row" style="height: 100vh; flex-direction: row-reverse; gap: 0px;">
  {#if $localDir == 'checker'}
    <Checker/>
  {/if}

  <NavMenu/>
</div>

<div class="drag-bar"/>

{#if showLoading}
  <div class="loading-overlay">
    <div class="loading-indicator-bg"/>
    <div class="loading-indicator"/>
    <p style="margin-top: 125px; font-weight: bold;">{$loadingText}</p>
  </div>
{/if}

<style>
  .drag-bar {
    width: 100vw;
    height: 25px;
    background-color: transparent;
    position: absolute;
    -webkit-app-region: drag;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(255, 255, 255, 0.147);
    backdrop-filter: blur(2px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;
  }

  .loading-indicator {
    width: 80px;
    height: 80px;
    position: absolute;
    border: 10px solid transparent;
    border-top-color: var(--purple);
    border-radius: 999px;
    background-color: transparent;

    animation: spin 1.5s linear infinite;
  }

  .loading-indicator-bg {
    width: 80px;
    height: 80px;
    position: absolute;
    border: 10px solid var(--purple);
    opacity: 0.25;
    border-radius: 999px;
    background-color: transparent;
  }

  @keyframes spin {
    0% {
      rotate: 0deg;
    }
    100% {
      rotate: 360deg;
    }
  }
</style>
