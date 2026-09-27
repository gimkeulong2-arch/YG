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
    ).formatToParts(new Date());

  const get = type =>
    parts.find(
      part => part.type === type
    )?.value || "";

  return (
    get("year") +
    get("month") +
    get("day")
  );
}


async function getKboGames(date) {
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


  return JSON.parse(clean);
}


function getGamesArray(raw) {
  if (
    Array.isArray(
      raw?.game
    )
  ) {
    return raw.game;
  }

  return [];
}


function isLotteGame(game) {
  return (
    String(
      game?.AWAY_ID || ""
    ).toUpperCase() === "LT" ||

    String(
      game?.HOME_ID || ""
    ).toUpperCase() === "LT"
  );
}


function getGameStatus(game) {
  const state =
    String(
      game?.GAME_STATE_SC || ""
    );


  if (state === "3") {
    return "경기 종료";
  }


  const awayScore =
    game?.T_SCORE_CN;

  const homeScore =
    game?.B_SCORE_CN;


  if (
    awayScore !== null &&
    awayScore !== undefined &&
    awayScore !== "" &&
    homeScore !== null &&
    homeScore !== undefined &&
    homeScore !== ""
  ) {
    return "경기 중";
  }


  const cancel =
    String(
      game?.CANCEL_SC_NM || ""
    );


  if (
    cancel &&
    cancel !== "정상경기"
  ) {
    return cancel;
  }


  return "경기 예정";
}


function normalizeGame(game) {
  if (!game) {
    return null;
  }


  const awayScore =
    game?.T_SCORE_CN;

  const homeScore =
    game?.B_SCORE_CN;


  return {
    id:
      game?.G_ID || null,

    date:
      String(
        game?.G_DT || ""
      ),

    time:
      String(
        game?.G_TM || ""
      ),

    stadium:
      game?.S_NM || "",

    away: {
      id:
        game?.AWAY_ID || "",

      name:
        game?.AWAY_NM || "",

      score:
        awayScore === null ||
        awayScore === undefined ||
        awayScore === ""
          ? null
          : Number(awayScore)
    },

    home: {
      id:
        game?.HOME_ID || "",

      name:
        game?.HOME_NM || "",

      score:
        homeScore === null ||
        homeScore === undefined ||
        homeScore === ""
          ? null
          : Number(homeScore)
    },

    status:
      getGameStatus(game),

    gameType:
      game?.GAME_SC_NM || "",

    cancelStatus:
      game?.CANCEL_SC_NM || ""
  };
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
     * KBO 원본 데이터 확인
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
          getGamesArray(raw);


        return jsonResponse({
          success: true,
          date,
          gameCount:
            games.length,
          games
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


    /*
     * 오늘의 롯데 경기
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
          getGamesArray(raw);


        const lotteGame =
          games.find(
            isLotteGame
          ) || null;


        if (!lotteGame) {
          return jsonResponse({
            success: true,
            date,
            hasGame: false,
            game: null
          });
        }


        return jsonResponse({
          success: true,
          date,
          hasGame: true,
          game:
            normalizeGame(
              lotteGame
            )
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


    /*
     * 특정 날짜 롯데 경기
     *
     * 예:
     * /api/lotte?date=20260829
     */
    if (
      url.pathname ===
      "/api/lotte"
    ) {
      try {
        const date =
          (
            url.searchParams.get(
              "date"
            ) || ""
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
          return jsonResponse(
            {
              success: false,

              error:
                "date를 YYYYMMDD 형식으로 입력하세요."
            },
            400
          );
        }


        const raw =
          await getKboGames(
            date
          );


        const games =
          getGamesArray(raw);


        const lotteGame =
          games.find(
            isLotteGame
          ) || null;


        return jsonResponse({
          success: true,

          date,

          hasGame:
            Boolean(
              lotteGame
            ),

          game:
            normalizeGame(
              lotteGame
            )
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


    /*
     * index.html 등 정적 파일
     */
    return env.ASSETS.fetch(
      request
    );
  }
};
