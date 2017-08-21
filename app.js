const express = require('express');
const twit = require('twit');
const moment = require('moment');
moment().format();
const config = require('./config');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'pug');

const user = new twit(config);

app.use((req, res, next)=> {
  user.get('account/verify_credentials', {skip_status: true})
    .then((result)=> {
      let userData = {};
      result = result.data;
      userData.username = result.screen_name;
      userData.name = result.name;
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

app.use((req, res, next)=> {
  user.get('statuses/user_timeline', {screen_name: req.userData.username, count: 5})
    .then((result)=> {
      let timelineData = [];
      for(let i = 0; i < result.data.length; i++){
        let current = result.data[i];
        let tweet = {};

        if (current.retweeted_status) { current = current.retweeted_status }

        tweet.text = current.text;
        tweet.avatarURL = current.user.profile_image_url.replace('_normal', '');
        tweet.name = current.user.name;
        tweet.username = current.user.screen_name;
        tweet.retweets = current.retweet_count;
        tweet.favorites  = current.favorite_count;
        tweet.created_at = moment(current.created_at, 'ddd MMM DD HH:mm:ss Z YYYY').fromNow();
        if (current.entities.media) {
          tweet.media = current.entities.media[0].media_url;
        }
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

app.get('/', (req, res) => {
  res.render('index', {
    userData: req.userData,
    timelineData: req.timelineData,
    friendsData: req.friendsData,
    messageData: req.messageData
  });
});

app.use((req, res, next)=> {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
})

app.use((err, req, res, next)=> {
  res.locals.error = err;
  res.status(err.status);
  res.render('error', err);
});

app.listen(3000, () => {
  console.log('Application running on port:3000');
});
