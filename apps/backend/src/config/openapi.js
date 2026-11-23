import { env } from "./env.js";

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Food Delivery Platform API",
    version: "1.0.0",
    description:
      "Node.js + Express backend following the 15-Day Advanced Food Delivery Roadmap",
  },
  servers: [
    { url: `http://localhost:${env.PORT}`, description: "Local server" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        responses: { 200: { description: "Service is healthy" } },
      },
    },
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "Rahul Sharma" },
                  email: {
                    type: "string",
                    format: "email",
                    example: "rahul@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 6,
                    example: "password123",
                  },
                  role: {
                    type: "string",
                    enum: ["customer", "restaurant_owner", "rider"],
                    default: "customer",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered" },
          400: { description: "Validation error" },
          409: { description: "Email already exists" },
        },
      },
    },
    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get authenticated user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "User profile" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/v1/restaurants": {
      get: {
        tags: ["Restaurants"],
        summary: "List restaurants with optional filters",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "cuisine", in: "query", schema: { type: "string" } },
        ],
        responses: { 200: { description: "List of restaurants" } },
      },
      post: {
        tags: ["Restaurants"],
        summary: "Create restaurant (restaurant_owner or admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "cuisine"],
                properties: {
                  name: { type: "string", example: "Chappan Bites" },
                  cuisine: {
                    type: "array",
                    items: { type: "string" },
                    example: ["North Indian"],
                  },
                  city: { type: "string", example: "Indore" },
                  avgCostForTwo: { type: "number", example: 350 },
                  deliveryTimeMins: { type: "integer", example: 25 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Restaurant created" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/v1/restaurants/{id}": {
      get: {
        tags: ["Restaurants"],
        summary: "Get restaurant by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Restaurant details" },
          404: { description: "Not found" },
        },
      },
    },
  },
};
