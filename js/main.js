const GITHUB_ID = "jy0830";

// 다크 모드 (상태 → 렌더링 + 로컬스토리지 유지)
const themeToggle = document.querySelector("#themeToggle");
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);
themeToggle.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

// 햄버거 메뉴 토글
const hamburger = document.querySelector("#hamburger");
const navMenu = document.querySelector("#navMenu");
hamburger.addEventListener("click", () => navMenu.classList.toggle("active"));
navMenu.querySelectorAll("a").forEach((link) =>
  link.addEventListener("click", () => navMenu.classList.remove("active"))
);

// 스크롤: 네비 배경(60px), 탑 버튼(300px)
const nav = document.querySelector("#nav");
const topBtn = document.querySelector("#topBtn");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 60);
  topBtn.classList.toggle("show", window.scrollY > 300);
});
topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// 스크롤 애니메이션 (Intersection Observer, threshold 0.2)
const observer = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
  { threshold: 0.2 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// 폼 유효성 검사 (입력 → 상태 → 에러 표시)
const form = document.querySelector("#contactForm");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const { name, email, message } = form;
  let valid = true;
  const setErr = (id, msg) => {
    document.querySelector(`#${id}Err`).textContent = msg;
    if (msg) valid = false;
  };
  setErr("name", name.value.trim() ? "" : "이름을 입력하세요.");
  setErr("email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? "" : "올바른 이메일을 입력하세요.");
  setErr("message", message.value.trim() ? "" : "메시지를 입력하세요.");
  document.querySelector("#formSuccess").textContent = valid ? "메시지가 전송되었습니다!" : "";
  if (valid) form.reset();
});

// GitHub API (로딩/성공/에러/빈 상태)
const projectList = document.querySelector("#projectList");
const loadProjects = async () => {
  projectList.innerHTML = `<div class="loading"><div class="spinner"></div><p>로딩 중...</p></div>`;
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_ID}/repos`);
    if (!res.ok) throw new Error("불러오기 실패");
    const repos = await res.json();
    if (repos.length === 0) {
      projectList.innerHTML = `<p class="msg">표시할 프로젝트가 없습니다.</p>`;
      return;
    }
    projectList.innerHTML = repos
      .map(
        ({ name, description, stargazers_count, html_url }) => `
      <article class="card">
        <h3>${name}</h3>
        <p>${description || "설명 없음"}</p>
        <p>⭐ ${stargazers_count}</p>
        <a href="${html_url}" target="_blank" rel="noopener">GitHub →</a>
      </article>`
      )
      .join("");
  } catch (err) {
    projectList.innerHTML = `<div class="msg"><p>프로젝트를 불러올 수 없습니다.</p><button class="btn" id="retry">다시 시도</button></div>`;
    document.querySelector("#retry").addEventListener("click", loadProjects);
  }
};
loadProjects();
