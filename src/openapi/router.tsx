import { Intro } from "#openapi/intro";
import { Operation } from "#openapi/operation";
import { SecuritySchemes } from "#openapi/security/index";
import type { OpenAPIV3_1 } from "#types";

interface Router {
  [key: `^${string}$`]: Router;
  render?: (path: string[]) => React.ReactNode;
}

const router: Router = {
  render: () => <Intro />,

  "^paths$": {
    "^/.*$": {
      "^(get|head|post|put|delete|connect|options|trace|patch)$": {
        render: ([_, pathname, method]) => (
          <Operation
            method={method as OpenAPIV3_1.HttpMethods}
            pathname={pathname!}
          />
        ),
      },
    },
  },

  "^components$": {
    "^securitySchemes$": {
      render: () => <SecuritySchemes />,
    },
  },
};

export function matchRoute(path: string[], route: Router = router) {
  const { render, ...rest } = route;
  if (!path.length) {
    return render;
  }
  const [key, ...subPath] = path;

  const sub = Object.entries(rest).find(([k]) => new RegExp(k, "u").test(key!));
  if (!sub) return null;
  const [, subRoute] = sub;

  return matchRoute(subPath, subRoute);
}
