define(['angular'], function(angular){
    'use strict';

    return ['$http', 'SocketIo', 'userService', function($http, io, userService){
        var getAllPromise;
        var posts = {};
        io.on('post:created', function(post){
            post.comments = {};
            post.user = userService.getSingleUser(post.UserId);
            posts[post.id] = post;
        });
        io.on('post:modified', function(post){
            angular.extend(posts[post.id], post);
        });
        io.on('post:removed', function(post){
            delete posts[post.id];
        });

        io.on('comment:created', function(comment){
            posts[comment.PostId].comments[comment.id] = comment;
            comment.user = userService.getSingleUser(comment.UserId);
        });
        io.on('comment:modified', function(comment){
            posts[comment.PostId].comments[comment.id] = comment;
        });
        io.on('comment:removed', function(comment){
            delete posts[comment.PostId].comments[comment.id];
        });

        var service =  {
            posts: posts,
            get: function(id){
                return $http.get('rest/posts/'+id)
                    .then(function(data){
                        if(service.posts[data.data.id] === undefined){
                            service.posts[data.data.id] = {};
                        }
                        angular.extend(service.users[data.data.id], data.data);
                        service.posts[data.data.id].user = userService.getSingleUser(data.data.UserId);
                    });
            },
            getAll: function(forceReload){
                if(forceReload === true || !getAllPromise){
                    getAllPromise = $http.get('rest/posts')
                        .then(function(data, status){
                            data.data.forEach(function(post){
                                var comments = {};
                                post.comments.forEach(function(comment){
                                    comment.user = userService.getSingleUser(comment.UserId);
                                    comments[comment.id] = comment;
                                });
                                post.comments = comments;
                                post.user = userService.getSingleUser(post.UserId);
                                service.posts[post.id] = post;
                            });
                        });
                }
                return getAllPromise;
            },
            post: function(postData){
                return $http.post('rest/posts',postData)
                    .then(function(data, status){
                        data.data.comments = {};
                        data.data.user = userService.getSingleUser(data.data.UserId);
                        service.posts[data.data.id] = data.data;
                    });
            },
            delete: function(id){
                return $http.delete('rest/posts/'+id)
                    .then(function(data, status){
                        delete service.posts[id];
                    });
            },
            put: function(id, post) {
                return $http.put('rest/posts/' + id, post)
                    .then(function (data, status) {
                        angular.extend(service.posts[data.data.id], data.data);
                    });
            },
            comment: {
                get: function(postId, commentId){
                    return $http.get('rest/posts/'+postId+'/comments/'+commentId)
                        .then(function(data, status){
                            var comment = data.data;
                            service.posts[comment.PostId].comments[comment.id] = comment;
                        });
                },
                getAll: function(postId){
                    return $http.get('rest/posts/'+postId+'/comments')
                        .then(function(data, status){
                            var comments = {};
                            data.data.forEach(function(comment){
                                comments[comment.id] = comment;
                                comment.user = userService.getSingleUser(comment.UserId);
                            });

                            service.posts[postId].comments = comments;
                        });
                },
                post: function(postId, postData){
                    return $http.post('rest/posts/'+postId+'/comments',postData)
                        .then(function(data, status){
                            data.data.user = userService.getSingleUser(data.data.UserId);
                            service.posts[data.data.PostId].comments[data.data.id] = data.data;

                        });
                },
                delete: function(postId, commentId){
                    return $http.delete('rest/posts/'+postId+'/comments/'+commentId)
                        .then(function(data, status){
                            delete service.posts[postId].comments[commentId];
                        });
                },
                put: function(postId, commentId, post){
                    return $http.put('rest/posts/'+postId+'/comments/'+commentId, post)
                        .then(function(data, status){
                            angular.extend(service.posts[data.data.PostId].comments[data.data.id], data.data);
                        });
                }
            }
        };
        return service;
    }];
});
