/**
 * Robot Agent Runtime Notes - Navigation & Interactivity
 */

(function () {
  'use strict';

  /* ======================================================
     Nav data - all pages
     ====================================================== */
  const NAV_DATA = [
    {
      section: '入门',
      items: [
        { label: '项目概述', href: 'index.html', icon: '🏠' },
        {
          label: '系统全景', href: '01-overview.html', icon: '🧭',
          sub: [
            { label: '一次完整交互', href: '01-overview.html#sequence' },
            { label: '闭环联动', href: '01-overview.html#loop' },
            { label: '两条总线', href: '01-overview.html#two-buses' },
            { label: '谁持有谁', href: '01-overview.html#ownership' },
          ]
        },
      ]
    },
    {
      section: '架构',
      items: [
        {
          label: '分层与边界', href: '02-architecture.html', icon: '🏗️',
          sub: [
            { label: '九层职责', href: '02-architecture.html#layers' },
            { label: '依赖方向', href: '02-architecture.html#deps' },
            { label: '四条硬规则', href: '02-architecture.html#rules' },
          ]
        },
        {
          label: 'Adapter 体系', href: '03-adapters.html', icon: '🔌',
          sub: [
            { label: '三类判定', href: '03-adapters.html#classes' },
            { label: 'Real / Mock 合同', href: '03-adapters.html#realmock' },
            { label: '从 0 到 1 写一个', href: '03-adapters.html#build' },
            { label: '生命周期与 facade', href: '03-adapters.html#runtime' },
            { label: 'Engine 准入门槛', href: '03-adapters.html#engine' },
          ]
        },
        { label: 'Tool 体系', href: '04-tools.html', icon: '🧰' },
        { label: '事件驱动', href: '05-events.html', icon: '📡' },
      ]
    },
    {
      section: '会话与状态',
      items: [
        {
          label: '会话生命周期', href: '06-session.html', icon: '👤',
          sub: [
            { label: '单活跃会话', href: '06-session.html#single' },
            { label: '会话从哪来', href: '06-session.html#sources' },
            { label: '人脸驱动的切换', href: '06-session.html#face-switch' },
            { label: '不活跃看门狗', href: '06-session.html#watchdog' },
            { label: '三类倒计时', href: '06-session.html#kinds' },
            { label: '六个暂停源', href: '06-session.html#pause-sources' },
            { label: '会话里存什么', href: '06-session.html#history' },
          ]
        },
        {
          label: '机器人状态机', href: '07-robot-state.html', icon: '🤖',
          sub: [
            { label: '15 个状态', href: '07-robot-state.html#states' },
            { label: '转移矩阵', href: '07-robot-state.html#transition' },
            { label: '事件转发矩阵', href: '07-robot-state.html#forwarding' },
            { label: '能力准入', href: '07-robot-state.html#capability' },
            { label: '转移触发源', href: '07-robot-state.html#triggers' },
            { label: 'reaction', href: '07-robot-state.html#reaction' },
            { label: '回充链路', href: '07-robot-state.html#charging' },
            { label: '急停与启动对账', href: '07-robot-state.html#emergency' },
          ]
        },
      ]
    },
    {
      section: '上下文',
      items: [
        {
          label: '上下文压缩', href: '08-compression.html', icon: '🗜️',
          sub: [
            { label: '预算模型', href: '08-compression.html#budget' },
            { label: '有界批次', href: '08-compression.html#batch' },
            { label: 'CAS 提交', href: '08-compression.html#cas' },
            { label: '两类事实', href: '08-compression.html#facts' },
          ]
        },
        {
          label: '提示词工程', href: '09-prompt.html', icon: '📝',
          sub: [
            { label: 'prompt 是代码', href: '09-prompt.html#why' },
            { label: '一个版本长什么样', href: '09-prompt.html#shape' },
            { label: '按工具拼装', href: '09-prompt.html#assembly' },
            { label: '七个版本共存', href: '09-prompt.html#registry' },
            { label: '两套版本策略', href: '09-prompt.html#policies' },
            { label: '改完怎么验证', href: '09-prompt.html#verify' },
          ]
        },
      ]
    },
    {
      section: '运行时',
      items: [
        { label: '配置体系', href: '10-config.html', icon: '⚙️' },
        { label: '可观测性', href: '11-observability.html', icon: '📈' },
      ]
    },
    {
      section: '工程',
      items: [
        { label: '测试策略', href: '12-testing.html', icon: '🧪' },
        { label: 'AI 协作开发', href: '13-ai-workflow.html', icon: '🤝' },
        {
          label: '复盘与取舍', href: '14-retrospective.html', icon: '🪞',
          sub: [
            { label: '从原型到重写', href: '14-retrospective.html#rewrite' },
            { label: '做对的', href: '14-retrospective.html#right' },
            { label: '代价与过度设计', href: '14-retrospective.html#wrong' },
            { label: '两个案例', href: '14-retrospective.html#cases' },
            { label: '如果重来', href: '14-retrospective.html#again' },
          ]
        },
      ]
    },
  ];

  /* ======================================================
     Sidebar render
     ====================================================== */
  function renderSidebar() {
    const container = document.getElementById('sidebar-nav');
    if (!container) return;

    const currentPage = getCurrentPage();
    let html = '';

    NAV_DATA.forEach(group => {
      html += `<li class="nav-section"><span class="nav-section-title">${group.section}</span></li>`;
      group.items.forEach(item => {
        const isActive = currentPage === item.href || (item.sub && item.sub.some(s => currentPage === item.href));
        const hasSubActive = item.sub && item.sub.some(s => window.location.href.includes(item.href));
        const isOpen = isActive || hasSubActive;

        if (item.sub) {
          html += `
            <li class="nav-item has-sub ${isOpen ? 'open' : ''}">
              <a href="${item.href}" class="${isActive ? 'active' : ''}">
                <span class="nav-icon">${item.icon}</span>
                ${item.label}
                <span class="nav-chevron">▼</span>
              </a>
              <ul class="nav-sub">
                ${item.sub.map(s => `
                  <li class="nav-sub-item">
                    <a href="${s.href}">${s.label}</a>
                  </li>
                `).join('')}
              </ul>
            </li>`;
        } else {
          html += `
            <li class="nav-item">
              <a href="${item.href}" class="${isActive ? 'active' : ''}">
                <span class="nav-icon">${item.icon}</span>
                ${item.label}
              </a>
            </li>`;
        }
      });
    });

    container.innerHTML = html;

    container.querySelectorAll('.nav-item.has-sub > a').forEach(link => {
      link.addEventListener('click', function (e) {
        const li = this.closest('.nav-item.has-sub');
        const isOpen = li.classList.contains('open');
        if (!isOpen) {
          e.preventDefault();
          li.classList.toggle('open');
        }
      });
    });
  }

  /* ======================================================
     TOC generation
     ====================================================== */
  function buildTOC() {
    const article = document.querySelector('.article');
    const tocList = document.getElementById('toc-list');
    if (!article || !tocList) return;

    const headings = article.querySelectorAll('h2, h3');
    if (headings.length === 0) return;

    let html = '';
    headings.forEach((h, i) => {
      if (!h.id) h.id = 'heading-' + i;
      const cls = h.tagName === 'H3' ? 'toc-h3' : '';
      html += `<li><a href="#${h.id}" class="${cls}">${h.textContent}</a></li>`;
    });

    tocList.innerHTML = html;
  }

  /* ======================================================
     TOC highlight on scroll
     ====================================================== */
  function initTOCHighlight() {
    const tocLinks = document.querySelectorAll('#toc-list a');
    if (tocLinks.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            tocLinks.forEach(a => a.classList.remove('active'));
            const activeLink = document.querySelector(`#toc-list a[href="#${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add('active');
          }
        });
      },
      {
        rootMargin: `-${56 + 20}px 0px -70% 0px`,
        threshold: 0
      }
    );

    document.querySelectorAll('.article h2, .article h3').forEach(h => observer.observe(h));
  }

  /* ======================================================
     Mobile sidebar toggle
     ====================================================== */
  function initMobileSidebar() {
    const btn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (!btn || !sidebar) return;

    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('show');
    });

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
  }

  /* ======================================================
     Helpers
     ====================================================== */
  function getCurrentPage() {
    const path = window.location.pathname;
    const parts = path.split('/');
    return parts[parts.length - 1] || 'index.html';
  }

  /* ======================================================
     Smooth scroll for anchor links
     ====================================================== */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.getElementById(this.getAttribute('href').slice(1));
        if (target) {
          e.preventDefault();
          const offset = 56 + 24;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ======================================================
     Copy code buttons
     ====================================================== */
  function initCopyButtons() {
    document.querySelectorAll('pre').forEach(pre => {
      const btn = document.createElement('button');
      btn.textContent = '复制';
      btn.style.cssText = `
        position: absolute; top: 8px; right: 40px;
        font-size: 11px; padding: 3px 10px;
        background: rgba(255,255,255,0.08); color: #9ca3af;
        border: 1px solid rgba(255,255,255,0.12); border-radius: 4px;
        cursor: pointer; transition: all 0.15s; font-family: var(--font-sans);
      `;
      btn.addEventListener('click', () => {
        const code = pre.querySelector('code');
        const text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(() => {
          btn.textContent = '已复制!';
          btn.style.color = '#10b981';
          setTimeout(() => { btn.textContent = '复制'; btn.style.color = '#9ca3af'; }, 2000);
        });
      });
      pre.style.position = 'relative';
      pre.appendChild(btn);
    });
  }

  /* ======================================================
     Init
     ====================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    buildTOC();
    initTOCHighlight();
    initMobileSidebar();
    initSmoothScroll();
    initCopyButtons();
  });

})();
