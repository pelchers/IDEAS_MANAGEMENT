/* ==========================================================
   Network Graph — Pass 1 | Force-Directed D3.js Visualization
   Deep Space Theme | IDEA-MANAGEMENT Entity Relationships
   ========================================================== */

(function () {
  'use strict';

  // ──────────────────────────────────────────────
  // 1. DATA
  // ──────────────────────────────────────────────
  const graphData = {
    nodes: [
      { id: 'user-1', label: 'Alice Chen', group: 'user', size: 28 },
      { id: 'user-2', label: 'Bob Martinez', group: 'user', size: 24 },
      { id: 'user-3', label: 'Cathy Wong', group: 'user', size: 20 },
      { id: 'proj-1', label: 'Wavz.fm Music Platform', group: 'project', size: 32 },
      { id: 'proj-2', label: 'Campus Learning App', group: 'project', size: 30 },
      { id: 'proj-3', label: 'Storyboarder Video Editor', group: 'project', size: 28 },
      { id: 'idea-1', label: 'Dark mode toggle', group: 'idea', size: 14 },
      { id: 'idea-2', label: 'Drag-drop upload', group: 'idea', size: 14 },
      { id: 'idea-3', label: 'Vector search AI', group: 'idea', size: 16 },
      { id: 'idea-4', label: 'Real-time collab', group: 'idea', size: 18 },
      { id: 'idea-5', label: 'Audio waveform editor', group: 'idea', size: 14 },
      { id: 'idea-6', label: 'Quiz generation', group: 'idea', size: 14 },
      { id: 'card-1', label: 'Setup Clerk auth', group: 'kanban', size: 12 },
      { id: 'card-2', label: 'Design kanban UX', group: 'kanban', size: 12 },
      { id: 'card-3', label: 'Stripe webhooks', group: 'kanban', size: 12 },
      { id: 'card-4', label: 'AI sidebar panel', group: 'kanban', size: 12 },
      { id: 'card-5', label: 'Video timeline UI', group: 'kanban', size: 12 },
      { id: 'card-6', label: 'Student dashboard', group: 'kanban', size: 12 }
    ],
    links: [
      { source: 'user-1', target: 'proj-1', type: 'owns' },
      { source: 'user-2', target: 'proj-2', type: 'owns' },
      { source: 'user-3', target: 'proj-3', type: 'owns' },
      { source: 'user-1', target: 'proj-2', type: 'collaborates' },
      { source: 'user-2', target: 'proj-1', type: 'collaborates' },
      { source: 'proj-1', target: 'idea-1', type: 'contains' },
      { source: 'proj-1', target: 'idea-2', type: 'contains' },
      { source: 'proj-1', target: 'idea-5', type: 'contains' },
      { source: 'proj-2', target: 'idea-3', type: 'contains' },
      { source: 'proj-2', target: 'idea-4', type: 'contains' },
      { source: 'proj-2', target: 'idea-6', type: 'contains' },
      { source: 'proj-3', target: 'idea-4', type: 'contains' },
      { source: 'idea-1', target: 'card-1', type: 'promoted' },
      { source: 'idea-2', target: 'card-2', type: 'promoted' },
      { source: 'idea-3', target: 'card-3', type: 'promoted' },
      { source: 'proj-1', target: 'card-1', type: 'board' },
      { source: 'proj-1', target: 'card-2', type: 'board' },
      { source: 'proj-2', target: 'card-3', type: 'board' },
      { source: 'proj-2', target: 'card-4', type: 'board' },
      { source: 'proj-3', target: 'card-5', type: 'board' },
      { source: 'proj-3', target: 'card-6', type: 'board' }
    ]
  };

  // ──────────────────────────────────────────────
  // 2. COLOR MAP
  // ──────────────────────────────────────────────
  const groupColor = {
    user: '#8B5CF6',
    project: '#06B6D4',
    idea: '#34D399',
    kanban: '#FBBF24'
  };

  const linkTypeStyle = {
    owns:         { color: '#8B5CF6', dash: null,       width: 2 },
    collaborates: { color: '#06B6D4', dash: '6,4',      width: 1.5 },
    contains:     { color: '#34D399', dash: '2,4',      width: 1.2 },
    promoted:     { color: '#FBBF24', dash: null,       width: 3 },
    board:        { color: '#6B7280', dash: '8,4',      width: 1 }
  };

  // ──────────────────────────────────────────────
  // 3. SVG SETUP
  // ──────────────────────────────────────────────
  const container = document.getElementById('graph-container');
  const svg = d3.select('#network-svg');
  let width = container.clientWidth;
  let height = container.clientHeight;

  svg.attr('viewBox', [0, 0, width, height]);

  // Defs: glow filters per group
  const defs = svg.append('defs');

  Object.entries(groupColor).forEach(([group, color]) => {
    const filter = defs.append('filter')
      .attr('id', `glow-${group}`)
      .attr('x', '-50%').attr('y', '-50%')
      .attr('width', '200%').attr('height', '200%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', 4)
      .attr('result', 'blur');

    filter.append('feFlood')
      .attr('flood-color', color)
      .attr('flood-opacity', 0.6)
      .attr('result', 'color');

    filter.append('feComposite')
      .attr('in', 'color')
      .attr('in2', 'blur')
      .attr('operator', 'in')
      .attr('result', 'coloredBlur');

    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'coloredBlur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');
  });

  // Outer glow for highlighted state
  const hlFilter = defs.append('filter')
    .attr('id', 'glow-highlight')
    .attr('x', '-80%').attr('y', '-80%')
    .attr('width', '260%').attr('height', '260%');

  hlFilter.append('feGaussianBlur')
    .attr('stdDeviation', 8)
    .attr('result', 'blur');

  hlFilter.append('feFlood')
    .attr('flood-color', '#fff')
    .attr('flood-opacity', 0.35)
    .attr('result', 'color');

  hlFilter.append('feComposite')
    .attr('in', 'color')
    .attr('in2', 'blur')
    .attr('operator', 'in')
    .attr('result', 'coloredBlur');

  const hlMerge = hlFilter.append('feMerge');
  hlMerge.append('feMergeNode').attr('in', 'coloredBlur');
  hlMerge.append('feMergeNode').attr('in', 'SourceGraphic');

  // Zoom container
  const g = svg.append('g').attr('class', 'zoom-layer');

  // ──────────────────────────────────────────────
  // 4. ZOOM
  // ──────────────────────────────────────────────
  const zoom = d3.zoom()
    .scaleExtent([0.2, 5])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

  svg.call(zoom);

  // ──────────────────────────────────────────────
  // 5. DEEP-CLONE DATA (for filter reset)
  // ──────────────────────────────────────────────
  let nodes = graphData.nodes.map(d => ({ ...d }));
  let links = graphData.links.map(d => ({ ...d }));

  // ──────────────────────────────────────────────
  // 6. FORCE SIMULATION
  // ──────────────────────────────────────────────
  let forceStrength = -120;
  let linkDistance = 100;
  let collisionRadius = 35;

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(linkDistance))
    .force('charge', d3.forceManyBody().strength(forceStrength))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => d.size + collisionRadius / 2))
    .force('x', d3.forceX(width / 2).strength(0.04))
    .force('y', d3.forceY(height / 2).strength(0.04))
    .alphaDecay(0.02)
    .velocityDecay(0.3);

  // ──────────────────────────────────────────────
  // 7. DRAW LINKS
  // ──────────────────────────────────────────────
  let linkSelection = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', d => (linkTypeStyle[d.type] || linkTypeStyle.board).color)
    .attr('stroke-width', d => (linkTypeStyle[d.type] || linkTypeStyle.board).width)
    .attr('stroke-dasharray', d => (linkTypeStyle[d.type] || linkTypeStyle.board).dash)
    .attr('stroke-opacity', 0.45);

  // ──────────────────────────────────────────────
  // 8. DRAW NODES
  // ──────────────────────────────────────────────
  let nodeGroup = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(nodes)
    .join('g')
    .attr('class', 'node-group')
    .call(drag(simulation));

  // Pulse ring (ambient glow animation)
  nodeGroup.append('circle')
    .attr('class', 'pulse-ring')
    .attr('r', d => d.size + 4)
    .attr('fill', 'none')
    .attr('stroke', d => groupColor[d.group])
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0)
    .each(function (d, i) {
      pulseAnimate(d3.select(this), d.size + 4, i);
    });

  // Main circle
  nodeGroup.append('circle')
    .attr('class', 'node-circle')
    .attr('r', d => d.size)
    .attr('fill', d => groupColor[d.group])
    .attr('fill-opacity', 0.85)
    .attr('stroke', d => d3.color(groupColor[d.group]).brighter(0.6))
    .attr('stroke-width', 1.5)
    .attr('filter', d => `url(#glow-${d.group})`);

  // Labels (only for larger nodes)
  nodeGroup.append('text')
    .attr('class', 'node-label')
    .attr('dy', d => d.size + 14)
    .text(d => d.label)
    .attr('fill', '#E5E7EB')
    .attr('font-size', d => d.size >= 20 ? 11 : 9)
    .attr('opacity', d => d.size >= 20 ? 0.8 : 0.55);

  // ──────────────────────────────────────────────
  // 9. PULSE ANIMATION
  // ──────────────────────────────────────────────
  function pulseAnimate(sel, baseR, index) {
    const delay = (index % 6) * 600;
    function loop() {
      sel.attr('stroke-opacity', 0)
        .attr('r', baseR)
        .transition()
        .delay(delay)
        .duration(2000)
        .ease(d3.easeSinInOut)
        .attr('stroke-opacity', 0.5)
        .attr('r', baseR + 6)
        .transition()
        .duration(2000)
        .ease(d3.easeSinInOut)
        .attr('stroke-opacity', 0)
        .attr('r', baseR)
        .on('end', loop);
    }
    loop();
  }

  // ──────────────────────────────────────────────
  // 10. SIMULATION TICK
  // ──────────────────────────────────────────────
  simulation.on('tick', () => {
    linkSelection
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    nodeGroup.attr('transform', d => `translate(${d.x},${d.y})`);
  });

  // ──────────────────────────────────────────────
  // 11. DRAG BEHAVIOR
  // ──────────────────────────────────────────────
  function drag(sim) {
    function dragStarted(event, d) {
      if (!event.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    function dragEnded(event, d) {
      if (!event.active) sim.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    return d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded);
  }

  // ──────────────────────────────────────────────
  // 12. HOVER — TOOLTIP
  // ──────────────────────────────────────────────
  const tooltip = document.getElementById('tooltip');
  const tooltipLabel = document.getElementById('tooltip-label');
  const tooltipGroup = document.getElementById('tooltip-group');
  const tooltipConnections = document.getElementById('tooltip-connections');

  nodeGroup
    .on('mouseenter', function (event, d) {
      // Enlarge
      d3.select(this).select('.node-circle')
        .transition().duration(200)
        .attr('r', d.size * 1.25)
        .attr('fill-opacity', 1);

      // Tooltip content
      const connCount = links.filter(l =>
        (l.source.id || l.source) === d.id || (l.target.id || l.target) === d.id
      ).length;

      tooltipLabel.textContent = d.label;
      tooltipGroup.textContent = d.group.toUpperCase();
      tooltipConnections.textContent = `${connCount} connection${connCount !== 1 ? 's' : ''}`;

      tooltip.classList.add('visible');
    })
    .on('mousemove', function (event) {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      tooltip.style.left = x + 'px';
      tooltip.style.top = y + 'px';
    })
    .on('mouseleave', function (event, d) {
      d3.select(this).select('.node-circle')
        .transition().duration(200)
        .attr('r', d.size)
        .attr('fill-opacity', 0.85);

      tooltip.classList.remove('visible');
    });

  // ──────────────────────────────────────────────
  // 13. CLICK — HIGHLIGHT CONNECTED
  // ──────────────────────────────────────────────
  let selectedNode = null;

  nodeGroup.on('click', function (event, d) {
    event.stopPropagation();

    if (selectedNode === d.id) {
      // Deselect
      clearHighlight();
      selectedNode = null;
      return;
    }

    selectedNode = d.id;

    // Find connected node ids
    const connectedIds = new Set([d.id]);
    links.forEach(l => {
      const sid = l.source.id || l.source;
      const tid = l.target.id || l.target;
      if (sid === d.id) connectedIds.add(tid);
      if (tid === d.id) connectedIds.add(sid);
    });

    // Dim all
    nodeGroup.select('.node-circle')
      .transition().duration(300)
      .attr('fill-opacity', nd => connectedIds.has(nd.id) ? 1 : 0.12)
      .attr('stroke-opacity', nd => connectedIds.has(nd.id) ? 1 : 0.1)
      .attr('filter', nd => connectedIds.has(nd.id) ? 'url(#glow-highlight)' : 'none');

    nodeGroup.select('.node-label')
      .transition().duration(300)
      .attr('opacity', nd => connectedIds.has(nd.id) ? 1 : 0.08);

    nodeGroup.select('.pulse-ring')
      .transition().duration(300)
      .attr('stroke-opacity', nd => connectedIds.has(nd.id) ? 0.5 : 0);

    linkSelection
      .transition().duration(300)
      .attr('stroke-opacity', l => {
        const sid = l.source.id || l.source;
        const tid = l.target.id || l.target;
        return (sid === d.id || tid === d.id) ? 0.9 : 0.04;
      })
      .attr('stroke-width', l => {
        const sid = l.source.id || l.source;
        const tid = l.target.id || l.target;
        const base = (linkTypeStyle[l.type] || linkTypeStyle.board).width;
        return (sid === d.id || tid === d.id) ? base * 1.8 : base * 0.5;
      });
  });

  // Click background to deselect
  svg.on('click', () => {
    if (selectedNode) {
      clearHighlight();
      selectedNode = null;
    }
  });

  function clearHighlight() {
    nodeGroup.select('.node-circle')
      .transition().duration(300)
      .attr('fill-opacity', 0.85)
      .attr('stroke-opacity', 1)
      .attr('filter', d => `url(#glow-${d.group})`);

    nodeGroup.select('.node-label')
      .transition().duration(300)
      .attr('opacity', d => d.size >= 20 ? 0.8 : 0.55);

    nodeGroup.select('.pulse-ring')
      .transition().duration(300)
      .attr('stroke-opacity', 0);

    linkSelection
      .transition().duration(300)
      .attr('stroke-opacity', 0.45)
      .attr('stroke-width', d => (linkTypeStyle[d.type] || linkTypeStyle.board).width);
  }

  // ──────────────────────────────────────────────
  // 14. CONTROLS — SLIDERS
  // ──────────────────────────────────────────────
  const forceSlider = document.getElementById('force-strength');
  const forceVal = document.getElementById('force-strength-val');
  const linkSlider = document.getElementById('link-distance');
  const linkVal = document.getElementById('link-distance-val');
  const collisionSlider = document.getElementById('collision-radius');
  const collisionVal = document.getElementById('collision-radius-val');

  forceSlider.addEventListener('input', () => {
    forceStrength = +forceSlider.value;
    forceVal.textContent = forceStrength;
    simulation.force('charge').strength(forceStrength);
    simulation.alpha(0.5).restart();
  });

  linkSlider.addEventListener('input', () => {
    linkDistance = +linkSlider.value;
    linkVal.textContent = linkDistance;
    simulation.force('link').distance(linkDistance);
    simulation.alpha(0.5).restart();
  });

  collisionSlider.addEventListener('input', () => {
    collisionRadius = +collisionSlider.value;
    collisionVal.textContent = collisionRadius;
    simulation.force('collision').radius(d => d.size + collisionRadius / 2);
    simulation.alpha(0.5).restart();
  });

  // ──────────────────────────────────────────────
  // 15. CONTROLS — GROUP FILTERS
  // ──────────────────────────────────────────────
  const filterCheckboxes = document.querySelectorAll('.group-filter');

  filterCheckboxes.forEach(cb => {
    cb.addEventListener('change', applyFilters);
  });

  function applyFilters() {
    const activeGroups = new Set();
    filterCheckboxes.forEach(cb => {
      if (cb.checked) activeGroups.add(cb.value);
    });

    // Rebuild filtered data
    const filteredNodes = graphData.nodes
      .filter(n => activeGroups.has(n.group))
      .map(n => {
        // Preserve positions from existing sim nodes if available
        const existing = nodes.find(en => en.id === n.id);
        return existing ? { ...n, x: existing.x, y: existing.y, vx: existing.vx, vy: existing.vy } : { ...n };
      });

    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = graphData.links
      .filter(l => filteredNodeIds.has(l.source.id || l.source) && filteredNodeIds.has(l.target.id || l.target))
      .map(l => ({
        source: l.source.id || l.source,
        target: l.target.id || l.target,
        type: l.type
      }));

    nodes = filteredNodes;
    links = filteredLinks;

    // Re-bindlinks
    linkSelection = g.select('.links')
      .selectAll('line')
      .data(links, d => `${d.source.id || d.source}-${d.target.id || d.target}-${d.type}`)
      .join(
        enter => enter.append('line')
          .attr('stroke', d => (linkTypeStyle[d.type] || linkTypeStyle.board).color)
          .attr('stroke-width', d => (linkTypeStyle[d.type] || linkTypeStyle.board).width)
          .attr('stroke-dasharray', d => (linkTypeStyle[d.type] || linkTypeStyle.board).dash)
          .attr('stroke-opacity', 0)
          .call(sel => sel.transition().duration(400).attr('stroke-opacity', 0.45)),
        update => update,
        exit => exit.transition().duration(300).attr('stroke-opacity', 0).remove()
      );

    // Re-bind nodes
    nodeGroup = g.select('.nodes')
      .selectAll('g.node-group')
      .data(nodes, d => d.id)
      .join(
        enter => {
          const ng = enter.append('g').attr('class', 'node-group').call(drag(simulation));

          ng.append('circle')
            .attr('class', 'pulse-ring')
            .attr('r', d => d.size + 4)
            .attr('fill', 'none')
            .attr('stroke', d => groupColor[d.group])
            .attr('stroke-width', 1.5)
            .attr('stroke-opacity', 0)
            .each(function (d, i) { pulseAnimate(d3.select(this), d.size + 4, i); });

          ng.append('circle')
            .attr('class', 'node-circle')
            .attr('r', d => d.size)
            .attr('fill', d => groupColor[d.group])
            .attr('fill-opacity', 0)
            .attr('stroke', d => d3.color(groupColor[d.group]).brighter(0.6))
            .attr('stroke-width', 1.5)
            .attr('filter', d => `url(#glow-${d.group})`)
            .call(sel => sel.transition().duration(400).attr('fill-opacity', 0.85));

          ng.append('text')
            .attr('class', 'node-label')
            .attr('dy', d => d.size + 14)
            .text(d => d.label)
            .attr('fill', '#E5E7EB')
            .attr('font-size', d => d.size >= 20 ? 11 : 9)
            .attr('opacity', 0)
            .call(sel => sel.transition().duration(400).attr('opacity', d => d.size >= 20 ? 0.8 : 0.55));

          // Re-attach events
          ng.on('mouseenter', function (event, d) {
            d3.select(this).select('.node-circle')
              .transition().duration(200)
              .attr('r', d.size * 1.25)
              .attr('fill-opacity', 1);

            const connCount = links.filter(l =>
              (l.source.id || l.source) === d.id || (l.target.id || l.target) === d.id
            ).length;
            tooltipLabel.textContent = d.label;
            tooltipGroup.textContent = d.group.toUpperCase();
            tooltipConnections.textContent = `${connCount} connection${connCount !== 1 ? 's' : ''}`;
            tooltip.classList.add('visible');
          })
          .on('mousemove', function (event) {
            const rect = container.getBoundingClientRect();
            tooltip.style.left = (event.clientX - rect.left) + 'px';
            tooltip.style.top = (event.clientY - rect.top) + 'px';
          })
          .on('mouseleave', function (event, d) {
            d3.select(this).select('.node-circle')
              .transition().duration(200)
              .attr('r', d.size)
              .attr('fill-opacity', 0.85);
            tooltip.classList.remove('visible');
          })
          .on('click', function (event, d) {
            event.stopPropagation();
            if (selectedNode === d.id) { clearHighlight(); selectedNode = null; return; }
            selectedNode = d.id;
            const connectedIds = new Set([d.id]);
            links.forEach(l => {
              const sid = l.source.id || l.source;
              const tid = l.target.id || l.target;
              if (sid === d.id) connectedIds.add(tid);
              if (tid === d.id) connectedIds.add(sid);
            });
            nodeGroup.select('.node-circle')
              .transition().duration(300)
              .attr('fill-opacity', nd => connectedIds.has(nd.id) ? 1 : 0.12)
              .attr('stroke-opacity', nd => connectedIds.has(nd.id) ? 1 : 0.1)
              .attr('filter', nd => connectedIds.has(nd.id) ? 'url(#glow-highlight)' : 'none');
            nodeGroup.select('.node-label')
              .transition().duration(300)
              .attr('opacity', nd => connectedIds.has(nd.id) ? 1 : 0.08);
            linkSelection
              .transition().duration(300)
              .attr('stroke-opacity', l => {
                const sid = l.source.id || l.source;
                const tid = l.target.id || l.target;
                return (sid === d.id || tid === d.id) ? 0.9 : 0.04;
              });
          });

          return ng;
        },
        update => update,
        exit => exit.transition().duration(300)
          .style('opacity', 0)
          .remove()
      );

    // Restart simulation
    simulation.nodes(nodes);
    simulation.force('link').links(links);
    simulation.force('center', d3.forceCenter(width / 2, height / 2));
    simulation.alpha(0.8).restart();

    selectedNode = null;
  }

  // ──────────────────────────────────────────────
  // 16. RESET VIEW
  // ──────────────────────────────────────────────
  document.getElementById('btn-reset').addEventListener('click', () => {
    // Reset zoom
    svg.transition().duration(600).call(zoom.transform, d3.zoomIdentity);

    // Reset sliders
    forceSlider.value = -120;
    forceVal.textContent = '-120';
    linkSlider.value = 100;
    linkVal.textContent = '100';
    collisionSlider.value = 35;
    collisionVal.textContent = '35';

    forceStrength = -120;
    linkDistance = 100;
    collisionRadius = 35;

    simulation.force('charge').strength(forceStrength);
    simulation.force('link').distance(linkDistance);
    simulation.force('collision').radius(d => d.size + collisionRadius / 2);

    // Reset filters
    filterCheckboxes.forEach(cb => { cb.checked = true; });
    applyFilters();

    // Clear highlight
    clearHighlight();
    selectedNode = null;
  });

  // ──────────────────────────────────────────────
  // 17. RESPONSIVE RESIZE
  // ──────────────────────────────────────────────
  window.addEventListener('resize', () => {
    width = container.clientWidth;
    height = container.clientHeight;
    svg.attr('viewBox', [0, 0, width, height]);
    simulation.force('center', d3.forceCenter(width / 2, height / 2));
    simulation.force('x', d3.forceX(width / 2).strength(0.04));
    simulation.force('y', d3.forceY(height / 2).strength(0.04));
    simulation.alpha(0.3).restart();
  });

})();
