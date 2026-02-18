import type { ReactNode } from "react";

import { Intro } from "#openapi/intro";
import { Operation } from "#openapi/operation";
import { Page } from "#openapi/page";
import { SecuritySchemes } from "#openapi/security/index";

type Render = (args: {
  path: string[];
  children: ReactNode;
}) => React.ReactNode;

type Router = {
  [key: `^${string}$`]: Router;
  render?: Render;
};

const router: Router = {
  render: ({ path, children }) =>
    path.length ? (children ?? <>Not Found</>) : <Intro />,

  "^paths$": {
    "^/.*$": {
      "^(get|head|post|put|delete|connect|options|trace|patch)$": {
        render: ({ path: [_, pathname, method] }) => (
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

  "^x-pages$": {
    render: () => <Page />,
  },
};

function matchRoute(path: string[], route: Router | undefined) {
  const renders = [router.render];

  for (const pathFragment of path) {
    if (!route) break;

    const { render: _, ...rest } = route;

    route = Object.entries(rest).find(([k]) =>
      new RegExp(k, "u").test(pathFragment),
    )?.[1];

    renders.push(route?.render);
  }

  return renders.reduceRight(
    (acc, render) => render?.({ path, children: acc }) ?? acc,
    null as ReactNode,
  );
}

export function renderPath(path: string[]) {
  return matchRoute(path, router);
}
