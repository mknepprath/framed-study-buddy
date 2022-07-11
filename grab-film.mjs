import fs from "fs";
import https from "https";

import { load } from "cheerio";

const FILMGRAB_FILE = `${process.cwd()}/data/grab-film.js`;

const request = https.request(
  {
    host: "film-grab.com",
    path: "/movies-a-z/",
  },
  function (res) {
    var data = "";
    res.on("data", function (chunk) {
      data += chunk;
    });
    res.on("end", function () {
      const $ = load(data);
      const links = $(".display-posts-listing a"); //jquery get all hyperlinks
      const linksJson = [];
      $(links).each(function (i, link) {
        linksJson.push({
          title: $(link).text(),
          href: $(link).attr("href"),
        });
      });
      const linksStr = `const films = ${JSON.stringify(linksJson, null, "  ")};
export default films;`;
      fs.writeFileSync(FILMGRAB_FILE, linksStr);
    });
  }
);
request.on("error", function (e) {
  console.log(e.message);
});
request.end();

export {};
