import http from "k6/http";
import { sleep } from "k6";

export const options = {
  vus: 1000,
  duration: "30s",
};

const loginMutation = `
mutation Login {
  login(email: "test@email.com", password: "123456") {
    token
  }
}
`;

const getUserMutation = `
query Me {
  me {
    id
  }
}
`;

let res;
let token;

export function setup() {
  res = http.post(
    "http://localhost:5001",
    JSON.stringify({ query: loginMutation }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  token = JSON.parse(res.body as string).data.login.token;
}

const headers = {
  "Content-Type": "application/json",
  "auth-token": token || "",
};

async function gql(query: string) {
  return http.post("http://localhost:5001", JSON.stringify({ query }), {
    headers,
  });
}

export default async function () {
  await gql(getUserMutation);
  sleep(0.1);
}
