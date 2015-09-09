## Chill with this REST-only CMS

> You provide the site, the CMS provides data storage and authentication

##### Limitations of the first release:
- No private content, which would only be accessible to authenticated users.
- No file uploads. They should be hosted elsewhere for now.
- Authentication is done via cookies


##### General limitations:
- No server side validation.
  - This means only trusted users can perform write operations. Site visitors cannot trigger an action that would add records to the database.


##### Implementation checklist:
- [x] Serve ./public/ as static files, this is your site.


- [x] Enter Installation mode if ./chill-database.json's admin array is empty.


- [x] When in installation mode, /setup becomes available to browsers
  - [x] A web UI provided by the CMS lets the user create an admin account.
  - [x] Credentials stored in ./chill-database.json which is not API accessible.
  - [x] Installation mode is then disabled.


- [x] GET /chill/status, returns info about the server, including whether the user is authenticated. Unauthenticated users may only perform GET requests.


- [x] /login lets the user start a session. The site's dashboard should redirect users here first to make sure they have write access.


- [x] Save and read content via a REST API
 - [x] GET /api/cars, GET /api/cars/3
   - Gets all cars or one with a specific `id`
 - [x] POST /api/cars
   - Add an object to the cars array
   - `cars` array is created on the fly if not found
   - Error on `id` conflict
   - Generates `id` if missing
 - [x] PUT /api/cars
   - Replace existing car, error if `id` not found
 - [x] DELETE /api/cars/3
   - Remove specific car from array, error if not found


