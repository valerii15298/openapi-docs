import type {
  Format,
  HttpMethod,
  JsonSchemaType,
  ParameterIn,
  ParameterStyle,
  SecuritySchemeType,
  XMLNodeType,
} from "./enums.js";

export type {
  Format,
  HttpMethod,
  JsonSchemaType,
  ParameterIn,
  ParameterStyle,
  SecuritySchemeType,
  XMLNodeType,
};

export type Json =
  | number
  | string
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export type Schema =
  | boolean
  | {
      $schema?: string;
      $id?: string;
      $anchor?: string;
      $ref?: string;
      $dynamicRef?: string;
      $dynamicAnchor?: string;
      $vocabulary?: Record<string, boolean>;
      $comment?: string;
      $defs?: Record<string, Schema>;
      additionalItems?: Schema;
      unevaluatedItems?: Schema;
      prefixItems?: Schema[];
      items?: Schema;
      contains?: Schema;
      additionalProperties?: Schema;
      unevaluatedProperties?: Schema;
      properties?: Record<string, Schema>;
      patternProperties?: Record<string, Schema>;
      dependentSchemas?: Record<string, Schema>;
      propertyNames?: Schema;
      if?: Schema;
      then?: Schema;
      else?: Schema;
      allOf?: Schema[];
      anyOf?: Schema[];
      oneOf?: Schema[];
      not?: Schema;
      multipleOf?: number;
      maximum?: number;
      exclusiveMaximum?: number;
      minimum?: number;
      exclusiveMinimum?: number;
      maxLength?: number;
      minLength?: number;
      pattern?: string;
      maxItems?: number;
      minItems?: number;
      uniqueItems?: boolean;
      maxContains?: number;
      minContains?: number;
      maxProperties?: number;
      minProperties?: number;
      required?: string[];
      dependentRequired?: Record<string, string[]>;
      const?: Json;
      enum?: Json[];
      type?: JsonSchemaType | JsonSchemaType[];
      title?: string;
      description?: string;
      default?: Json;
      deprecated?: boolean;
      readOnly?: boolean;
      writeOnly?: boolean;
      examples?: Json[];
      format?: Format;
      contentMediaType?: string;
      contentEncoding?: string;
      contentSchema?: Schema;
      example?: Json;
      discriminator?: Discriminator;
      externalDocs?: ExternalDocs;
      xml?: Xml;
    };

export type Discriminator = {
  /** Required */
  propertyName?: string;
  mapping?: Record<string, string>;
  defaultMapping?: string;
};

export type ExternalDocs = {
  /** Required */
  url?: string;
  description?: string;
};

export type Xml = {
  nodeType?: XMLNodeType;
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
};

export type Document = {
  /** Required */
  openapi?: "3.2" | `"3.2.${number}"`;
  $self?: string;
  /** Required */
  info?: Info;
  jsonSchemaDialect?: string;
  servers?: Server[];
  paths?: Record<string, PathItem>;
  webhooks?: Record<string, PathItem>;
  components?: Components;
  security?: SecurityRequirement[];
  tags?: Tag[];
  externalDocs?: ExternalDocs;
};

export type Info = {
  /** Required */
  title?: string;
  summary?: string;
  description?: string;
  termsOfService?: string;
  contact?: Contact;
  license?: License;
  /** Required */
  version?: string;
};

export type Contact = {
  name?: string;
  url?: string;
  email?: string;
};

export type License = {
  /** Required */
  name?: string;
  identifier?: string;
  url?: string;
};

export type Server = {
  /** Required */
  url?: string;
  description?: string;
  name?: string;
  variables?: Record<string, ServerVariable>;
};

export type ServerVariable = {
  enum?: string[];
  /** Required */
  default?: string;
  description?: string;
};

export type Components = {
  schemas?: Record<string, Schema>;
  responses?: Record<string, Response | Reference>;
  parameters?: Record<string, Parameter | Reference>;
  examples?: Record<string, Example | Reference>;
  requestBodies?: Record<string, RequestBody | Reference>;
  headers?: Record<string, Header | Reference>;
  securitySchemes?: Record<string, SecurityScheme | Reference>;
  links?: Record<string, Link | Reference>;
  callbacks?: Record<string, Callbacks | Reference>;
  pathItems?: Record<string, PathItem>;
  mediaTypes?: Record<string, MediaType | Reference>;
};

export type PathItem = {
  $ref?: string;
  summary?: string;
  description?: string;
  additionalOperations?: Record<string, Operation>;
  servers?: Server[];
  parameters?: (Parameter | Reference)[];
} & Partial<Record<HttpMethod, Operation>>;

export type Operation = {
  tags?: string[];
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocs;
  operationId?: string;
  parameters?: (Parameter | Reference)[];
  requestBody?: RequestBody | Reference;
  responses?: Responses;
  callbacks?: Record<string, Callbacks | Reference>;
  deprecated?: boolean;
  security?: SecurityRequirement[];
  servers?: Server[];
};

