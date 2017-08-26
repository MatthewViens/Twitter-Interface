# Twitter Interface

This Express application reads a Twitter user's API credentials from config.js and imports the configuration into the Twit module. The application uses Twit to request the users five most recent Tweets, five most recently followed users, and five most recent direct messages using the Twitter API. Access level must be: Read, write, and direct messages. The app uses the Moment module to display times and views are rendered using Pug.

The application renders an error page for undeclared routes (404) or if there was an issue getting/posting from the Twitter API (500).

The application footer contains a space to post a tweet. Tweet post requests will only be sent if the field is not blank and the length is less than 140 characters. The application utilizes Socket.IO to complete the post request without requiring a page refresh/redirect and a representation of the new tweet is appended to the timeline display with Javascript.

## How To Use

Input your Twitter API information into the sample_config.js file and rename
to config.js

```npm install```

```npm start```

Then navigate your favorite web brower to localhost:3000

## Built With

* Javascript
* Node JS
* [Express](https://github.com/expressjs/express)
* [Pug](https://github.com/pugjs/pug)
* [Socket.IO](https://github.com/socketio/socket.io)
* [Twit](https://github.com/ttezel/twit)
* [Moment](https://github.com/moment/moment)

## Acknowledgments

* [Team Treehouse](https://teamtreehouse.com)
