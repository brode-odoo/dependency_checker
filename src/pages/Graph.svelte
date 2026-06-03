<script>
  import { onMount } from 'svelte';
  import { SvelteFlow, Controls, Background } from '@xyflow/svelte';
  import ELK from 'elkjs/lib/elk.bundled.js';
  import ModuleNode from '../lib/ModuleNode.svelte'; 
  import '@xyflow/svelte/dist/style.css';
  import { projectModules } from '../stores/moduleStore';
  import { get } from 'svelte/store';

  const elk = new ELK();

  const nodeTypes = {
    module: ModuleNode
  };

  let nodes = [];
  let edges = [];

  onMount(async () => {
    const rawData = get(projectModules);
    if (rawData && Object.keys(rawData).length > 0) {
      await generateHierarchicalLayout(rawData);
    }
  });

  async function generateHierarchicalLayout(data) {
    const uniqueModuleNames = new Set();
    const parsedEdges = [];

    // 1. Map relationships cleanly
    Object.entries(data).forEach(([moduleName, dependencies]) => {
      uniqueModuleNames.add(moduleName);
      dependencies.forEach(dep => {
        uniqueModuleNames.add(dep);
        
        parsedEdges.push({
          id: `e-${moduleName}-${dep}`,
          source: moduleName,
          target: dep,
          sourceHandle: 'bottom',
          targetHandle: 'top',
          style: 'stroke: #94a3b8; stroke-width: 1.5px;', // Clean, crisp, visible lines
          focusable: false
        });
      });
    });

    // 2. Set realistic bounds for a ~100 node dataset
    const elkNodes = Array.from(uniqueModuleNames).map(name => ({
      id: name,
      width: 150, 
      height: 36  
    }));

    const elkEdges = parsedEdges.map(edge => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target]
    }));

    const layoutGraph = {
      id: "root",
      layoutOptions: {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.edgeRouting': 'STRAIGHT_LINE',
        
        // Let the layout breathe nicely horizontally, but keep rows close vertically
        'elk.layered.spacing.nodeNodeBetweenLayers': '40', // Clear vertical tier gap
        'elk.layered.spacing.nodeNode': '20',              // Clean horizontal sibling gap
        'elk.spacing.componentComponent': '35',             // Gap between separate tree charts

        // Enable high-quality grid distribution since performance isn't an issue at 97 nodes
        'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF', // Centers parents perfectly above children
        'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP', // Actively untangles crossing lines
        'elk.layered.thoroughness': '10' // Spends more cycles optimizing the view layout
      },
      children: elkNodes,
      edges: elkEdges
    };

    try {
      // 3. Compute clean coordinates
      const arrangedGraph = await elk.layout(layoutGraph);

      // 4. Update Svelte Flow layout arrays with fresh assignments
      nodes = arrangedGraph.children.map(node => {
        const isCustom = !!data[node.id];
        return {
          id: node.id,
          type: 'module',
          position: { x: node.x, y: node.y },
          focusable: false,
          data: { 
            label: node.id,
            isCustom: isCustom
          }
        };
      });

      edges = parsedEdges;
    } catch (error) {
      console.error("Layout initialization failed:", error);
    }
  }
</script>

<div class="flow-wrapper">
  <SvelteFlow 
    {nodes} 
    {edges} 
    {nodeTypes}
    fitView
    nodesDraggable={false}
    nodesConnectable={false}
    >
    <Controls showInteractive={false} /> <Background color="#cbd5e1" gap={20} size={1} />
  </SvelteFlow>
</div>

<style>
  .flow-wrapper {
    width: 100vw;
    height: 100vh;
    background: #f8fafc;
  }
</style>
