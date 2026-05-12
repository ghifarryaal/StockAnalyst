migrate((db) => {
  const dao = new Dao(db);

  const collections = [
    {
      "name": "users",
      "type": "auth",
      "system": true,
      "schema": [
        { "name": "full_name", "type": "text" },
        { "name": "role", "type": "select", "options": { "values": ["user", "educator", "admin"] } },
        { "name": "is_verified", "type": "bool" },
        { "name": "is_banned", "type": "bool" }
      ],
      "listRule": "id = @request.auth.id || @request.auth.role = 'admin'",
      "viewRule": "id = @request.auth.id || @request.auth.role = 'admin'",
      "createRule": "",
      "updateRule": "id = @request.auth.id",
      "deleteRule": "id = @request.auth.id",
      "options": { "allowOAuth2Auth": true, "allowUsernameAuth": true, "allowEmailAuth": true, "minPasswordLength": 8 }
    },
    {
      "name": "stock_analysis_cache",
      "type": "base",
      "schema": [
        { "name": "ticker", "type": "text", "required": true },
        { "name": "analysis_text", "type": "editor", "required": true },
        { "name": "expires_at", "type": "date", "required": true }
      ],
      "listRule": "",
      "viewRule": "",
      "createRule": "@request.auth.id != ''",
      "updateRule": "@request.auth.role = 'admin'",
      "deleteRule": "@request.auth.role = 'admin'"
    },
    {
      "name": "education_posts",
      "type": "base",
      "schema": [
        { "name": "educator", "type": "relation", "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 }, "required": true },
        { "name": "title", "type": "text", "required": true },
        { "name": "ticker", "type": "text" },
        { "name": "category", "type": "select", "options": { "values": ["sentiment", "news", "fundamental", "technical"] } },
        { "name": "content", "type": "text", "required": true },
        { "name": "reference_links", "type": "json" },
        { "name": "likes_count", "type": "number", "default": 0 },
        { "name": "dislikes_count", "type": "number", "default": 0 },
        { "name": "is_deleted", "type": "bool", "default": false }
      ],
      "listRule": "is_deleted = false",
      "viewRule": "is_deleted = false",
      "createRule": "@request.auth.role = 'educator' || @request.auth.role = 'admin'",
      "updateRule": "educator = @request.auth.id || @request.auth.role = 'admin'",
      "deleteRule": "@request.auth.role = 'admin'"
    },
    {
      "name": "educator_profiles",
      "type": "base",
      "schema": [
        { "name": "educator", "type": "relation", "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 }, "required": true },
        { "name": "certificate_number", "type": "text" },
        { "name": "verification_status", "type": "select", "options": { "values": ["pending", "approved", "rejected"] }, "default": "pending" }
      ],
      "listRule": "@request.auth.id != ''",
      "viewRule": "@request.auth.id != ''",
      "createRule": "@request.auth.id != ''",
      "updateRule": "@request.auth.role = 'admin'",
      "deleteRule": "@request.auth.role = 'admin'"
    },
    {
      "name": "post_reactions",
      "type": "base",
      "schema": [
        { "name": "post", "type": "relation", "options": { "collectionId": "education_posts", "maxSelect": 1 }, "required": true },
        { "name": "user", "type": "relation", "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 }, "required": true },
        { "name": "reaction_type", "type": "select", "options": { "values": ["like", "dislike"] } }
      ],
      "listRule": "@request.auth.id != ''",
      "viewRule": "@request.auth.id != ''",
      "createRule": "@request.auth.id != ''",
      "updateRule": "user = @request.auth.id",
      "deleteRule": "user = @request.auth.id"
    },
    {
      "name": "post_reports",
      "type": "base",
      "schema": [
        { "name": "post", "type": "relation", "options": { "collectionId": "education_posts", "maxSelect": 1 }, "required": true },
        { "name": "reporter", "type": "relation", "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 }, "required": true },
        { "name": "reason", "type": "text", "required": true },
        { "name": "status", "type": "select", "options": { "values": ["pending", "reviewed", "dismissed"] }, "default": "pending" }
      ],
      "listRule": "@request.auth.role = 'admin'",
      "viewRule": "@request.auth.role = 'admin'",
      "createRule": "@request.auth.id != ''",
      "updateRule": "@request.auth.role = 'admin'",
      "deleteRule": "@request.auth.role = 'admin'"
    },
    {
      "name": "ai_usage",
      "type": "base",
      "schema": [
        { "name": "user", "type": "relation", "options": { "collectionId": "_pb_users_auth_", "maxSelect": 1 }, "required": true },
        { "name": "usage_date", "type": "text", "required": true },
        { "name": "prompt_count", "type": "number", "default": 0 },
        { "name": "last_prompt_at", "type": "date" }
      ],
      "listRule": "user = @request.auth.id || @request.auth.role = 'admin'",
      "viewRule": "user = @request.auth.id || @request.auth.role = 'admin'",
      "createRule": "@request.auth.id != ''",
      "updateRule": "user = @request.auth.id || @request.auth.role = 'admin'",
      "deleteRule": "@request.auth.role = 'admin'"
    }
  ];

  for (const item of collections) {
    try {
      let collection;
      try {
        collection = dao.findCollectionByNameOrId(item.name);
      } catch (e) {
        collection = new Collection();
      }

      collection.name = item.name;
      collection.type = item.type;
      collection.system = item.system || false;
      collection.schema = item.schema;
      collection.listRule = item.listRule;
      collection.viewRule = item.viewRule;
      collection.createRule = item.createRule;
      collection.updateRule = item.updateRule;
      collection.deleteRule = item.deleteRule;
      
      if (item.options) {
        collection.options = item.options;
      }

      dao.saveCollection(collection);
    } catch (e) {
      console.log("Collection " + item.name + " failed: " + e.message);
    }
  }
}, (db) => {
  // Undo
})
