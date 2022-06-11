function wordcountfrequency(text) {
  let config = {
    total: 0,
    words: {},
    wordCounts: {},
    join(appendConfig) {
      config.total = config.total + appendConfig.total;

      appendConfig.words.forEach((word) => {
        config.wordCounts[word]
          ? (config.wordCounts[word] += appendConfig.wordCounts[word])
          : (config.wordCounts[word] = appendConfig.wordCounts[word]);
      });

      config.words = Object.keys(config.wordCounts)
        .sort(function (a, b) {
          return config.wordCounts[b] > config.wordCounts[a] ? 1 : -1;
        })
        .map(function (e) {
          return e;
        });
      return this;
    },
  };

  let allWords = text
    .replace(/[a-z]+[\-|\']+[a-z]+/gi, "") // remove words with - or '
    .replace(/[\-|\']+[a-z]+/gi, "") // remove words with - or '
    .split(/[\?\!\.\,;]*[\s+–]|[\?\!\.\,;]$/); // split on ?!.,; or space

  allWords.forEach(function (word) {
    word = word.toLowerCase();
    if (
      word.length >= 3 && // word must be at least 3 characters
      !/[^a-zA-ZÅåÄäâàáÖöØøÆæÉéÈèÜüÊêÛûÎî\-\']/.test(word) && // remove words with non-alphanumeric characters
      /([a-z]+)/gi.test(word) // only words with letters
    ) {
      config.wordCounts[word]
        ? config.wordCounts[word]++
        : (config.wordCounts[word] = 1);
      config.total++;
    }
  });

  config.words = Object.keys(config.wordCounts)
    .sort(function (a, b) {
      return config.wordCounts[b] > config.wordCounts[a] ? 1 : -1;
    })
    .map(function (e) {
      return e;
    });

  return config;
}

const { htmlToText } = require("html-to-text");
const fs = require("fs");
var path = require("path");
function textFromDir(dir) {
  let allContent = "";
  let files = fs.readdirSync(dir);

  files.forEach(function (file) {
    let filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      allContent += textFromDir(filePath);
    } else {
      allContent += fs.readFileSync(filePath, "utf8");
    }
  });

  return allContent;
}

function forWordCloud(config) {
  words = Object.keys(config.wordCounts)
    .sort(function (a, b) {
      return config.wordCounts[b] > config.wordCounts[a] ? 1 : -1;
    })
    .map(function (e) {
      return [e, config.wordCounts[e]];
    });

  return words;
}

function forMomo(config, start, end) {
  if (start != undefined && end != undefined) {
    return config.words.slice(start, end);
  }
  return config.words.join("\n");
}

function fromDir(dir) {
  return wordcountfrequency(htmlToText(textFromDir(dir)));
}

function fromFile(filePath) {
  return wordcountfrequency(htmlToText(fs.readFileSync(filePath, "utf8")));
}

function appendConfig(config, appendConfig) {
  config.total = config.total + appendConfig.total;
  for (let word in appendConfig.words) {
    if (config.words[word]) {
      config.words[word] += appendConfig.words[word];
    } else {
      config.words[word] = appendConfig.words[word];
    }
  }
  config.words = Object.keys(config.wordCounts)
    .sort(function (a, b) {
      return config.wordCounts[b] > config.wordCounts[a] ? 1 : -1;
    })
    .map(function (e) {
      return e;
    });
  return config;
}

const axios = require("axios");
function fromUrl(url) {
  let html;
  let done = false;
  axios.get(url).then((response) => {
    html = response.data;
    done = true;
  });
  require("deasync").loopWhile(function () {
    return !done;
  });
  return wordcountfrequency(htmlToText(html));
}

module.exports = {
  wordcountfrequency,
  fromDir,
  fromUrl,
  fromFile,
  forWordCloud,
  forMomo,
};
