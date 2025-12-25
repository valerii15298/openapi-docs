import type {
  Format,
  HttpMethod,
  JsonSchemaType,
  ParameterIn,
  ParameterStyle,
  SecuritySchemeType,
  TagKind,
  XMLNodeType,
} from "./enums.js";

export type {
  Format,
  HttpMethod,
  JsonSchemaType,
  ParameterIn,
  ParameterStyle,
  SecuritySchemeType,
  TagKind,
  XMLNodeType,
};

export type Json =
  | number
  | string
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export type Document = {
  /** Required */
  openapi?: "3.2" | `3.2.${number}`;
  $self?: string;
  /** Required */
  info?: Info;
  jsonSchemaDialect?: string;
  servers?: Server[];
  paths?: Paths;
  webhooks?: Record<string, PathItem>;
  components?: Components;
  security?: SecurityRequirement[];
  tags?: Tag[];
  externalDocs?: ExternalDocumentation;
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
  callbacks?: Record<string, Callback | Reference>;
  pathItems?: Record<string, PathItem>;
  mediaTypes?: Record<string, MediaType | Reference>;
};

export type Paths = Record<string, PathItem>;

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
  externalDocs?: ExternalDocumentation;
  operationId?: string;
  parameters?: (Parameter | Reference)[];
  requestBody?: RequestBody | Reference;
  responses?: Responses;
  callbacks?: Record<string, Callback | Reference>;
  deprecated?: boolean;
  security?: SecurityRequirement[];
  servers?: Server[];
};

export type ExternalDocumentation = {
  /** Required */
  url?: string;
  description?: string;
};

export type Parameter = {
  /** Required */
  name?: string;
  /** Required */
  in?: ParameterIn;
  description?: string;
  required?: boolean;
  deprecated?: boolean;
  allowEmptyValue?: boolean;
  example?: Json;
  examples?: Record<string, Example | Reference>;
} & (SchemaParameter | ContentParameter);

export type SchemaParameter = {
  style?: ParameterStyle;
  explode?: boolean;
  allowReserved?: boolean;
  /** Required */
  schema?: Schema;
  content?: never;
};

export type ContentParameter = {
  schema?: never;
  /** Required */
  content?: Record<string, MediaType | Reference>;
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
  example?: Json;
  examples?: Record<string, Example | Reference>;
  encoding?: Record<string, Encoding>;
  prefixEncoding?: Encoding[];
  itemEncoding?: Encoding;
};

export type Encoding = {
  contentType?: string;
  headers?: Record<string, Header | Reference>;
  encoding?: Record<string, Encoding>;
  prefixEncoding?: Encoding[];
  itemEncoding?: Encoding;
} & EncodingRFC6570;

export type EncodingRFC6570 = {
  style?:
    | typeof ParameterStyle.form
    | typeof ParameterStyle.spaceDelimited
    | typeof ParameterStyle.pipeDelimited
    | typeof ParameterStyle.deepObject;
  explode?: boolean;
  allowReserved?: boolean;
};

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

export type Callback = Record<string, PathItem>;

export type Example = {
  summary?: string;
  description?: string;
  dataValue?: Json;
  serializedValue?: string;
  externalValue?: string;
  value?: Json;
};

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
  example?: Json;
  examples?: Record<string, Example | Reference>;
} & (SchemaHeader | ContentHeader);

export type SchemaHeader = {
  style?: typeof ParameterStyle.simple;
  explode?: boolean;
  /** Required */
  schema?: Schema;
  content?: never;
};

export type ContentHeader = {
  schema?: never;
  /** Required */
  content?: Record<string, MediaType | Reference>;
};

export type Tag = {
  /** Required */
  name?: string;
  summary?: string;
  description?: string;
  externalDocs?: ExternalDocumentation;
  parent?: string;
  kind?: TagKind | (string & {});
};

export type Reference = {
  /** Required */
  $ref?: string;
  summary?: string;
  description?: string;
};

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
      externalDocs?: ExternalDocumentation;
      xml?: XML;
    };

export type Discriminator = {
  /** Required */
  propertyName?: string;
  mapping?: Record<string, string>;
  defaultMapping?: string;
};

export type XML = {
  nodeType?: XMLNodeType;
  name?: string;
  namespace?: string;
  prefix?: string;
  attribute?: boolean;
  wrapped?: boolean;
};

export type SecurityScheme = {
  description?: string;
  deprecated?: boolean;
  /** Required */
  type?: SecuritySchemeType;

  // ApiKey Security Scheme
  /** Required */
  name?: string;
  /** Required */
  in?:
    | typeof ParameterIn.query
    | typeof ParameterIn.header
    | typeof ParameterIn.cookie;

  // Http Security Scheme
  /** Required */
  scheme?: string;
  bearerFormat?: string;

  // OAuth2 Security Scheme
  /** Required */
  flows?: OAuthFlows;
  oauth2MetadataUrl?: string;

  // OpenID Connect Security Scheme
  /** Required */
  openIdConnectUrl?: string;
};

export type OAuthFlows = {
  implicit?: OAuthFlow;
  password?: OAuthFlow;
  clientCredentials?: OAuthFlow;
  authorizationCode?: OAuthFlow;
  deviceAuthorization?: OAuthFlow;
};

export type OAuthFlow = {
  authorizationUrl?: string;
  deviceAuthorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  /** Required */
  scopes?: Record<string, string>;
};

export type SecurityRequirement = Record<string, string[]>;
