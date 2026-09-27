const KBO_API =
  "https://www.koreabaseball.com/ws/Main.asmx/GetKboGameList";

function todayKST() {
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
      p => p.type === type
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
      `KBO 응답 오류 ${response.status}: ${text.slice(0, 200)}`
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

  return JSON.parse(
    clean || "{}"
  );
}

export default {
  async fetch(request, env) {
    const url =
      new URL(
        request.url
      );

    /*
     * API 이외의 요청은
     * 기존 index.html을 그대로 제공
     */
    if (
      url.pathname !==
      "/api/kbo-test"
    ) {
      return env.ASSETS.fetch(
        request
      );
    }

    try {
      const date =
        (
          url.searchParams.get(
            "date"
          ) ||
          todayKST()
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

      return new Response(
        JSON.stringify(
          {
            success: true,
            date,

            gameCount:
              Array.isArray(
                raw.game
              )
                ? raw.game.length
                : 0,

            games:
              Array.isArray(
                raw.game
              )
                ? raw.game
                : [],

            checkedAt:
              new Date()
                .toISOString()
          },
          null,
          2
        ),
        {
          headers: {
            "content-type":
              "application/json; charset=UTF-8",

            "cache-control":
              "no-store"
          }
        }
      );
    }

    catch (error) {
      return new Response(
        JSON.stringify(
          {
            success: false,

            error:
              error?.message ||
              String(error)
          },
          null,
          2
        ),
        {
          status: 500,

          headers: {
            "content-type":
              "application/json; charset=UTF-8",

            "cache-control":
              "no-store"
          }
        }
      );
    }
  }
};
