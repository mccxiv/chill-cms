# Chill, zero config REST server with user management
> A zero configuration API only, REST only CMS

##### Current Status
Lacks many features including search and filtering, do it on the client instead.  
Obviously this means the current version of chill is not suitable for anything bigger than a small personal site.

---

For those of us that have realized websites are applications, not documents.  
Chill is a more opinionated version of [json-server](https://github.com/typicode/json-server).

##### Install it using npm
```
npm install chill-cms -g
```

##### Use it
Execute `chill-cms`.
> Chill will serve the `./public` directory and create the user and content databases, as plain JSON files. Place your website inside of the `./public` directory.

GET, POST and PUT json objects to `/api/:resource`
> Replace `:resource` with whatever name you wish. There is no schema to worry about, all objects are saved to an array. Make sure POST and PUT actions send raw json in the request body. 

>Ids are always saved as strings to avoid confusion. The `id` property will be generated if missing.

GET and DELETE to `/api/:resource/:id`
> Replace `:resource` with the resource name and `:id` with the identifier

##### User management
POST, PUT and DELETE require the user to be logged in as an admin.

GET `/chill/status`
> Tells you if a user is logged in as an admin.

If needed, redirect users to `/login`.
> They will come back to the same URL but this time logged in.





##### What you get
- A REST endpoint. Create, read, update and delete any JSON object
  - All clients have read access
  - Only logged in clients have write access


- Redirect users to /login and they'll come back authenticated

##### What you don't get
- Admin dashboard and content editor
  - That's up to you, just save content to the server using the API

##### Do I need to learn a complex JavaScript framework?
No, jQuery's ajax functions are enough to save and read data.

##### Is this only for single page apps?
No, you can use a collection of .html files that link to each other, if you prefer.

##### Why use this over say Wordpress?
- No need to write server side code.
- Add all the custom fields you want to your editor.
- Not locked into a brand. Your very same site could run on similar implementations.
- Use the same server for web, desktop and mobile apps.

##### Limitations of the first release:
- No private content, which would only be accessible to authenticated users.
- No file uploads. They should be hosted elsewhere for now.
- Authentication is done via cookies
- No server side validation.
  - This means only trusted users can perform write operations. Site visitors cannot trigger an action that would add records to the database.


At the end of the day Chill is just an API, your site will be easily ported when someone decides to write an alternative Chill-compatible server.