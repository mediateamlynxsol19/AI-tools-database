async function loadStats() {
  try {
    const response = await fetch('./stats.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Could not load stats.json');
    }

    const stats = await response.json();

    const totalTools = document.getElementById('total-tools');
    const totalCategories = document.getElementById('total-categories');
    const popularTools = document.getElementById('popular-tools');
    const categorySnapshot = document.getElementById('category-snapshot');
    const lastUpdated = document.getElementById('last-updated');

    if (totalTools) totalTools.textContent = String(stats.totalTools || 0);
    if (totalCategories) totalCategories.textContent = String(stats.totalCategories || 0);
    if (popularTools) popularTools.textContent = String(stats.popular || 0);
    if (lastUpdated) {
      lastUpdated.textContent = stats.lastUpdated
        ? new Date(stats.lastUpdated).toUTCString()
        : '-';
    }

    if (categorySnapshot && stats.categories) {
      const categoryNames = Object.keys(stats.categories)
        .sort((a, b) => stats.categories[b] - stats.categories[a])
        .slice(0, 6)
        .map(category =>
          category
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ')
        );

      categorySnapshot.textContent = `${categoryNames.join(', ')} and more.`;
    }
  } catch (_error) {
    // Keep initial content as fallback when stats file is unavailable.
  }
}

async function loadLatestTools() {
  const container = document.getElementById('latest-tools');
  if (!container) return;

  const linkIcon = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14l4-4"></path><path d="M7.5 16.5l-2 2a3 3 0 104.2 4.2l2-2"></path><path d="M16.5 7.5l2-2a3 3 0 10-4.2-4.2l-2 2"></path></svg>';
  const tagIcon = '<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3.4 13.4a2 2 0 010-2.8L10.6 3.4a2 2 0 011.4-.6H19a2 2 0 012 2v7a2 2 0 01-.6 1.4z"></path><circle cx="16.5" cy="7.5" r="1.2"></circle></svg>';

  try {
    const response = await fetch('./tools.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Could not load tools.json');
    }

    const data = await response.json();
    const tools = Array.isArray(data.tools) ? data.tools.slice(0, 6) : [];

    if (tools.length === 0) {
      container.innerHTML = '<article class="rounded-xl border border-black/20 p-4 text-sm text-black/60 dark:border-white/20 dark:text-white/60">No tools available right now.</article>';
      return;
    }

    container.innerHTML = tools
      .map(
        tool => `
          <article class="rounded-xl border border-black/20 bg-black/[0.02] p-4 transition hover:-translate-y-0.5 hover:bg-black/[0.06] dark:border-white/20 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]">
            <p class="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-black/45 dark:text-white/45">${tagIcon}${tool.category || 'unknown'}</p>
            <h3 class="mt-2 text-base font-semibold">${tool.name || 'Untitled Tool'}</h3>
            <p class="mt-2 text-sm text-black/70 dark:text-white/70">${tool.description || ''}</p>
            <a class="mt-3 inline-flex items-center gap-1 text-sm text-black underline underline-offset-4 dark:text-white" href="${tool.link || '#'}" target="_blank" rel="noopener noreferrer">${linkIcon}Visit tool</a>
          </article>
        `
      )
      .join('');
  } catch (_error) {
    container.innerHTML = '<article class="rounded-xl border border-black/20 p-4 text-sm text-black/60 dark:border-white/20 dark:text-white/60">Unable to load tools feed.</article>';
  }
}

