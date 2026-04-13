export const IDL = {
  address: "85nd28UHwfBzDcA9fRcCFjSGvdvvns7u7yxjcwVjuzpK",
  metadata: {
    name: "shadowpay",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "deregister_service",
      discriminator: [27, 239, 41, 242, 247, 40, 85, 63],
      accounts: [
        {
          name: "service",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [115, 101, 114, 118, 105, 99, 101] },
              { kind: "account", path: "owner" },
              { kind: "arg", path: "args.service_id" },
            ],
          },
        },
        { name: "owner", signer: true, relations: ["service"] },
      ],
      args: [
        { name: "args", type: { defined: { name: "DeregisterServiceArgs" } } },
      ],
    },
    {
      name: "initialize",
      discriminator: [175, 175, 109, 31, 13, 152, 155, 237],
      accounts: [],
      args: [],
    },
    {
      name: "register_agent",
      discriminator: [135, 157, 66, 195, 2, 113, 175, 30],
      accounts: [
        {
          name: "agent",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [97, 103, 101, 110, 116] },
              { kind: "account", path: "owner" },
            ],
          },
        },
        { name: "owner", writable: true, signer: true },
        { name: "system_program", address: "11111111111111111111111111111111" },
      ],
      args: [
        { name: "args", type: { defined: { name: "RegisterAgentArgs" } } },
      ],
    },
    {
      name: "register_service",
      discriminator: [11, 133, 158, 232, 193, 19, 229, 73],
      accounts: [
        {
          name: "service",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [115, 101, 114, 118, 105, 99, 101] },
              { kind: "account", path: "owner" },
              { kind: "arg", path: "args.service_id" },
            ],
          },
        },
        { name: "owner", writable: true, signer: true },
        { name: "system_program", address: "11111111111111111111111111111111" },
      ],
      args: [
        {
          name: "args",
          type: { defined: { name: "RegisterServiceArgs" } },
        },
      ],
    },
    {
      name: "update_service",
      discriminator: [46, 169, 26, 33, 191, 78, 40, 221],
      accounts: [
        {
          name: "service",
          writable: true,
          pda: {
            seeds: [
              { kind: "const", value: [115, 101, 114, 118, 105, 99, 101] },
              { kind: "account", path: "owner" },
              { kind: "arg", path: "args.service_id" },
            ],
          },
        },
        { name: "owner", signer: true, relations: ["service"] },
      ],
      args: [
        { name: "args", type: { defined: { name: "UpdateServiceArgs" } } },
      ],
    },
  ],
  accounts: [
    {
      name: "AgentAccount",
      discriminator: [241, 119, 69, 140, 233, 9, 112, 50],
    },
    {
      name: "ServiceAccount",
      discriminator: [72, 33, 73, 146, 208, 186, 107, 192],
    },
  ],
  errors: [
    { code: 6000, name: "ServiceIdEmpty", msg: "Service ID must not be empty" },
    {
      code: 6001,
      name: "ServiceIdTooLong",
      msg: "Service ID exceeds maximum length of 64 characters",
    },
    { code: 6002, name: "EndpointEmpty", msg: "Endpoint must not be empty" },
    {
      code: 6003,
      name: "EndpointTooLong",
      msg: "Endpoint exceeds maximum length of 256 characters",
    },
    {
      code: 6004,
      name: "DescriptionTooLong",
      msg: "Description exceeds maximum length of 256 characters",
    },
    {
      code: 6005,
      name: "AgentNameEmpty",
      msg: "Agent name must not be empty",
    },
    {
      code: 6006,
      name: "AgentNameTooLong",
      msg: "Agent name exceeds maximum length of 64 characters",
    },
    {
      code: 6007,
      name: "Unauthorized",
      msg: "Only the owner can perform this action",
    },
    { code: 6008, name: "ServiceInactive", msg: "Service is not active" },
    {
      code: 6009,
      name: "InvalidPrice",
      msg: "Price must be greater than zero",
    },
  ],
  types: [
    {
      name: "AgentAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "pubkey" },
          { name: "name", type: "string" },
          { name: "active", type: "bool" },
          { name: "total_payments", type: "u64" },
          { name: "created_at", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "DeregisterServiceArgs",
      type: {
        kind: "struct",
        fields: [{ name: "service_id", type: "string" }],
      },
    },
    {
      name: "RegisterAgentArgs",
      type: {
        kind: "struct",
        fields: [{ name: "name", type: "string" }],
      },
    },
    {
      name: "RegisterServiceArgs",
      type: {
        kind: "struct",
        fields: [
          { name: "service_id", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "price_lamports", type: "u64" },
          { name: "token_mint", type: "pubkey" },
          { name: "description", type: "string" },
        ],
      },
    },
    {
      name: "ServiceAccount",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "pubkey" },
          { name: "service_id", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "price_lamports", type: "u64" },
          { name: "token_mint", type: "pubkey" },
          { name: "description", type: "string" },
          { name: "active", type: "bool" },
          { name: "created_at", type: "i64" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "UpdateServiceArgs",
      type: {
        kind: "struct",
        fields: [
          { name: "service_id", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "price_lamports", type: "u64" },
          { name: "description", type: "string" },
          { name: "active", type: "bool" },
        ],
      },
    },
  ],
} as const;
