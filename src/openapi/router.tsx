import { Intro } from "#openapi/intro";
import { Operation } from "#openapi/operation";
import { SecuritySchemes } from "#openapi/security/index";

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
          // @ts-expect-error TODO use new OpenAPI types
          <Operation method={method} pathname={pathname!} />
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
