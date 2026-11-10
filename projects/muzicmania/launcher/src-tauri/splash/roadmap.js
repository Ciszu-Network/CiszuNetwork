(function() {
  var state = {
    container: null,
    stages: [],
    statuses: {},
    activeId: "",
    navigator: null,
    errorId: ""
  };

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function icon(id) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    var use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#" + id);
    svg.appendChild(use);
    return svg;
  }

  function activeIndex() {
    for (var i = 0; i < state.stages.length; i++) {
      if (state.stages[i].id === state.activeId) return i;
    }
    return 0;
  }

  function render() {
    if (!state.container) return;
    var index = activeIndex();
    var allDone = state.stages.length > 0;
    for (var d = 0; d < state.stages.length; d++) {
      if (state.statuses[state.stages[d].id] !== "done") allDone = false;
    }
    state.container.innerHTML = "";
    state.container.className = "roadmap" + (state.errorId ? " error" : "") + (allDone ? " all-done" : "");
    var track = el("div", "roadmap-track");
    var line = el("div", "roadmap-line");
    var fill = el("div", "roadmap-fill");
    var pct = state.stages.length <= 1 ? 100 : Math.round((index / (state.stages.length - 1)) * 100);
    if (allDone) pct = 100;
    fill.style.width = pct + "%";
    line.appendChild(fill);
    track.appendChild(line);

    state.stages.forEach(function(stage, i) {
      var status = state.statuses[stage.id] || "locked";
      var canNavigate = status === "done" && i < index && stage.viewId && state.navigator;
      var button = el("button", "roadmap-step " + status + (canNavigate ? " navigable" : ""));
      button.type = "button";
      button.setAttribute("data-stage", stage.id);
      button.disabled = !canNavigate;
      button.title = status === "locked" ? "Complete the previous steps first" : stage.label;
      var circle = el("span", "roadmap-circle");
      circle.appendChild(icon(stage.icon || "i-check"));
      var check = el("span", "roadmap-check");
      check.textContent = "✓";
      circle.appendChild(check);
      var lock = el("span", "roadmap-lock");
      lock.appendChild(icon("i-lock"));
      circle.appendChild(lock);
      button.appendChild(circle);
      var label = el("span", "roadmap-label");
      label.textContent = stage.label;
      button.appendChild(label);
      if (canNavigate) {
        button.addEventListener("click", function() {
          state.activeId = stage.id;
          state.errorId = "";
          render();
          if (state.navigator && stage.viewId) state.navigator(stage.viewId);
        });
      }
      track.appendChild(button);
    });
    state.container.appendChild(track);
  }

  function setStatus(id, status) {
    if (!id) return;
    state.statuses[id] = status;
  }

  function setActive(id) {
    if (!id) return;
    state.activeId = id;
    state.errorId = "";
    if (state.statuses[id] !== "done") setStatus(id, "active");
    render();
  }

  function setDone(id) {
    if (!id) return;
    state.statuses[id] = "done";
    state.errorId = "";
    render();
  }

  function complete(id) {
    setStatus(id, "done");
    state.errorId = "";
    var index = -1;
    for (var i = 0; i < state.stages.length; i++) {
      if (state.stages[i].id === id) { index = i; break; }
    }
    if (index >= 0 && state.stages[index + 1]) {
      state.activeId = state.stages[index + 1].id;
      if (state.statuses[state.activeId] !== "done") state.statuses[state.activeId] = "active";
    }
    render();
  }

  function setError(id) {
    var target = id || state.activeId;
    if (!target) return;
    state.errorId = target;
    state.statuses[target] = "error";
    state.activeId = target;
    render();
  }

  function setAllError(id) {
    state.errorId = id || state.activeId;
    for (var i = 0; i < state.stages.length; i++) {
      state.statuses[state.stages[i].id] = "error";
    }
    if (state.errorId) state.activeId = state.errorId;
    render();
  }

  function reset(stages, activeId, navigator) {
    state.stages = stages || [];
    state.navigator = navigator || state.navigator;
    state.statuses = {};
    state.errorId = "";
    state.activeId = activeId || (state.stages[0] && state.stages[0].id) || "";
    state.stages.forEach(function(stage, index) {
      state.statuses[stage.id] = index === 0 ? "active" : "locked";
    });
    if (activeId) {
      for (var i = 0; i < state.stages.length; i++) {
        if (state.stages[i].id === activeId) {
          state.statuses[activeId] = "active";
          break;
        }
      }
    }
    render();
  }

  function init(containerId, stages, activeId, navigator) {
    state.container = document.getElementById(containerId);
    reset(stages, activeId, navigator);
  }

  window.MuzicRoadmap = {
    init: init,
    reset: reset,
    setActive: setActive,
    setDone: setDone,
    complete: complete,
    setError: setError,
    setAllError: setAllError,
    render: render
  };
})();
