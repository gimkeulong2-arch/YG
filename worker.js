<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="theme-color"
    content="#07152b"
  >

  <title>윤강 자이언츠</title>

  <style>
    * {
      box-sizing: border-box;
    }

    html {
      -webkit-tap-highlight-color: transparent;
    }

    body {
      margin: 0;
      min-height: 100vh;

      font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        "Noto Sans KR",
        sans-serif;

      background: #f3f5f8;
      color: #111827;
    }

    .top {
      padding:
        20px
        20px
        38px;

      background:
        linear-gradient(
          145deg,
          #07152b,
          #102b55
        );

      color: white;
    }

    .top-inner {
      max-width: 650px;
      margin: 0 auto;
    }

    .brand-row {
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-bottom: 35px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;

      font-size: 18px;
      font-weight: 800;
    }

    .ball {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 38px;
      height: 38px;

      border-radius: 12px;

      background:
        rgba(
          255,
          255,
          255,
          0.12
        );

      font-size: 21px;
    }

    .kbo {
      color:
        rgba(
          255,
          255,
          255,
          0.55
        );

      font-size: 12px;
      font-weight: 700;
    }

    .hero-label {
      margin-bottom: 8px;

      color: #9fb3d2;

      font-size: 13px;
      font-weight: 700;
    }

    h1 {
      margin: 0;

      font-size: 36px;
      line-height: 1.08;

      letter-spacing: -0.045em;
    }

    .hero-text {
      margin:
        13px
        0
        0;

      color: #b7c4d8;

      font-size: 14px;
      line-height: 1.6;
    }

    .main {
      width: 100%;
      max-width: 650px;

      margin: 0 auto;

      padding:
        22px
        17px
        60px;
    }

    .section {
      margin-bottom: 28px;
    }

    .section-title {
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin:
        0
        3px
        12px;
    }

    .section-title h2 {
      margin: 0;

      font-size: 19px;

      letter-spacing: -0.035em;
    }

    .section-title span {
      color: #8b95a5;
      font-size: 12px;
    }

    .card {
      overflow: hidden;

      background: white;

      border:
        1px solid
        #e6e9ee;

      border-radius: 21px;

      box-shadow:
        0
        5px
        18px
        rgba(
          25,
          35,
          55,
          0.045
        );
    }

    .today-card {
      padding:
        21px
        19px;
    }

    .game-state {
      display: inline-flex;

      padding:
        5px
        9px;

      margin-bottom: 21px;

      border-radius: 999px;

      background: #eef2f7;

      color: #697586;

      font-size: 11px;
      font-weight: 800;
    }

    .game-state.live {
      background: #fff0f0;
      color: #d71920;
    }

    .game-state.finished {
      background: #eef2f7;
      color: #667085;
    }

    .game-state.scheduled {
      background: #eef4ff;
      color: #315be8;
    }

    .match {
      display: grid;

      grid-template-columns:
        1fr
        auto
        1fr;

      align-items: center;

      gap: 10px;
    }

    .team {
      min-width: 0;

      text-align: center;
    }

    .team-logo {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 58px;
      height: 58px;

      margin:
        0 auto
        10px;

      border-radius: 18px;

      background: #f2f4f7;

      font-size: 24px;
      font-weight: 900;
    }

    .team.lotte .team-logo {
      background: #e51b35;
      color: white;
    }

    .team-name {
      overflow: hidden;

      font-size: 15px;
      font-weight: 800;

      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .score-area {
      min-width: 76px;

      text-align: center;
    }

    .score {
      font-size: 27px;
      font-weight: 900;

      letter-spacing: -0.04em;
    }

    .versus {
      color: #a1a9b6;

      font-size: 13px;
      font-weight: 800;
    }

    .game-info {
      display: flex;
      align-items: center;
      justify-content: center;

      flex-wrap: wrap;

      gap: 5px;

      margin-top: 20px;

      padding-top: 17px;

      border-top:
        1px solid
        #edf0f3;

      color: #7c8797;

      font-size: 13px;
    }

    .dot {
      color: #c4c9d0;
    }

    .placeholder {
      padding:
        30px
        20px;

      text-align: center;
    }

    .placeholder-icon {
      margin-bottom: 10px;

      font-size: 27px;
    }

    .placeholder strong {
      display: block;

      margin-bottom: 6px;

      font-size: 14px;
    }

    .placeholder p {
      margin: 0;

      color: #8a94a3;

      font-size: 12px;
      line-height: 1.55;
    }

    .games {
      display: grid;
      gap: 9px;
    }

    .game-row {
      display: grid;

      grid-template-columns:
        75px
        1fr
        auto;

      align-items: center;

      gap: 8px;

      padding:
        15px
        16px;

      background: white;

      border:
        1px solid
        #e7eaf0;

      border-radius: 16px;
    }

    .game-date {
      color: #7b8493;

      font-size: 12px;
      font-weight: 700;
    }

    .game-teams {
      font-size: 13px;
      font-weight: 800;
    }

    .game-result {
      color: #7d8796;

      font-size: 12px;
      font-weight: 700;
    }

    .loading {
      opacity: 0.55;
    }

    .menu {
      display: grid;

      grid-template-columns:
        1fr
        1fr;

      gap: 11px;
    }

    .menu-card {
      min-height: 125px;

      padding: 18px;

      border:
        1px solid
        #e6e9ee;

      border-radius: 19px;

      background: white;

      color: inherit;

      text-decoration: none;
    }

    .menu-card:active {
      transform:
        scale(0.985);
    }

    .menu-icon {
      margin-bottom: 22px;

      font-size: 23px;
    }

    .menu-card strong {
      display: block;

      margin-bottom: 5px;

      font-size: 15px;
    }

    .menu-card span {
      color: #8a94a3;

      font-size: 11px;
    }

    .footer {
      padding-top: 8px;

      text-align: center;

      color: #a0a7b2;

      font-size: 11px;
    }
  </style>
</head>


<body>

  <header class="top">

    <div class="top-inner">

      <div class="brand-row">

        <div class="brand">

          <div class="ball">
            ⚾
          </div>

          윤강 자이언츠

        </div>

        <div class="kbo">
          LOTTE GIANTS
        </div>

      </div>


      <div class="hero-label">
        YUNGANG GIANTS
      </div>

      <h1>
        롯데의 오늘을<br>
        한눈에.
      </h1>

      <p class="hero-text">
        경기, 일정, 순위와 선수 정보를
        한곳에서 확인합니다.
      </p>

    </div>

  </header>


  <main class="main">

    <section class="section">

      <div class="section-title">

        <h2>
          오늘의 경기
        </h2>

        <span id="todayDate">
          -
        </span>

      </div>


      <div
        class="card placeholder"
        id="todayGame"
      >

        <div class="placeholder-icon">
          ⚾
        </div>

        <strong>
          경기 정보를 불러오는 중
        </strong>

        <p>
          KBO 데이터를 확인하고 있습니다.
        </p>

      </div>

    </section>


    <section class="section">

      <div class="section-title">

        <h2>
          경기 일정
        </h2>

        <span>
          최근 3 · 다음 3
        </span>

      </div>


      <div
        class="games"
        id="schedule"
      >

        <div class="game-row loading">

          <div class="game-date">
            최근 경기
          </div>

          <div class="game-teams">
            다음 단계에서 연결
          </div>

          <div class="game-result">
            -
          </div>

        </div>


        <div class="game-row loading">

          <div class="game-date">
            예정 경기
          </div>

          <div class="game-teams">
            다음 단계에서 연결
          </div>

          <div class="game-result">
            -
          </div>

        </div>

      </div>

    </section>


    <section class="section">

      <div class="section-title">

        <h2>
          더 보기
        </h2>

      </div>


      <div class="menu">

        <a
          href="#"
          class="menu-card"
          onclick="
            prepare('KBO 순위');
            return false;
          "
        >

          <div class="menu-icon">
            🏆
          </div>

          <strong>
            KBO 순위
          </strong>

          <span>
            10개 구단 순위
          </span>

        </a>


        <a
          href="#"
          class="menu-card"
          onclick="
            prepare('롯데 선수단');
            return false;
          "
        >

          <div class="menu-icon">
            👥
          </div>

          <strong>
            롯데 선수단
          </strong>

          <span>
            선수 명단과 기록
          </span>

        </a>

      </div>

    </section>


    <div class="footer">
      윤강 자이언츠
    </div>

  </main>


  <script>

    function escapeHtml(value) {
      return String(
        value ?? ""
      )
        .replaceAll(
          "&",
          "&amp;"
        )
        .replaceAll(
          "<",
          "&lt;"
        )
        .replaceAll(
          ">",
          "&gt;"
        )
        .replaceAll(
          '"',
          "&quot;"
        )
        .replaceAll(
          "'",
          "&#039;"
        );
    }


    function setDate() {
      const now =
        new Date();


      const text =
        new Intl.DateTimeFormat(
          "ko-KR",
          {
            timeZone:
              "Asia/Seoul",

            month:
              "long",

            day:
              "numeric",

            weekday:
              "short"
          }
        ).format(now);


      document
        .getElementById(
          "todayDate"
        )
        .textContent =
          text;
    }


    function teamSymbol(team) {
      if (
        team.id === "LT"
      ) {
        return "LOTTE";
      }

      return (
        team.name ||
        team.id ||
        "?"
      );
    }


    function statusClass(status) {
      if (
        status === "경기 중"
      ) {
        return "live";
      }

      if (
        status === "경기 종료"
      ) {
        return "finished";
      }

      return "scheduled";
    }


    function renderNoGame() {
      const box =
        document.getElementById(
          "todayGame"
        );


      box.className =
        "card placeholder";


      box.innerHTML = `
        <div class="placeholder-icon">
          ⚾
        </div>

        <strong>
          오늘은 롯데 경기가 없습니다
        </strong>

        <p>
          다음 경기 일정은 아래에서
          확인할 수 있습니다.
        </p>
      `;
    }


    function renderError() {
      const box =
        document.getElementById(
          "todayGame"
        );


      box.className =
        "card placeholder";


      box.innerHTML = `
        <div class="placeholder-icon">
          ⚠️
        </div>

        <strong>
          경기 정보를 불러오지 못했습니다
        </strong>

        <p>
          잠시 후 다시 시도해 주세요.
        </p>
      `;
    }


    function renderGame(game) {
      const box =
        document.getElementById(
          "todayGame"
        );


      const away =
        game.away || {};

      const home =
        game.home || {};


      const hasScore =
        away.score !== null &&
        away.score !== undefined &&
        home.score !== null &&
        home.score !== undefined;


      const middle =
        hasScore
          ? `
            <div class="score">
              ${escapeHtml(away.score)}
              :
              ${escapeHtml(home.score)}
            </div>
          `
          : `
            <div class="versus">
              VS
            </div>
          `;


      const awayClass =
        away.id === "LT"
          ? "team lotte"
          : "team";


      const homeClass =
        home.id === "LT"
          ? "team lotte"
          : "team";


      box.className =
        "card today-card";


      box.innerHTML = `
        <div
          class="
            game-state
            ${statusClass(game.status)}
          "
        >
          ${escapeHtml(game.status)}
        </div>


        <div class="match">

          <div class="${awayClass}">

            <div class="team-logo">
              ${escapeHtml(
                teamSymbol(away)
              )}
            </div>

            <div class="team-name">
              ${escapeHtml(
                away.name
              )}
            </div>

          </div>


          <div class="score-area">
            ${middle}
          </div>


          <div class="${homeClass}">

            <div class="team-logo">
              ${escapeHtml(
                teamSymbol(home)
              )}
            </div>

            <div class="team-name">
              ${escapeHtml(
                home.name
              )}
            </div>

          </div>

        </div>


        <div class="game-info">

          <span>
            ${escapeHtml(
              game.time || "시간 미정"
            )}
          </span>

          <span class="dot">
            ·
          </span>

          <span>
            ${escapeHtml(
              game.stadium ||
              "구장 미정"
            )}
          </span>

        </div>
      `;
    }


    async function loadTodayGame() {
      try {
        const response =
          await fetch(
            "/api/today",
            {
              cache:
                "no-store"
            }
          );


        if (!response.ok) {
          throw new Error(
            "HTTP " +
            response.status
          );
        }


        const data =
          await response.json();


        if (!data.success) {
          throw new Error(
            data.error ||
            "API 오류"
          );
        }


        if (
          !data.hasGame ||
          !data.game
        ) {
          renderNoGame();
          return;
        }


        renderGame(
          data.game
        );
      }

      catch (error) {
        console.error(
          error
        );

        renderError();
      }
    }


    function prepare(name) {
      alert(
        name +
        " 기능은 다음 단계에서 연결합니다."
      );
    }


    setDate();

    loadTodayGame();

  </script>

</body>
</html>
