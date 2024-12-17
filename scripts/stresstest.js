import http from "k6/http";

export const options = {
  stages: [
    { duration: "15s", target: 500 },
    { duration: "30s", target: 500 },
    { duration: "15s", target: 0 },
  ],
};

const endpoint = __ENV.ENDPOINT || "http://localhost:8080";
const board = __ENV.BOARD || genName(32);

const USERNAME_BOOST_RATE = Number(__ENV.USERNAME_BOOST_RATE || 51);
const userboost = String(__ENV.USERNAME_BOOST || "")
  .split(",")
  .filter(Boolean);

const usernames = [
  "alice",
  "bob",
  "charlie",
  "dave",
  "eve",
  "frank",
  "grace",
  "heidi",
  "ivan",
  "judy",
  "mallory",
  "nancy",
  "oscar",
  "peggy",
  "quinn",
  "ruth",
  "steve",
  "trudy",
  "ursula",
  "victor",
  "wendy",
  "xavier",
  "yvonne",
  "zack",
  "abby",
  "brian",
  "cathy",
  "daniel",
  "elena",
  "felix",
  "gina",
  "harry",
  "isabel",
  "jack",
  "karen",
  "leo",
  "mia",
  "nate",
  "olivia",
  "paul",
  "quincy",
  "rachel",
  "sam",
  "tina",
  "ugo",
  "violet",
  "wayne",
  "xena",
  "yuri",
  "zoe",
  "adam",
  "bella",
  "chris",
  "diana",
  "edward",
  "fiona",
  "george",
  "hannah",
  "ian",
  "julia",
  "kevin",
  "lisa",
  "matt",
  "nina",
  "owen",
  "penny",
  "quentin",
  "robin",
  "sophia",
  "tom",
  "ursula",
  "vicky",
  "will",
  "xander",
  "yasmin",
  "zane",
  "andy",
  "beth",
  "carl",
  "dora",
  "ethan",
  "flora",
  "greg",
  "holly",
  "isaac",
  "joan",
  "kyle",
  "lily",
  "mark",
  "nora",
  "otis",
  "pam",
  "queen",
];

export default async function () {
  const url = `${endpoint}/board/${board}`;

  const index = sample(usernames.length);
  const data = {
    username: usernames[index],
    score: sample(3) + 1,
  };

  if (userboost.length > 0 && index % USERNAME_BOOST_RATE === 0) {
    data.username = userboost[sample(userboost.length)];
  }

  const body = JSON.stringify(data);
  const params = {
    headers: { "content-type": "application/json", "api-key": "changemenow" },
  };

  const res = http.post(url, body, params);
  const ok = res.status >= 200 && res.status < 400;
  if (!ok) console.error(res.body);
}

// Utility function to generate random string
function genName(length = 26) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(sample(chars.length));
  }
  return result;
}

function sample(c) {
  return Math.floor(Math.random() * c);
}
