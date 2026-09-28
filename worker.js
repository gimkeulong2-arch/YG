import {
  handleStandings
} from "./api/standings.js";

import {
  handlePlayers
} from "./api/players.js";


const KBO_API =
  "https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList";

const LOTTE_ID = "LT";


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


function parseDate(dateString) {
  const year =
    Number(
      dateString.slice(0, 4)
    );

  const month =
    Number(
      dateString.slice(4, 6)
    );

  const day =
    Number(
      dateString.slice(6, 8)
    );

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day
    )
  );
}


function formatDate(date) {
  return (
    String(
      date.getUTCFullYear()
    ) +
    String(
      date.getUTCMonth() + 1
    ).padStart(2, "0") +
    String(
      date.getUTCDate()
    ).padStart(2, "0")
  );
}


function moveDate(
  dateString,
  amount
) {
  const date =
    parseDate(dateString);

  date.setUTCDate(
    date.getUTCDate() +
    amount
  );

  return formatDate(date);
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
    ).toUpperCase() === LOTTE_ID ||

    String(
      game?.HOME_ID || ""
    ).toUpperCase() === LOTTE_ID
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


function isFinishedGame(game) {
  return (
    String(
      game?.GAME_STATE_SC || ""
    ) === "3"
  );
}


function isCancelledGame(game) {
  const cancel =
    String(
      game?.CANCEL_SC_NM || ""
    );

  return (
    cancel &&
    cancel !== "정상경기"
  );
}


async function findRecentGames(
  today,
  wanted = 3
) {
  const found = [];

  let date =
    moveDate(
      today,
      -1
    );


  for (
    let checked = 0;
    checked < 45;
    checked++
  ) {
    const raw =
      await getKboGames(
        date
      );


    const games =
      getGamesArray(raw);


    const lotteGames =
      games.filter(
        game =>
          isLotteGame(game) &&
          isFinishedGame(game) &&
          !isCancelledGame(game)
      );


    for (
      const game
      of lotteGames
    ) {
      found.push(
        normalizeGame(game)
      );


      if (
        found.length >= wanted
      ) {
        return found;
      }
    }


    date =
      moveDate(
        date,
        -1
      );
  }


  return found;
}


async function findNextGames(
  today,
  wanted = 3
) {
  const found = [];

  let date =
    moveDate(
      today,
      1
    );


  for (
    let checked = 0;
    checked < 45;
    checked++
  ) {
    const raw =
      await getKboGames(
        date
      );


    const games =
      getGamesArray(raw);


    const lotteGames =
      games.filter(
        game =>
          isLotteGame(game) &&
          !isFinishedGame(game) &&
          !isCancelledGame(game)
      );


    for (
      const game
      of lotteGames
    ) {
      found.push(
        normalizeGame(game)
      );


      if (
        found.length >= wanted
      ) {
        return found;
      }
    }


    date =
      moveDate(
        date,
        1
      );
  }


  return found;
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
     * KBO 순위
     *
     * 별도 파일
     * api/standings.js가 처리한다.
     */
    if (
      url.pathname ===
      "/api/standings"
    ) {
      return handleStandings();
    }

    if (
  url.pathname ===
  "/api/players"
) {
  return handlePlayers();
    }

    /*
     * KBO 원본 데이터 테스트
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
     * 최근 3경기 + 다음 3경기
     */
    if (
      url.pathname ===
      "/api/schedule"
    ) {
      try {
        const today =
          getKSTDate();


        const recent =
          await findRecentGames(
            today,
            3
          );


        const next =
          await findNextGames(
            today,
            3
          );


        recent.reverse();


        return jsonResponse({
          success: true,

          date:
            today,

          recent,

          next,

          total:
            recent.length +
            next.length
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
     * index.html,
     * standings.html 등
     * 정적 파일
     */
    return env.ASSETS.fetch(
      request
    );
  }
};
