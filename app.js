// App logic for Dashboard, Leaderboard, Admin
(function () {
  const el = (sel, root = document) => root.querySelector(sel);
  const els = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const fmtXP = (n) => `${n} XP`;

  function renderUserSelect(state) {
    const select = el("#userSelect");
    if (!select) return;
    select.innerHTML = state.members.map(m => `<option value="${m.id}">${m.name}</option>`).join("");
    select.value = state.currentUserId;
    select.addEventListener("change", (e) => {
      state.currentUserId = e.target.value;
      window.FQData.save(state);
      window.FQ.initDashboard(); // re-render dashboard
    });
  }

  function renderCurrentUserHeader(state) {
    const user = state.members.find(m => m.id === state.currentUserId);
    el("#currentUserName").textContent = user?.name ?? "Member";
    el("#currentUserXP").textContent = state.xpTotals[user.id] || 0;
    const av = el("#currentUserAvatar");
    if (av) av.textContent = (user.name[0] || "?").toUpperCase();
  }

  function renderQuests(state) {
    const userId = state.currentUserId;
    const quests = state.userQuests[userId] || [];
    const active = quests.filter(q => !q.completed);
    const completed = quests.filter(q => q.completed);

    const tpl = el("#questCardTemplate");
    const activeRoot = el("#activeQuests");
    const completedRoot = el("#completedQuests");
    activeRoot.innerHTML = "";
    completedRoot.innerHTML = "";

    function buildCard(q, isCompleted) {
      const node = tpl.content.cloneNode(true);
      el(".title", node).textContent = q.title;
      el(".xp-badge", node).textContent = fmtXP(q.xp);
      el(".desc", node).textContent = q.desc;

      const btn = el(".btn.complete", node);
      const status = el(".status", node);

      if (isCompleted) {
        btn.style.display = "none";
        status.textContent = "Completed";
      } else {
        btn.addEventListener("click", () => {
          q.completed = true;
          q.completedAt = Date.now();
          state.xpTotals[userId] = (state.xpTotals[userId] || 0) + q.xp;
          window.FQData.save(state);
          renderCurrentUserHeader(state);
          renderQuests(state);
        });
      }
      return node;
    }

    active.forEach(q => activeRoot.appendChild(buildCard(q, false)));
    completed.forEach(q => completedRoot.appendChild(buildCard(q, true)));
  }

  function renderLeaderboard(state) {
    const body = el("#leaderboardBody");
    if (!body) return;
    const rows = state.members
      .map(m => ({ id: m.id, name: m.name, xp: state.xpTotals[m.id] || 0 }))
      .sort((a, b) => b.xp - a.xp);

    body.innerHTML = "";
    rows.forEach((row, idx) => {
      const tr = document.createElement("tr");
      if (row.id === state.currentUserId) tr.classList.add("highlight");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <div class="avatar" style="width:28px; height:28px;">${row.name[0]}</div>
            <span>${row.name}</span>
          </div>
        </td>
        <td>${row.xp}</td>
      `;
      body.appendChild(tr);
    });
  }

  function renderAdmin(state) {
    // Members
    const list = el("#memberList");
    const tpl = el("#memberCardTemplate");
    list.innerHTML = "";
    state.members.forEach(m => {
      const node = tpl.content.cloneNode(true);
      el(".title", node).textContent = m.name;
      el(".xp-badge", node).textContent = fmtXP(state.xpTotals[m.id] || 0);

      const card = el(".card.member", node);
      els("button", card).forEach(btn => {
        const action = btn.getAttribute("data-action");
        btn.addEventListener("click", () => {
          if (action === "assignDefaults") {
            state.userQuests[m.id] = state.defaultQuests.map(q => ({
              ...q, completed: false, completedAt: null
            }));
            window.FQData.save(state);
            renderAdmin(state);
          } else if (action === "clearCompleted") {
            const quests = state.userQuests[m.id] || [];
            quests.forEach(q => { q.completed = false; q.completedAt = null; });
            state.xpTotals[m.id] = 0;
            window.FQData.save(state);
            renderAdmin(state);
          } else if (action === "removeMember") {
            state.members = state.members.filter(x => x.id !== m.id);
            delete state.userQuests[m.id];
            delete state.xpTotals[m.id];
            if (state.currentUserId === m.id && state.members.length) {
              state.currentUserId = state.members[0].id;
            }
            window.FQData.save(state);
            renderAdmin(state);
          }
        });
      });
      list.appendChild(node);
    });

    // Add member
    const addBtn = el("#addMemberBtn");
    const nameInput = el("#newMemberName");
    addBtn.onclick = () => {
      const name = (nameInput.value || "").trim();
      if (!name) return;
      const id = name.toLowerCase().replace(/\s+/g, "-");
      if (state.members.find(m => m.id === id)) return;
      state.members.push({ id, name, avatarSeed: name[0] });
      state.userQuests[id] = state.defaultQuests.map(q => ({ ...q, completed: false, completedAt: null }));
      state.xpTotals[id] = 0;
      nameInput.value = "";
      window.FQData.save(state);
      renderAdmin(state);
    };

    // Cycle reset
    const resetBtn = el("#resetCycleBtn");
    resetBtn.onclick = () => {
      Object.keys(state.userQuests).forEach(uid => {
        state.userQuests[uid].forEach(q => { q.completed = false; q.completedAt = null; });
      });
      Object.keys(state.xpTotals).forEach(uid => { state.xpTotals[uid] = 0; });
      window.FQData.save(state);
      renderAdmin(state);
    };

    // Default quests
    const dqList = el("#defaultQuestList");
    const dqTpl = el("#defaultQuestTemplate");
    dqList.innerHTML = "";
    state.defaultQuests.forEach(q => {
      const node = dqTpl.content.cloneNode(true);
      el(".title", node).textContent = q.title;
      el(".xp-badge", node).textContent = fmtXP(q.xp);
      el(".desc", node).textContent = q.desc;
      const card = el(".card.quest.small", node);
      const removeBtn = el("[data-action='removeDefaultQuest']", card);
      removeBtn.onclick = () => {
        state.defaultQuests = state.defaultQuests.filter(x => x.id !== q.id);
        window.FQData.save(state);
        renderAdmin(state);
      };
      dqList.appendChild(node);
    });

    const addDQBtn = el("#addDefaultQuestBtn");
    const dqTitle = el("#dqTitle");
    const dqDesc = el("#dqDesc");
    const dqXP = el("#dqXP");
    addDQBtn.onclick = () => {
      const t = dqTitle.value.trim();
      const d = dqDesc.value.trim();
      const xp = parseInt(dqXP.value, 10);
      if (!t || !d || !xp || xp < 1) return;
      const id = "dq_" + t.toLowerCase().replace(/\s+/g, "_");
      state.defaultQuests.push({ id, title: t, desc: d, xp });
      // Optionally push to each member's quest list for next cycle or immediately:
      // Here we just update defaults; admins can "Assign default quests" per member.
      dqTitle.value = ""; dqDesc.value = ""; dqXP.value = "";
      window.FQData.save(state);
      renderAdmin(state);
    };
  }

  window.FQ = {
    initDashboard() {
      const state = window.FQData.load();
      renderUserSelect(state);
      renderCurrentUserHeader(state);
      renderQuests(state);
    },
    initLeaderboard() {
      const state = window.FQData.load();
      renderLeaderboard(state);
    },
    initAdmin() {
      const state = window.FQData.load();
      renderAdmin(state);
    }
  };
})();
