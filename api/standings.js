const KBO_STANDINGS_URL =
  "https://www.koreabaseball.com/Record/TeamRank/TeamRank.aspx";


function cleanText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}


function parseNumber(value) {
  const text =
    cleanText(value);

  if (
    text === "" ||
    text === "-"
  ) {
    return null;
  }

  const number =
    Number(text);

  return Number.isNaN(number)
    ? text
    : number;
}


function getCurrentYearKST() {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "Asia/Seoul",
      year: "numeric"
    }
  ).format(new Date());
}


function extractStandings(html) {
  /*
   * KBO 팀 순위 페이지에는
   * 여러 표가 존재할 수 있으므로
   * 순위표 형태의 tbody를 찾는다.
   */

  const tbodyMatches =
    [
      ...html.matchAll(
        /<tbody[^>]*>([\s\S]*?)<\/tbody>/gi
      )
    ];


  for (
    const tbodyMatch
    of tbodyMatches
  ) {
    const tbody =
      tbodyMatch[1];


    const rows =
      [
        ...tbody.matchAll(
          /<tr[^>]*>([\s\S]*?)<\/tr>/gi
        )
      ];


    const standings = [];


    for (
      const rowMatch
      of rows
    ) {
      const row =
        rowMatch[1];


      const cells =
        [
          ...row.matchAll(
            /<td[^>]*>([\s\S]*?)<\/td>/gi
          )
        ].map(
          match =>
            cleanText(
              match[1]
            )
        );


      /*
       * 팀 순위 표는 최소한
       *
       * 순위
       * 팀명
       * 경기
       * 승
       * 패
       * 무
       * 승률
       * 게임차
       *
       * 를 가진다.
       */
      if (
        cells.length < 8
      ) {
        continue;
      }


      const rank =
        Number(
          cells[0]
        );


      if (
        !Number.isInteger(rank) ||
        rank < 1 ||
        rank > 10
      ) {
        continue;
      }


      standings.push({
        rank,

        team:
          cells[1],

        games:
          parseNumber(
            cells[2]
          ),

        wins:
          parseNumber(
            cells[3]
          ),

        losses:
          parseNumber(
            cells[4]
          ),

        draws:
          parseNumber(
            cells[5]
          ),

        winRate:
          parseNumber(
            cells[6]
          ),

        gamesBehind:
          parseNumber(
            cells[7]
          ),

        last10:
          cells[8] || "",

        streak:
          cells[9] || "",

        home:
          cells[10] || "",

        away:
          cells[11] || ""
      });
    }


    /*
     * KBO 1군은 10개 구단.
     *
     * 10개 팀을 찾은 tbody만
     * 실제 KBO 순위표로 인정한다.
     */
    if (
      standings.length === 10
    ) {
      return standings;
    }
  }


  throw new Error(
    "KBO 순위표를 찾지 못했습니다."
  );
}


async function fetchStandings() {
  const response =
    await fetch(
      KBO_STANDINGS_URL,
      {
        method: "GET",

        headers: {
          "user-agent":
            "Mozilla/5.0",

          "accept":
            "text/html,application/xhtml+xml",

          "referer":
            "https://www.koreabaseball.com/"
        }
      }
    );


  if (!response.ok) {
    throw new Error(
      "KBO 순위 페이지 응답 오류: " +
      response.status
    );
  }


  const html =
    await response.text();


  if (!html) {
    throw new Error(
      "KBO 순위 페이지가 비어 있습니다."
    );
  }


  return extractStandings(
    html
  );
}


function jsonResponse(
  data,
  status = 200
) {
  return new Response(
    JSON.stringify(
      data,
      null,
      2
    ),
    {
      status,

      headers: {
        "content-type":
          "application/json; charset=UTF-8",

        /*
         * 순위는 매 요청마다
         * 새로 받을 필요가 없으므로
         * 짧게 캐시한다.
         */
        "cache-control":
          "public, max-age=60"
      }
    }
  );
}


export async function handleStandings() {
  try {
    const standings =
      await fetchStandings();


    const lotte =
      standings.find(
        team =>
          team.team === "롯데"
      ) || null;


    return jsonResponse({
      success: true,

      year:
        Number(
          getCurrentYearKST()
        ),

      teamCount:
        standings.length,

      lotte,

      standings
    });
  }

  catch (error) {
    return jsonResponse(
      {
        success: false,

        error:
          error?.message ||
          String(error)
      },
      500
    );
  }
}
