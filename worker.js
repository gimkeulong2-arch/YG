const KBO_API =
  "https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList";


function getKSTDate() {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Seoul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    ).formatToParts(
      new Date()
    );

  const get =
    type =>
      parts.find(
        part =>
          part.type === type
      )?.value || "";

  return (
    get("year") +
    get("month") +
    get("day")
  );
}


async function getKboGames(
  date
) {
  const response =
    await fetch(
      KBO_API,
      {
        method: "POST",

        headers: {
          "content-type":
            "application/json; charset=UTF-8",

          "user-agent":
            "Mozilla/5.0",

          "referer":
            "https://www.koreabaseball.com/Schedule/GameCenter/Main.aspx"
        },

        body:
          JSON.stringify({
            leId: "1",
            srId: "0",
            date
          })
      }
    );


  const text =
    await response.text();


  if (!response.ok) {
    throw new Error(
      "KBO 응답 오류: " +
      response.status
    );
  }


  /*
   * KBO 서버가 JSON 뒤에
   * HTML을 붙이는 경우를 대비
   */
  const htmlStart =
    text.search(
      /<!DOCTYPE|<html/i
    );


  const clean =
    (
      htmlStart >= 0
        ? text.slice(
            0,
            htmlStart
          )
        : text
    ).trim();


  if (!clean) {
    return {};
  }


  return JSON.parse(
    clean
  );
}


function getGamesArray(
  raw
) {
  if (
    Array.isArray(
      raw?.game
    )
  ) {
    return raw.game;
  }


  return [];
}


function isLotteGame(
  game
) {
  const values =
    [
      game?.T_NM,
      game?.B_NM,

      game?.AWAY_NM,
      game?.HOME_NM,

      game?.AWAY_TEAM_NM,
      game?.HOME_TEAM_NM,

      game?.AWAY_TEAM,
      game?.HOME_TEAM
    ]
      .filter(Boolean)
      .map(
        value =>
          String(value)
            .toUpperCase()
      );


  return values.some(
    value =>
      value.includes(
        "롯데"
      ) ||
      value.includes(
        "LOTTE"
      )
  );
}


function findLotteGame(
  games
) {
  return (
    games.find(
      isLotteGame
    ) ||
    null
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

        "cache-control":
          "no-store"
      }
    }
  );
}


export default {

  async fetch(
    request,
    env
  ) {
    const url =
      new URL(
        request.url
      );


    /*
     * -------------------------
     * KBO 전체 데이터 테스트
     * -------------------------
     */

    if (
      url.pathname ===
      "/api/kbo-test"
    ) {
      try {
        const date =
          (
            url.searchParams.get(
              "date"
            ) ||
            getKSTDate()
          )
            .replace(
              /\D/g,
              ""
            )
            .slice(
              0,
              8
            );


        if (
          date.length !== 8
        ) {
          throw new Error(
            "날짜 형식이 올바르지 않습니다."
          );
        }


        const raw =
          await getKboGames(
            date
          );


        const games =
          getGamesArray(
            raw
          );


        return jsonResponse(
          {
            success: true,

            date,

            gameCount:
              games.length,

            games
          }
        );
      }

      catch (
        error
      ) {
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


    /*
     * -------------------------
     * 오늘의 롯데 경기
     * -------------------------
     */

    if (
      url.pathname ===
      "/api/today"
    ) {
      try {
        const date =
          getKSTDate();


        const raw =
          await getKboGames(
            date
          );


        const games =
          getGamesArray(
            raw
          );


        const lotteGame =
          findLotteGame(
            games
          );


        /*
         * 오늘 롯데 경기 없음
         */

        if (!lotteGame) {
          return jsonResponse(
            {
              success: true,

              date,

              hasGame: false,

              game: null
            }
          );
        }


        /*
         * 오늘 롯데 경기 있음
         *
         * 아직 필드명을 임의로
         * 변환하지 않는다.
         *
         * 실제 KBO 응답 구조를
         * 그대로 확인한 뒤
         * 다음 단계에서 화면용으로
         * 정확하게 가공한다.
         */

        return jsonResponse(
          {
            success: true,

            date,

            hasGame: true,

            game:
              lotteGame
          }
        );
      }

      catch (
        error
      ) {
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


    /*
     * -------------------------
     * 나머지 요청:
     * index.html 등 정적 파일
     * -------------------------
     */

    return env.ASSETS.fetch(
      request
    );
  }
};
