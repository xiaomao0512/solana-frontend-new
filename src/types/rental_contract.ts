// 這是暫時的 IDL 類型定義，實際使用時需要從 Anchor 生成的 IDL 檔案導入
export const IDL = {
  "version": "0.1.0",
  "name": "rental_contract",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "platform",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createListing",
      "accounts": [
        {
          "name": "listing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "platform",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "location",
          "type": "string"
        },
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "deposit",
          "type": "u64"
        },
        {
          "name": "size",
          "type": "u32"
        },
        {
          "name": "rooms",
          "type": "u8"
        },
        {
          "name": "bathrooms",
          "type": "u8"
        },
        {
          "name": "floor",
          "type": "u8"
        },
        {
          "name": "totalFloors",
          "type": "u8"
        },
        {
          "name": "contractLength",
          "type": "u8"
        },
        {
          "name": "moveInDate",
          "type": "i64"
        },
        {
          "name": "amenities",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "rentProperty",
      "accounts": [
        {
          "name": "rental",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "listing",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "platform",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "landlord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tenant",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "rentalId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "payRent",
      "accounts": [
        {
          "name": "rental",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "platform",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "landlord",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tenant",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "Platform",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "totalListings",
            "type": "u64"
          },
          {
            "name": "totalRentals",
            "type": "u64"
          },
          {
            "name": "totalVolume",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "Listing",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "location",
            "type": "string"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "deposit",
            "type": "u64"
          },
          {
            "name": "size",
            "type": "u32"
          },
          {
            "name": "rooms",
            "type": "u8"
          },
          {
            "name": "bathrooms",
            "type": "u8"
          },
          {
            "name": "floor",
            "type": "u8"
          },
          {
            "name": "totalFloors",
            "type": "u8"
          },
          {
            "name": "contractLength",
            "type": "u8"
          },
          {
            "name": "moveInDate",
            "type": "i64"
          },
          {
            "name": "amenities",
            "type": {
              "vec": "string"
            }
          },
          {
            "name": "isAvailable",
            "type": "bool"
          },
          {
            "name": "isVerified",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "Rental",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "rentalId",
            "type": "u64"
          },
          {
            "name": "listing",
            "type": "publicKey"
          },
          {
            "name": "landlord",
            "type": "publicKey"
          },
          {
            "name": "tenant",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "deposit",
            "type": "u64"
          },
          {
            "name": "contractLength",
            "type": "u8"
          },
          {
            "name": "startDate",
            "type": "i64"
          },
          {
            "name": "endDate",
            "type": "i64"
          },
          {
            "name": "nextPaymentDate",
            "type": "i64"
          },
          {
            "name": "status",
            "type": {
              "defined": "RentalStatus"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "updatedAt",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "RentalStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Terminated"
          },
          {
            "name": "Expired"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "PropertyNotAvailable",
      "msg": "房源不可用"
    },
    {
      "code": 6001,
      "name": "InsufficientFunds",
      "msg": "資金不足"
    },
    {
      "code": 6002,
      "name": "RentalNotActive",
      "msg": "租約未激活"
    },
    {
      "code": 6003,
      "name": "PaymentNotDue",
      "msg": "付款未到期"
    },
    {
      "code": 6004,
      "name": "Unauthorized",
      "msg": "未授權操作"
    }
  ]
}; 