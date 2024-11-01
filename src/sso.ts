import fetchCookie, { FetchCookieImpl } from "fetch-cookie";
import { CookieJar } from "tough-cookie";

const CEDER_SSO = "https://oneoncology-uat.enclave.cedarinternal.com/provider/oidc/";
const LOGIN_URL =
  "https://oneoncology-uat.enclave.cedarinternal.com/provider/login?next=/operator/";

const getCsrfToken = async (fetch: any) => {
  const res = await fetch(LOGIN_URL, { method: "GET" });
  const cookies = res.headers.get("set-cookie");
  const csrfToken = getCookieFromString(cookies, "csrftoken");
  return csrfToken;
};

function getCookieFromString(cookieString: string, name: string) {
  const match = cookieString.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) {
    return match[2];
  }
  return null;
}

const getSSORedirectURL = async (fetch: FetchCookieImpl<any, any, any>, csrfToken: string) => {
  try {
    const res = await fetch(CEDER_SSO, {
      method: "POST",
      headers: {
        accept: "*/*",
        "x-csrftoken": csrfToken,
        "x-csrf-token": csrfToken,
        referer: "https://oneoncology-uat.enclave.cedarinternal.com",
        "content-type": "application/json",
        "referrer-policy": "strict-origin-when-cross-origin",
      },
      body: JSON.stringify({
        guarantor_id: "2407311003",
      }),
    });

    return res.url;
  } catch (error) {
    console.error(error);
  }
};

const run = async () => {
  const cookieJar = new CookieJar();

  const fetchWithCookies = fetchCookie(fetch, cookieJar);
  const csrfToken = await getCsrfToken(fetchWithCookies);
  if (!csrfToken) {
    throw new Error("csrfToken not found");
  }
  console.log("token", csrfToken);
  const ssoRedirectURL = await getSSORedirectURL(fetchWithCookies, csrfToken);
  console.log(ssoRedirectURL);
  return ssoRedirectURL;
};

run();
// };
