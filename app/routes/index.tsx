import { load } from "cheerio";
import React from "react";
import Select from "react-select";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import films from "../../data/grab-film";

export interface Film {
  t: string; // title
  r: number; // confidence rating
  g: number; // guessed correctly
}

function shuffle(array: unknown[]) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export const loader = async ({ request }: { request: Request }) => {
  var film = films[Math.floor(Math.random() * films.length)];

  const response = await fetch(film.href, {
    headers: { "Content-Type": "text/html" },
  });
  const body = await response.text();
  const $ = load(body);
  const imgs = $("img"); //jquery get all hyperimgs
  const images: { src: string; id: string }[] = [];
  $(imgs).each(function (i, img) {
    const src = $(img).attr("src");
    if (
      src?.includes(
        "https://film-grab.com/wp-content/uploads/photo-gallery/"
      ) &&
      src?.includes("/thumb/")
    )
      images.push({ src, id: String(i) });
  });

  const url = new URL(request.url);
  const mode = url.searchParams.get("mode");

  return json({
    easyMode: mode === "easy",
    images: shuffle(images),
    options: films.map((film) => ({ label: film.title, value: film.title })),
    ...film,
  });
};

export default function Index() {
  const { easyMode, href, images, title, options } = useLoaderData();
  const [index, setIndex] = React.useState(0);
  const [tapCount, setTapCount] = React.useState(0);
  const [message, setMessage] = React.useState("");
  const [guessedCount, setGuessedCount] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState(null);

  React.useEffect(() => {
    const item = localStorage.getItem("films");
    let films: Film[] = item ? JSON.parse(item) : "";
    if (films) {
      setGuessedCount(films?.filter((film) => !!film.g).length || 0);

      const film = films.find((film) => film.t === title);
      if (film) {
        setMessage("👀 You've seen this before.");
        if (film?.g) setMessage("✅ You've correctly guessed this one.");
        if (film?.r >= 13) setMessage("✨ You really know this movie!");
        if (film?.r <= 7) setMessage("🤕 You're struggling with this one.");
        if (film?.r <= 5) setMessage(`🎥 ${film.t}. Review for next time.`);
      }
    }
  }, [title]);

  return (
    <div
      style={{
        fontFamily: "Helvetica Neue, system-ui, sans-serif",
        lineHeight: "1.4",
        textAlign: "center",
      }}
    >
      <h1>Framed Study Buddy</h1>

      <div style={{ position: "absolute", bottom: 8, left: 8, right: 8 }}>
        {!easyMode ? (
          <div style={{ color: "#000", margin: 8, textAlign: "left" }}>
            <Select
              autoFocus
              menuPlacement="auto"
              onChange={(option: { title: string; value: string } | null) => {
                setSelectedOption(option as null); // 😳

                const item = localStorage.getItem("films");
                let films = item ? JSON.parse(item) : [];
                const film = films.find((film: Film) => film.t === title);
                if (
                  (option as { title: string; value: string }).value === title
                ) {
                  setMessage("✨ Yep!");
                  if (!film) {
                    films.push({ t: title, r: 11, g: 1 } as Film);
                  } else {
                    film.r += 1;
                    film.g = 1;
                  }
                } else {
                  setMessage(`⛔ The film was ${title}.`);
                  if (!film) {
                    films.push({ t: title, r: 9 } as Film);
                  } else {
                    film.r -= 1;
                  }
                }
                localStorage.setItem("films", JSON.stringify(films));

                setTimeout(() => {
                  location.reload();
                }, 300);
              }}
              options={options}
              value={selectedOption}
              name="film"
              placeholder="Choose a film"
            />
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
          }}
        >
          {easyMode ? (
            <button
              onClick={() => {
                const item = localStorage.getItem("films");
                let films = item ? JSON.parse(item) : [];
                const film = films.find((film: Film) => film.t === title);
                if (!film) {
                  films.push({ t: title, r: 11, g: 1 } as Film);
                } else {
                  film.r += 1;
                  film.g = 1;
                }
                localStorage.setItem("films", JSON.stringify(films));

                location.reload();
              }}
              style={{
                width: "100%",
                border: "none",
                borderRadius: 4,
                color: "white",
                padding: 16,
                background: "#38c07d",
                margin: 8,
                fontSize: "1em",
                cursor: "pointer",
              }}
              type="button"
            >
              Got It
            </button>
          ) : null}
          <button
            onClick={() => {
              if (!easyMode) setMessage(`⛔ The film was ${title}.`);

              const item = localStorage.getItem("films");
              let films = item ? JSON.parse(item) : [];
              const film = films.find((film: Film) => film.t === title);
              if (!film) {
                films.push({ t: title, r: 9 } as Film);
              } else {
                film.r -= 1;
              }
              localStorage.setItem("films", JSON.stringify(films));

              setTimeout(
                () => {
                  location.reload();
                },
                easyMode ? 0 : 600
              );
            }}
            style={{
              width: "100%",
              border: "none",
              borderRadius: 4,
              color: "white",
              padding: 16,
              background: "#df5935",
              margin: 8,
              fontSize: "1em",
              cursor: "pointer",
            }}
            type="button"
          >
            Don't Know It
          </button>
        </div>
      </div>
      <p>
        Frame {index + 1} of {images.length}
      </p>
      <img
        alt={`${title} #${images[index].id}`}
        id={images[index].id}
        key={images[index].id}
        onClick={() => {
          if (index < images.length - 1) {
            setIndex((i) => i + 1);
          } else {
            setIndex(0);
          }
          setTapCount((count) => count + 1);
        }}
        src={images[index].src}
        style={{
          borderRadius: 8,
          cursor: "pointer",
          maxWidth: "100%",
          width: 500,
        }}
      />

      {/* Preload next image */}
      {index + 1 < images.length ? (
        <img
          alt={`${title} #${images[index + 1].id}`}
          id={images[index + 1].id}
          key={images[index + 1].id}
          src={images[index + 1].src}
          style={{
            left: -1000,
            position: "absolute",
            top: -1000,
            width: 1,
          }}
        />
      ) : null}

      {/* Display title after 6 frames,
          or on final frame if there are no 6 frames.
       */}
      {tapCount >= 6 && easyMode ? (
        <p>
          <a href={href}>{title}</a>
        </p>
      ) : null}

      {message ? <p>{message}</p> : ""}

      <div style={{ justifyContent: "center", display: "flex", width: "100%" }}>
        <p style={{ margin: "0.8em 0" }}>Total ✅: {guessedCount}</p>
        <button
          onClick={() => {
            localStorage.clear();
            location.reload();
          }}
          style={{
            border: "none",
            borderRadius: 4,
            color: "white",
            padding: "8px 16px",
            background: "#3d405b",
            margin: 8,
            cursor: "pointer",
          }}
          type="button"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