export type Parameter = {
  /** Required */
  name?: string;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
} & Examples &
  (
    | ({
        in: typeof ParameterIn.path;
        /** Required */
        required?: true;
      } & (
        | ({
            style?:
              | typeof ParameterStyle.matrix
              | typeof ParameterStyle.label
              | typeof ParameterStyle.simple;
          } & SchemaParameter)
        | ContentParameter
      ))
    | ({
        in: typeof ParameterIn.query;
        allowEmptyValue?: boolean;
      } & (
        | ({
            style?:
              | typeof ParameterStyle.form
              | typeof ParameterStyle.spaceDelimited
              | typeof ParameterStyle.pipeDelimited
              | typeof ParameterStyle.deepObject;
          } & SchemaParameter)
        | ContentParameter
      ))
    | ({
        in: typeof ParameterIn.header;
      } & (
        | ({ style?: typeof ParameterStyle.simple } & SchemaParameter)
        | ContentParameter
      ))
    | ({
        in: typeof ParameterIn.cookie;
      } & (
        | ({ style?: typeof ParameterStyle.cookie } & SchemaParameter)
        | ContentParameter
      ))
    | ({ in: typeof ParameterIn.querystring } & ContentParameter)
    | { in?: never }
  );

export type ContentParameter = {
  schema?: never;
  /** Required */
  content?: Record<string, MediaType | Reference>;
};

export type SchemaParameter = {
  explode?: boolean;
  allowReserved?: boolean;
  /** Required */
  schema?: Schema;
  content?: never;
};

export type RequestBody = {
  description?: string;
  /** Required */
  content?: Record<string, MediaType | Reference>;
  required?: boolean;
};

export type MediaType = {
  schema?: Schema;
  itemSchema?: Schema;
} & Examples &
  (
    | {
        encoding?: Record<string, Encoding>;
        prefixEncoding?: never;
        itemEncoding?: never;
      }
    | {
        encoding?: never;
        prefixEncoding?: Encoding[];
        itemEncoding?: Encoding;
      }
  );

export type Encoding = {
  contentType?: string;
  headers?: Record<string, Header | Reference>;
  style?:
    | typeof ParameterStyle.form
    | typeof ParameterStyle.spaceDelimited
    | typeof ParameterStyle.pipeDelimited
    | typeof ParameterStyle.deepObject;
  explode?: boolean;
  allowReserved?: boolean;
} & (
  | {
      encoding?: Record<string, Encoding>;
      prefixEncoding?: never;
      itemEncoding?: never;
    }
  | {
      encoding?: never;
      prefixEncoding?: Encoding[];
      itemEncoding?: Encoding;
    }
);

export type Responses = {
  default?: Response | Reference;
  "1XX"?: Response | Reference;
  "2XX"?: Response | Reference;
  "3XX"?: Response | Reference;
  "4XX"?: Response | Reference;
  "5XX"?: Response | Reference;
} & Record<`${number}`, Response | Reference>;

export type Response = {
  summary?: string;
  description?: string;
  headers?: Record<string, Header | Reference>;
  content?: Record<string, MediaType | Reference>;
  links?: Record<string, Link | Reference>;
};

export type Callbacks = Record<string, PathItem | Reference>;

export type Examples = {
  example?: Json;
  examples?: Record<string, Example | Reference>;
};

export type Example = {
  summary?: string;
  description?: string;
} & (
  | {
      value?: Json;
      dataValue?: never;
      serializedValue?: never;
      externalValue?: never;
    }
  | {
      dataValue?: Json;
      serializedValue?: string;
      value?: never;
      externalValue?: never;
    }
  | {
      dataValue?: Json;
      externalValue?: string;
      value?: never;
      serializedValue?: never;
    }
);

export type Link = {
  operationRef?: string;
  operationId?: string;
  parameters?: Record<string, string | Json>;
  requestBody?: string | Json;
  description?: string;
  server?: Server;
};

export type Header = {
  description?: string;
  required?: boolean;
  deprecated?: boolean;
} & Examples &
  (
    | {
        style?: typeof ParameterStyle.simple;
        explode?: boolean;
        /** Required */
        schema?: Schema;
        content?: never;
      }
    | {
        schema?: never;
        /** Required */
        content?: Record<string, MediaType | Reference>;
      }
  );

export type Tag = {
  /** Required */
  name?: string;
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocs;
  parent?: string;
  kind?: "nav" | "badge" | "audience" | (string & {});
};

export type Reference = {
  /** Required */
  $ref?: string;
  summary?: string;
  description?: string;
};

export type SecurityScheme = { description?: string; deprecated?: boolean } & (
  | {
      type: typeof SecuritySchemeType.apiKey;
      /** Required */
      name?: string;
      /** Required */
      in?:
        | typeof ParameterIn.query
        | typeof ParameterIn.header
        | typeof ParameterIn.cookie;
    }
  | {
      type: typeof SecuritySchemeType.http;
      /** Required */
      scheme?: string;
      bearerFormat?: string;
    }
  | {
      type: typeof SecuritySchemeType.mutualTLS;
    }
  | {
      type: typeof SecuritySchemeType.oauth2;
      /** Required */
      flows?: OauthFlows;
      oauth2MetadataUrl?: string;
    }
  | {
      type: typeof SecuritySchemeType.openIdConnect;
      /** Required */
      openIdConnectUrl?: string;
    }
  | { type?: never }
);

export type OauthFlows = {
  implicit?: Omit<OauthFlow, "tokenUrl"> & {
    /** Required */
    authorizationUrl?: string;
  };
  password?: OauthFlow;
  clientCredentials?: OauthFlow;
  authorizationCode?: OauthFlow & {
    /** Required */
    authorizationUrl?: string;
  };
  deviceAuthorization?: OauthFlow & {
    /** Required */
    deviceAuthorizationUrl?: string;
  };
};

export type OauthFlow = {
  refreshUrl?: string;
  /** Required */
  scopes?: Record<string, string>;
  /** Required */
  tokenUrl?: string;
};

export type SecurityRequirement = Record<string, string[]>;
