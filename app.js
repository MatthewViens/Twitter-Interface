const express = require('express');
const twit = require('twit');
const moment = require('moment');
moment().format();
const config = require('./config');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'pug');

const user = new twit(config);

async function getTwitterInfo(){
  const info = {};
  info.timeline = [];
  info.friends = [];
  info.messages = [];
  let userData = await user.get('account/verify_credentials', {skip_status: true});
  userData = userData.data;
  info.name = userData.name;
  info.username = userData.screen_name;
  info.avatar = (userData.profile_image_url).replace('_normal', '');
  info.friendsCount = userData.friends_count;
  info.banner = userData.profile_banner_url;
  timelineData = await user.get('statuses/user_timeline', {screen_name: info.username, count: 5});
  timelineData = timelineData.data;
  for (let i = 0; i < timelineData.length; i++){
    let tweet = {};
    if(timelineData[i].retweeted_status) {
      tweet.text = timelineData[i].retweeted_status.text;
      tweet.avatar = (timelineData[i].retweeted_status.user.profile_image_url).replace('_normal', '');
      tweet.name = timelineData[i].retweeted_status.user.name;
      tweet.username = timelineData[i].retweeted_status.user.screen_name;
      if(timelineData[i].retweeted_status.entities.media){
        tweet.media = timelineData[i].retweeted_status.entities.media[0].media_url;
      }
      tweet.retweets = timelineData[i].retweeted_status.retweet_count;
      tweet.favorites = timelineData[i].retweeted_status.favorite_count;
      tweet.created_at = moment(timelineData[i].retweeted_status.created_at, 'ddd MMM DD HH:mm:ss Z YYYY').fromNow();
    } else {
      tweet.text = timelineData[i].text;
      tweet.avatar = info.avatar;
      tweet.name = info.name;
      tweet.username = info.username;
      if(timelineData[i].entities.media){
        tweet.media = timelineData[i].entities.media[0].media_url;
      }
      tweet.retweets = timelineData[i].retweet_count;
      tweet.favorites = timelineData[i].favorite_count;
      tweet.created_at = moment(timelineData[i].created_at, 'ddd MMM DD HH:mm:ss Z YYYY').fromNow();
    }
    info.timeline.push(tweet);
  }
  let friendsData = await user.get('friends/list', {skip_status: true, screen_name: info.username, count: 5});
  friendsData = friendsData.data.users;
  for(let i = 0; i < friendsData.length; i++){
    let friend = {};
    friend.name = friendsData[i].name;
    friend.username = friendsData[i].screen_name;
    friend.avatar = friendsData[i].profile_image_url.replace('_normal', '');
    info.friends.push(friend);
  }
  let messageData = await user.get('direct_messages', {count: 5});
  messageData = messageData.data;
  for(let i = 0; i < messageData.length; i++){
    let message = {};
    message.avatar = messageData[i].sender.profile_image_url.replace('_normal',  '');
    message.name = messageData[i].sender.name;
    message.text = messageData[i].text;
    message.created_at = messageData[i].created_at;
    message.created_at = moment(messageData[i].created_at, 'ddd MMM DD HH:mm:ss Z YYYY').fromNow()
    info.messages.push(message);
  }
  return info;
}

app.get('/', (req, res) => {
  getTwitterInfo().then(info => {
    res.render('index', {info: info})
  });
});

app.listen(3000, () => {
  console.log('Application running on port:3000');
});
