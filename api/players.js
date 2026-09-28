const KBO_REGISTER_URL =
  "https://www.koreabaseball.com/Player/RegisterAll.aspx";


function cleanText(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\r/g, "")
    .trim();
}


function parsePeople(html) {
  const text =
    cleanText(html);


  const lines =
    text
      .split("\n")
      .map(
        item =>
          item
            .replace(/\s+/g, " ")
            .trim()
      )
      .filter(Boolean);


  const people = [];


  for (const line of lines) {
    /*
     * KBO 표시 형태:
     *
     * 김태형(88)
     * 박세웅(21)
     */
    const match =
      line.match(
        /^(.+?)\s*\((\d+)\)$/
      );


    if (!match) {
      continue;
    }


    people.push({
      name:
        match[1].trim(),

      number:
        match[2]
    });
  }


  return people;
}


function extractLotte(html) {
  const rows =
    [
      ...html.matchAll(
        /<tr[^>]*>([\s\S]*?)<\/tr>/gi
      )
    ];


  for (const rowMatch of rows) {
    const row =
      rowMatch[1];


    const cells =
      [
        ...row.matchAll(
          /<td[^>]*>([\s\S]*?)<\/td>/gi
        )
      ];


    /*
     * 구단 / 감독 / 코치 /
     * 투수 / 포수 / 내야수 / 외야수
     */
    if (cells.length < 7) {
      continue;
    }


    const teamText =
      cleanText(
        cells[0][1]
      );


    if (
      !teamText.includes(
        "롯데"
      )
    ) {
      continue;
    }


    return {
      manager:
        parsePeople(
          cells[1][1]
        ),

      coaches:
        parsePeople(
          cells[2][1]
        ),

      pitchers:
        parsePeople(
          cells[3][1]
        ),

      catchers:
        parsePeople(
          cells[4][1]
        ),

      infielders:
        parsePeople(
          cells[5][1]
        ),

      outfielders:
        parsePeople(
          cells[6][1]
        )
    };
  }


  throw new Error(
    "KBO 페이지에서 롯데 등록 명단을 찾지 못했습니다."
  );
}


async function fetchLottePlayers() {
  const response =
    await fetch(
      KBO_REGISTER_URL,
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
      "KBO 선수 등록 페이지 응답 오류: " +
      response.status
    );
  }


  const html =
    await response.text();


  if (!html) {
    throw new Error(
      "KBO 선수 등록 페이지가 비어 있습니다."
    );
  }


  return extractLotte(
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
         * 등록/말소가 있을 수 있으므로
         * 5분 캐시
         */
        "cache-control":
          "public, max-age=300"
      }
    }
  );
}


export async function handlePlayers() {
  try {
    const roster =
      await fetchLottePlayers();


    const playerCount =
      roster.pitchers.length +
      roster.catchers.length +
      roster.infielders.length +
      roster.outfielders.length;


    return jsonResponse({
      success: true,

      team:
        "롯데",

      source:
        "KBO",

      playerCount,

      staffCount:
        roster.manager.length +
        roster.coaches.length,

      roster
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
