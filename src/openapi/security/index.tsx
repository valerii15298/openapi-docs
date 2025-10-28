import type { OpenAPIV3_1 } from "@scalar/openapi-types";

import { ApiKeySecurityScheme } from "#openapi/security/api-key";
import { OAuth2SecurityScheme } from "#openapi/security/oauth2";

function renderSecurityScheme(
  scheme: OpenAPIV3_1.SecuritySchemeObject,
  name: string,
) {
  const path = ["components", "securitySchemes", name];
  if (scheme.type === "apiKey") {
    return <ApiKeySecurityScheme scheme={scheme} path={path} />;
  }
  if (scheme.type === "oauth2") {
    return <OAuth2SecurityScheme scheme={scheme} path={path} />;
  }
  return null;
}

export function SecuritySchemes({ spec }: { spec: OpenAPIV3_1.Document }) {
  const { securitySchemes } = spec.components ?? {};
  if (!securitySchemes) return null;

  return (
    <section className="m-4">
      <h2 className="mb-3 text-3xl">Security Schemes</h2>
      <ul className="grid gap-6">
        {Object.entries(securitySchemes).map(([name, scheme]) => (
          <li key={name}>{renderSecurityScheme(scheme, name)}</li>
        ))}
      </ul>
    </section>
  );
}
