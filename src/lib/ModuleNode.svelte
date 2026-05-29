<script>
  import { Handle, Position } from '@xyflow/svelte';
  export let data;
</script>

<div class="module-box" style="background: {data.isCustom ? '#009688' : '#5c3e56'};">
  <Handle type="target" position={Position.Top} id="top" style="opacity: 0; pointer-events: none;" />
  <div class="label">{data.label}</div>
  <Handle type="source" position={Position.Bottom} id="bottom" style="opacity: 0; pointer-events: none;" />
</div>

<style>
  .module-box {
    color: white;
    border-radius: 3px;
    padding: 4px 6px; /* Reduced padding for tighter text wrapping */
    font-size: 9px;   /* Slightly smaller text for readability inside small spaces */
    text-align: center;
    width: 130px;     /* Squeezed from 150px down to 130px width */
    font-weight: 500;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
    position: relative;
  }
  .label {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
</style>