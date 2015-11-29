angular.module('App')
    .service('newsService', function ($http, $q, userService, fb, $firebaseAuth, $firebaseObject) {
        var url1 = 'http://api.nytimes.com/svc/topstories/v1/',
            url2 = '.json?api-key=560ff7584fa9434472a064377ae35c0b:3:70264294',
        //categories = ['home', 'technology', 'arts', 'sports', 'health'],
            user = {
                data: {
                    news: {}
                }
            };

        function getUserData() {
            return $q(function (resolve) {
                var categories = [];
                angular.forEach(user.settings.news.categories, function (value, key) {
                    if (value) {
                        this.push(key);
                    }
                }, categories);
                resolve(categories)
            });
                /*.then(function (cat) {
                resolve(cat)
            });*/
        }

        function getNews() {
            return getUserData().then(function (cat) {
                var promise = [];
                categories = cat;

                categories.forEach(function (e) {
                    promise.push($http({
                            method: 'GET',
                            url: url1 + e + url2
                        }).then(function (res) {
                            var data = res.data.results,
                                image = '';
                            if (res.data.results[0].multimedia === '') {
                                image = ''
                            } else {
                                image = data[0].multimedia[3].url
                            }
                            return [e, {
                                title: data[0].title,
                                image: image,
                                text: data[0].abstract,
                                url: data[0].url
                            }];

                        })
                    );
                });
                return promise
            }).then(function (promise) {
                var n = {};
                return $q.all(promise).then(function (val) {
                    val.forEach(function (e) {
                        n[e[0]] = e[1];
                    });
                    n.updated = Date.now();
                    user.data.news = n;
                    return n
                });
            });


        }

        this.getNewsData = function (usr) {
            user = usr;
            return $q(function (resolve) {
                if (Object.keys(user.data.news).length === 0) {
                    var rel = new Firebase(fb.url + 'user/');
                    authObj = $firebaseAuth(rel);
                    if (authObj.$getAuth()) {
                        var provider = authObj.$getAuth().provider;
                        var id = (authObj.$getAuth()[provider].id);
                        var obj = $firebaseObject(new Firebase(fb.url + 'user/' + id + '/data/news'));
                        obj.$loaded(function () {
                            if ((Date.now() - obj > 600000) || obj === undefined) {
                                console.log('new news 2');
                                getNews().then(function (w) {
                                    user.data.news = w;
                                    resolve(w)
                                })
                            } else {
                                console.log('same old news 2');
                                user.data.news = obj;
                                resolve(obj)
                            }
                        });
                    }
                } else {
                    if ((Date.now() - user.data.news.updated > 600000) || user.data.news.updated === undefined) {
                        console.log('new news');
                        getNews().then(function (w) {
                            user.data.news = w;
                            resolve(w)
                        })
                    } else {
                        console.log('same old news');
                        resolve(user.data.news)
                    }
                }

            })
        }
    });