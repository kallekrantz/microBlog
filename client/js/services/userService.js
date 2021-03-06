define(['angular'], function(angular){
    'use strict';
    var users = {};
    return ['$http', 'SocketIo', function($http, io){
        var getAllPromise;
        io.on('user:created', function(user){
            users[user.id] = user;
        });
        io.on('user:modified', function(user){
            console.log('wat');
            angular.extend(users[user.id], user);
        });
        io.on('user:removed', function(user){
            delete users[user.id];
        });

        var service =  {
            users: users,
            get: function(id){
                return $http.get('rest/users/'+id).
                    then(function(data, status){
                        if(service.users[data.data.id] === undefined){
                            service.users[data.data.id] = {};
                        }
                        angular.extend(service.users[data.data.id], data.data);
                    });
            },
            // Small gotcha on this function: returns the same object that would be in users[id],
            // However, the object will be removed if the user does not exist after the promise has been resolved.
            // The object will be populated if the user exists and the promise has been resolved.
            getSingleUser: function(id){
                if(service.users[id] === undefined){
                    var user = {};
                    service.users[id] = user;
                    service.get(id).then(function(){
                    },function(err){
                        delete service.users[id];
                    });
                    return user;
                }
                else{
                    return service.users[id];
                }
            },
            getAll: function(forceReload){
                if(forceReload === true || !getAllPromise){
                    getAllPromise = $http.get('rest/users')
                        .then(function(data, status){
                            data.data.forEach(function(user){
                                service.users[user.id] = user;
                            });
                        });
                }
                return getAllPromise;

            },
            delete: function(id){
                return $http.delete('rest/users/'+id)
                    .then(function(data, status){
                        delete service.users[id];
                    });
            },
            put: function(id, postData){
                return $http.put('rest/users/'+id, postData)
                    .then(function(data, status){
                        angular.extend(service.users[data.data.id], data.data);
                    });
            }
        };
        return service;
    }];
});
