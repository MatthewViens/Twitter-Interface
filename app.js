/*---------------------------------------------------------
Require application dependencies
---------------------------------------------------------*/

const express = require('express'),
      twit    = require('twit'),
      moment  = require('moment'),
      config  = require('./config');

/*-------------------------------------------------------------------
Use set up server for Socket.IO
-------------------------------------------------------------------*/

const app     = express(),
      server  = require('http').Server(app),
      io      = require('socket.io').listen(server);

app.use(express.static('public'));

app.set('view engine', 'pug');

/*-------------------------------------------------------------------
Create a new instance of Twit with API credentials from  config.js
-------------------------------------------------------------------*/

const user = new twit(config);

/*-------------------------------------------------------------------
Express Middleware
-------------------------------------------------------------------*/

// Use Twit to get account credentials
app.use((req, res, next)=> {
  user.get('account/verify_credentials', {skip_status: true})
    .then((result)=> {
      let userData = {};
      result = result.data;
      userData.username = result.screen_name;
      userData.name = result.name;
      // Remove '.normal' from url in order to request original image instead
      // of smaller version for profile avatar
      userData.avatarURL = result.profile_image_url.replace('_normal', '');
      userData.bannerURL = result.profile_banner_url;
      userData.friendsCount = result.friends_count;
      req.userData = userData;
      next();
    })
    .catch((err)=> {
      err.message = 'There was a problem getting your account information';
      err.status = 500;
      next(err);
    });
});

// Use Twit to get account timeline
app.use((req, res, next)=> {
  user.get('statuses/user_timeline', {screen_name: req.userData.username, count: 5})
    .then((result)=> {
      let timelineData = [];
      for(let i = 0; i < result.data.length; i++){
        let current = result.data[i];
        let tweet = {};
        // If item is a retweet, get  information from retweeted_status instead.
        if (current.retweeted_status) current = current.retweeted_status;
        tweet.text = current.text;
        tweet.avatarURL = current.user.profile_image_url.replace('_normal', '');
        tweet.name = current.user.name;
        tweet.username = current.user.screen_name;
        tweet.retweets = current.retweet_count;
        tweet.favorites  = current.favorite_count;
        tweet.created_at = moment(current.created_at, 'ddd MMM DD HH:mm:ss Z YYYY').fromNow();
        // If item contains media, store it
        if (current.entities.media) tweet.media = current.entities.media[0].media_url;
        timelineData.push(tweet);
      }
      req.timelineData = timelineData;
      next();
    })
    .catch((err)=> {
      err.message = 'There was a problem getting your timeline information';
      err.status = 500;
      next(err);
    });
});

// Use Twit to get account friends list
app.use((req, res, next)=> {
  user.get('friends/list', {skip_status: true, screen_name: req.userData.username, count: 5})
    .then((result)=> {
      let friendsData = [];
      for(let i = 0; i < result.data.users.length; i++){
        let current = result.data.users[i];
        let friend = {};
        friend.name = current.name;
        friend.username = current.screen_name;
        friend.avatarURL = current.profile_image_url.replace('_normal', '');
        friendsData.push(friend);
      }
      req.friendsData = friendsData;
      next();
    })
    .catch((err)=> {
      err.message = 'There was a problem getting your friends list data';
      err.status = 500;
      next(err);
    });
});

// Use Twit to get account direct_messages
app.use((req, res, next)=> {
  user.get('direct_messages', {count: 5})
    .then((result)=> {
      let messageData = [];

      for(let i = 0; i < result.data.length; i++){
        let current = result.data[i];
        let message = {};
        message.avatarURL = current.sender.profile_image_url.replace('_normal',  '');
        message.name = current.sender.name;
        message.text = current.text;
        message.created_at = moment(current.created_at, 'ddd MMM DD HH:mm:ss Z YYYY').fromNow();
        messageData.push(message);
      }
      req.messageData = messageData;
      next();
    })
    .catch((err)=> {
      err.message = 'There was a problem getting your messages information';
      err.status = 500;
      next(err);
    });
});

/*-------------------------------------------------------------------
Root route
- Pass in data from middleware.
- Use Socket.IO to pass user data to client on response.
- Use Socket.IO listen for 'tweet' event from client and then
  use Twit to post tweet text for account.
-------------------------------------------------------------------*/
app.get('/', (req, res) => {
  res.render('index', {
    userData: req.userData,
    timelineData: req.timelineData,
    friendsData: req.friendsData,
    messageData: req.messageData
  });
  io.on('connection', (socket)=> {
    socket.emit('sendUserData', req.userData);
    socket.on('tweet', (text)=> {
      user.post('statuses/update', {status: text})
        .then((result)=>{
          io.emit('tweet', text);
        })
        .catch((err)=> {
          err.message = 'There was a problem posting to Twitter';
          err.status = 500;
          next(err);
        });
    });
  });
});

/*-------------------------------------------------------------------
Error handling routes
-------------------------------------------------------------------*/

app.use((req, res, next)=> {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next)=> {
  res.locals.error = err;
  res.status(err.status);
  res.render('error', err);
});

/*-------------------------------------------------------------------
Server listens on port 3000
-------------------------------------------------------------------*/

server.listen(3000, () => {
  console.log('Application running on port:3000');
});
