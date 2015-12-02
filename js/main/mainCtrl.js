angular.module('App')
.controller('mainCtrl', function($scope, weatherService, newsService, userService, travelService){
    var updateWeather, updateNews;

    if($scope.user === undefined || Object.keys($scope.user).length === 0){
        userService.getUserData().then(function(user){
            $scope.user = user;
        });
    }

    function getWeather() {
        weatherService.getWeatherData()
            .then(function (data) {
                $scope.user.data.weather = data;
                $scope.user2 = $scope.user;
                $scope.user2.$save();

                var upd = $scope.user.data.weather.updated;
                if(updateWeather !== undefined){
                    clearTimeout(updateWeather);
                }

                updateWeather = setTimeout(getWeather, (upd+600000));
                console.log('Get new weather in ' + Math.round(((upd+600000)-Date.now())/60000) + ' minutes.')
            });
    }

    function getNews(){
        if($scope.user.settings.news.updates){
            newsService.getNewsData($scope.user).then(function(data){
                $scope.user.data.news = data;
                $scope.user2 = $scope.user;
                $scope.user2.$save();

                var upd = $scope.user.data.news.updated;
                if(updateNews !== undefined){
                    clearTimeout(updateNews);
                }

                updateNews = setTimeout(getNews, (upd+600000));
                console.log('Get new news in ' + Math.round(((upd+600000)-Date.now())/60000) + ' minutes.')
            })
        }
    }

    function getTravel(){
        travelService.getTravelInfo($scope.user.locations.home.address, $scope.user.locations.work.address)
    }


    setTimeout(function(){getTravel();getWeather()}, 1000);
    setTimeout(function(){getNews()}, 2000);
});