async function loadRepoMetrics() {
  const starsEl = document.getElementById('repo-stars');
  const starsNavEl = document.getElementById('repo-stars-nav');
  const starsInlineEl = document.getElementById('repo-stars-inline');
  const prsNavEl = document.getElementById('repo-prs-nav');
  const prsEl = document.getElementById('repo-prs');
  const prsInlineEl = document.getElementById('repo-prs-inline');
  const forksEl = document.getElementById('repo-forks');
  const forksInlineEl = document.getElementById('repo-forks-inline');
  const issuesEl = document.getElementById('repo-issues');
  const issuesInlineEl = document.getElementById('repo-issues-inline');
  const watchersEl = document.getElementById('repo-watchers');

  const compact = value =>
    new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value || 0);

  try {
    const response = await fetch('https://api.github.com/repos/Durgesh-Vaigandla/ai-tools-database', {
      headers: {
        Accept: 'application/vnd.github+json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load repo metrics');
    }

    const repo = await response.json();

    const starCount = compact(repo.stargazers_count);
    const forkCount = compact(repo.forks_count);
    const issueCount = compact(repo.open_issues_count);
    const watcherCount = compact(repo.subscribers_count);

    if (starsEl) starsEl.textContent = starCount;
    if (starsNavEl) starsNavEl.textContent = starCount;
    if (starsInlineEl) starsInlineEl.textContent = starCount;
    if (forksEl) forksEl.textContent = forkCount;
    if (forksInlineEl) forksInlineEl.textContent = forkCount;
    if (issuesEl) issuesEl.textContent = issueCount;
    if (issuesInlineEl) issuesInlineEl.textContent = issueCount;
    if (watchersEl) watchersEl.textContent = watcherCount;

    const prsResponse = await fetch(
      'https://api.github.com/search/issues?q=repo:Durgesh-Vaigandla/ai-tools-database+is:pr+is:open',
      {
        headers: {
          Accept: 'application/vnd.github+json'
        }
      }
    );

    if (prsResponse.ok) {
      const prData = await prsResponse.json();
      const prCount = compact(prData.total_count || 0);
      if (prsNavEl) prsNavEl.textContent = prCount;
      if (prsEl) prsEl.textContent = prCount;
      if (prsInlineEl) prsInlineEl.textContent = prCount;
    }
  } catch (_error) {
    if (starsEl) starsEl.textContent = '-';
    if (starsNavEl) starsNavEl.textContent = '-';
    if (starsInlineEl) starsInlineEl.textContent = '-';
    if (forksEl) forksEl.textContent = '-';
    if (forksInlineEl) forksInlineEl.textContent = '-';
    if (issuesEl) issuesEl.textContent = '-';
    if (issuesInlineEl) issuesInlineEl.textContent = '-';
    if (watchersEl) watchersEl.textContent = '-';
    if (prsNavEl) prsNavEl.textContent = '-';
    if (prsEl) prsEl.textContent = '-';
    if (prsInlineEl) prsInlineEl.textContent = '-';
  }
}

function setupThemeToggle() {
  const html = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const knob = document.getElementById('theme-toggle-knob');
  const darkLabel = document.getElementById('theme-label-dark');
  const lightLabel = document.getElementById('theme-label-light');
  if (!toggle) return;

  const getStoredTheme = () => localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const applyTheme = theme => {
    const useDark = theme === 'dark';
    html.classList.toggle('dark', useDark);
    toggle.setAttribute('aria-pressed', useDark ? 'true' : 'false');

    if (knob) {
      knob.classList.toggle('translate-x-12', !useDark);
      knob.classList.toggle('translate-x-0', useDark);
    }

    if (darkLabel) {
      darkLabel.classList.toggle('text-white', useDark);
      darkLabel.classList.toggle('text-black/70', !useDark);
      darkLabel.classList.toggle('dark:text-black', useDark);
    }

    if (lightLabel) {
      lightLabel.classList.toggle('text-black/70', useDark);
      lightLabel.classList.toggle('text-black', !useDark);
      lightLabel.classList.toggle('dark:text-white', !useDark);
    }
  };

  const initial = getStoredTheme() || (prefersDark ? 'dark' : 'light');
  applyTheme(initial);

  toggle.addEventListener('click', () => {
    const isDark = html.classList.contains('dark');
    const next = isDark ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    applyTheme(next);
  });
}

function setupCopyButtons() {
  const buttons = document.querySelectorAll('[data-copy]');
  const feedback = document.getElementById('copy-feedback');

  buttons.forEach(button => {
    button.addEventListener('click', async () => {
      const text = button.getAttribute('data-copy') || '';
      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);
        if (feedback) feedback.textContent = 'Copied command to clipboard.';
      } catch (_error) {
        if (feedback) feedback.textContent = 'Copy failed. Clipboard access was denied.';
      }
    });
  });
}

loadStats();
loadLatestTools();
loadRepoMetrics();
setupCopyButtons();
setupThemeToggle();
