import { load } from "cheerio";
import React from "react";

import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import films from "../../data/grab-film";

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

export const loader = async () => {
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
    if (src) images.push({ src, id: String(i) });
  });

  return json({
    // options: films.map((film) => film.title),
    images: shuffle(images),
    ...film,
  });
};

export default function Index() {
  const { images, title, href } = useLoaderData();
  const [index, setIndex] = React.useState(0);
  const [gotIt, setGotIt] = React.useState(false);
  const [gotItCount, setGotItCount] = React.useState(0);

  React.useEffect(() => {
    const item = localStorage.getItem("state");
    let state = item ? JSON.parse(item) : "";
    if (state) {
      setGotIt(!!state.find((film: string) => film === title));
      setGotItCount(state?.length || 0);
    }
  }, [title]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Framed Study Buddy ({gotItCount} ✅)</h1>
      {/* {images.map(({ id, src }: { id: string; src: string }) => (
        <img alt={`${title} #${id}`} id={id} key={id} src={src} />
      ))} */}
      <div>
        <button
          onClick={() => {
            const item = localStorage.getItem("state");
            let state = item ? JSON.parse(item) : "";
            if (!state) state = [];
            state.push(title);
            localStorage.setItem("state", JSON.stringify(state));

            location.reload();
          }}
          style={{ marginBottom: 8, marginRight: 8 }}
          type="button"
        >
          Got It
        </button>
        <button
          onClick={() => location.reload()}
          style={{ marginBottom: 8, marginRight: 8 }}
          type="button"
        >
          Didn't Get it
        </button>
        <button
          onClick={() => {
            localStorage.clear();
            location.reload();
          }}
          style={{ marginBottom: 8, marginRight: 8 }}
          type="button"
        >
          Start Over
        </button>
      </div>
      <img
        alt={`${title} #${images[index].id}`}
        id={images[index].id}
        key={images[index].id}
        onClick={() => {
          if (index < images.length) {
            setIndex((i) => i + 1);
          } else {
            setIndex(0);
          }
        }}
        src={images[index].src}
        style={{ cursor: "pointer", maxWidth: "100%", width: 500 }}
      />
      {/* <form method="post">
        <div>
          <label>
            Guess:{" "}
            <select name="film">
              {options.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form> */}
      {index >= 6 ? (
        <p>
          <a href={href}>{title}</a> {gotIt ? "✅" : ""}
        </p>
      ) : null}
    </div>
  );
}
