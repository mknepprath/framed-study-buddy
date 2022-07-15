import React from "react";

import type { Film } from "./index";

export default function Ratings() {
  const [films, setFilms] = React.useState<Film[]>([]);

  films.sort((a, b) => (a.r < b.r ? 1 : -1));

  React.useEffect(() => {
    const item = localStorage.getItem("films");
    let films = item ? JSON.parse(item) : "";
    setFilms(films);
  }, []);

  return (
    <div
      style={{
        fontFamily: "Helvetica Neue, system-ui, sans-serif",
        lineHeight: "1.4",
      }}
    >
      {films.map((film) => (
        <p key={film.t}>
          {film.t} ({film.r / 10})
        </p>
      ))}
    </div>
  );
}
