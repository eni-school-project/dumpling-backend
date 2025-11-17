# End-of-year M1 Project

A somewhat confusing project because the topic was somewhere between a traditional DBMS and a database backup/restore system.

This repo contains the backend part of the second option.

> [!WARNING]
> Before you do anything, remember to create a `.env` file that should contain these variables :
>
> ```toml
> NITRO_JWT_SECRET="32-characters-lenght"
> NITRO_DATABASE_CREDENTIALS="postgres://user:password@host:port/database" # main database connection URL
> ```

## Sequelize

The models are stored in `server/utils/models`

There are 2 sequelize instances that will be used in the app :

- the main one, used for the server's database
- the one used to communicate with other databases

They can be initialized using two helper functions that are respectively :

- `useDatabase()`, in `server/utils/database.ts`
- `useSequelize(credentials: ConnectionCredentials)`, in `server/utils/sequelize.ts`

Both their initialization should throw an error like this if they fail (likely because of wrong credentials or an unavailable database) :

```typescript
throw createError({
  statusCode: 500,
  statusMessage: 'Server error',
  message: 'Couldn\'t connect to database',
  fatal: true, // only for the main database
});
```

## Server Routes

### Plain ones

1. `/`

    Located in `server/routes/`

    If you use the `GET` method it should return a web page with :

    ```text
    一═┳︻__/(¯ . ¯٥)
    ```

    And if you use `POST` :

    ```text
    ┬┴┤(･_├┬┴┬┴┬┴┬┴┬┴┬┴
    ```

    There's also a catch-all route `server/routes/[...].ts`, that will send you back to `/` if you write non-sense as a route

### API

> [!NOTE]
> All of the api routes are prefixed by `/api/`.

1. `GET /connections`

    Returns the lists of all the connections in an array

2. `POST /connections`

    Creates a new connection and returns it to the client as a proof of the success

    The request body should be :

    ```json
    {
      "connectionName": "string",
      "connectionType": "mysql | postgres",
      "host": "string",
      "port?": "number",
      "user": "string",
      "password": "string",
      "database?": "string",
    }
    ```

> [!NOTE]
> The properties not having `?` in their names are required.

3. `GET /connections/[id_or_name]`

    Returns the wanted connection by searching it through `connection_id` or `connection_name`

    Will throw a `404` error if not found :

    ```typescript
    throw createError({
      statusCode: 404,
      statusMessage: 'Client error',
      message: 'Connection not found'
    });
    ```

4. `PUT /connections/[id]`

    Edits the wanted connection by searching it through `connection_id` and returns it if it works

    The request body should be :

    ```json
    {
      "connectionName": "string",
      "connectionType": "mysql | postgres",
      "host": "string",
      "port?": "number",
      "user": "string",
      "password": "string",
      "database?": "string",
    }
    ```

5. `DELETE /connections/[id]`

    Deletes the wanted connection by searching it through `connection_id` and I can't remember what it returns it if it works

6. `GET /connections/[id]/test`

    Tests the wanted connection using the `useSequelize()` function, by searching it through `connection_id` and if it works, returns :

    ```json
    {
      "success": true
    }
    ```

    If it doesn't, it will throw :

    ```typescript
    throw createError({
      statusCode: 400,
      statusMessage: 'Client error',
      message: 'Invalid connection ID',
    });
    ```

7. `PATCH /connections/[id]/password`

    Edits the password of the wanted connection by searching it through `connection_id`

    If it works it will return the edited connection

    And if the password is incorrect, i don't remember what it returns

    The request body should be :

    ```json
    {
      "oldPassword": "string",
      "newPassword": "string"
    }
    ```

    Whatever else, it will throw :

    ```typescript
    throw createError({
      statusCode: 400,
      statusMessage: 'Client error',
      message: 'Invalid connection ID',
    });
    ```
