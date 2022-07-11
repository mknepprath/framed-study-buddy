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
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        lineHeight: "1.4",
        textAlign: "center",
      }}
    >
      <h1>Framed Study Buddy</h1>
      {/* {images.map(({ id, src }: { id: string; src: string }) => (
        <img alt={`${title} #${id}`} id={id} key={id} src={src} />
      ))} */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <button
          onClick={() => {
            const item = localStorage.getItem("state");
            let state = item ? JSON.parse(item) : "";
            if (!state) state = [];
            if (!state.find((film: string) => film === title))
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
        }}
        src={images[index].src}
        style={{
          borderRadius: 8,
          cursor: "pointer",
          maxWidth: "100%",
          width: 500,
        }}
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
          <a href={href}>{title}</a>
        </p>
      ) : null}
      <p>Total ✅: {gotItCount}</p>
      <button
        onClick={() => {
          localStorage.clear();
          location.reload();
        }}
        type="button"
      >
        Start Over
      </button>
      {gotIt ? <p>✅ You correctly guessed this one previously.</p> : ""}
    </div>
  );
}
