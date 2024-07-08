const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
    '/',
    '../html/paymentAddCard.html',
    '../html/paymentOptions.html',
    '../resources/award.svg',
    '../resources/backArrow.svg',
    '../resources/battery-charging.svg',
    '../resources/card.svg',
    '../resources/clock.svg',
    '../resources/close.svg',
    '../resources/comments.svg',
    '../resources/createfolder.svg',
    '../resources/Discussion_Board.svg',
    '../resources/entrepreneurshipIcon.svg',
    '../resources/Friends.svg',
    '../resources/HeaderImage.svg',
    '../resources/headerImage2.png',
    '../resources/home.svg',
    '../resources/Icon1.svg',
    '../resources/Icon2.svg',
    '../resources/Icon3.svg',
    '../resources/Icon4.svg',
    '../resources/IconLogo.jpg',
    '../resources/iotIcon.svg',
    '../resources/list.svg',
    '../resources/madIcon.svg',
    '../resources/mastercard.svg',
    '../resources/message-circle.svg',
    '../resources/notification.svg',
    '../resources/notifications.svg',
    '../resources/payIcon.svg',
    '../resources/sampleImage.png',
    '../resources/saved.svg',
    '../resources/search.svg',
    '../resources/settings.svg',
    '../resources/settingsArrow.svg',
    '../resources/studyMaterials.jpg',
    '../resources/superhero.png',
    '../resources/thumbsUp.svg',
    '../resources/topUpIcon.svg',
    '../resources/visa.svg',
    '../resources/WhatsApp Image 2024-05-23 at 10.15.13_b877b788.svg',
    '../resources/wifi.svg',
    '../resources/zap.svg',
    '../resources/trophy-svgrepo-com.svg',
    '../resources/internal_cup.svg',
    '../resources/cup_border.svg',
    '../resources/steam.svg',
    '../resources/water_droplet.svg',
    '../resources/bear.png',
    '../resources/cat.png',
    '../resources/chicken.png',
    '../resources/dog.png',
    '../resources/giraffe.png',
    '../resources/gorilla.png',
    '../resources/panda.png',
    '../resources/rabbit.png',
    '../resources/plus.svg',
    '../resources/send.svg',
    '../resources/calendar2.svg',
    '../resources/calender.svg',
    '../resources/addCredit.svg',
    '../resources/addFile.svg',
    '../resources/addImage.svg',
    '../resources/algebraIcon.svg',
    '../resources/amex.svg',
    '../manifest.json',
    '../css/friendsList.css',
    '../css/friendsListDark.css',
    '../css/global.css',
    '../css/home.css',
    '../css/homeDark.css',
    '../css/index.css',
    '../css/indexDark.css',
    '../css/leaderboard1.css',
    '../css/leaderboard1Dark.css',
    '../css/materials.css',
    '../css/navBar.css',
    '../css/navBarDark.css',
    '../css/newReminders.css',
    '../css/notifications.css',
    '../css/notificationsDark.css',
    '../css/paymentAddCard.css',
    '../css/paymentOptions.css',
    '../css/paymentPay.css',
    '../css/paymentTopUp.css',
    '../css/questions.css',
    '../css/reminders.css',
    '../css/remindersDark.css',
    '../css/savedPosts.css',
    '../css/settings.css',
    '../css/settingsDark.css',
    '../css/signup.css',
    '../css/signupDark.css',
    '../css/subjectSettings.css',
    '../css/subjectSettings2.css',
    '../css/timer.css',
    '../css/timerDark.css',
    '../css/userAgreement.css',
    '../css/userAgreementDark.css',
    '../css/userProfile.css',
    '../css/viewPosts.css',
    '../css/viewSpecificPost.css',
    '../css/addFriends.css',
    '../css/changeDesc.css',
    '../css/changePic.css',
    '../css/createPost.css',
    '../css/discussionBoard.css',
    '../css/discussionBoardDark.css',
    '../css/editprofile.css',
    '../css/editProfilePic.css',
    '../css/feedback.css',
    '../css/friendprofile.css',
  // Add any other resources you want to cache
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
