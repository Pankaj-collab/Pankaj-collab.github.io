// Seed data and helpers. LocalStorage key namespace.
(function () {
  const NS = "FQ_v1";

  const defaultMembers = [
    { id: "ben", name: "Ben" },
    { id: "alex", name: "Alex" },
    { id: "david", name: "David" },
    { id: "chloe", name: "Chloe" }
  ];

  // Five default quests per user
  const defaultQuests = [
    { id: "q_walk_dog", title: "Walk the dog", desc: "Take the dog for a 30-minute walk around the neighborhood.", xp: 30 },
    { id: "q_read_chapter", title: "Read a chapter", desc: "Read one chapter from your current book for at least 20 minutes.", xp: 20 },
    { id: "q_clean_room", title: "Clean your room", desc: "Tidy your space, make your bed, and put away clothes.", xp: 50 },
    { id: "q_help_meal", title: "Help with meal prep", desc: "Assist in preparing dinner and setting the table.", xp: 25 },
    { id: "q_study_session", title: "Study session", desc: "Complete 30 minutes of focused study on any subject.", xp: 40 }
  ];

  // Per-user state for current cycle: quests with completion flags and XP tally
  const seedState = () => {
    const members = defaultMembers.map(m => ({ ...m, avatarSeed: m.name[0] }));
    const userQuests = {};
    members.forEach(m => {
      userQuests[m.id] = defaultQuests.map(q => ({ ...q, completed: false, completedAt: null }));
    });
    const xpTotals = members.reduce((acc, m) => { acc[m.id] = 0; return acc; }, {});
    return { members, defaultQuests, userQuests, xpTotals, currentUserId: "alex" };
  };

  const load = () => {
    const raw = localStorage.getItem(NS);
    if (!raw) return seedState();
    try {
      return JSON.parse(raw);
    } catch {
      return seedState();
    }
  };

  const save = (state) => localStorage.setItem(NS, JSON.stringify(state));

  window.FQData = {
    NS,
    load,
    save,
    seedState
  };
})();
