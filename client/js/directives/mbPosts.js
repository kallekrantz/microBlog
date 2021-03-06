define([], function(){
    'use strict';
    return  [function(){
        return {
            templateUrl: 'client/partials/posts-template.html',
            controller: ['$scope', 'postService', 'authService', function($scope, postService, authService){
                $scope.posts = [];

                $scope.removePost = function(id){
                    postService.delete(id)
                        .then(function(data, status){
                        },function(data, status){
                        });
                };

                $scope.editPost = function(id, userObj){
                    postService.put(id, userObj)
                        .then(function(data, status){
                        }, function(data, status){
                        });
                };
                $scope.addComment = postService.comment.post;

                $scope.$watch(function () {
                        return postService.posts;
                    },
                    function(newVal, oldVal) {
                        $scope.posts = postService.posts;
                    },
                    true);
                $scope.$watch(function () {
                        return authService.currentUser;
                    },
                    function(newVal, oldVal) {
                        $scope.currentUser = authService.currentUser;
                    },
                    true);
            }]
        };
    }];
});