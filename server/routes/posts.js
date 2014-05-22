'use strict';

var auth = require('./middlewares/auth');
var userRoles = require('../config/config').userRoles;
var routeUtils = require('./utilities/routeUtils');

module.exports = function(app, passport){
    var Post = app.get('models').Post;
    var User = app.get('models').User;
    var Comment = app.get('models').Comment;
    app.post('/rest/posts', [auth.requiresLogin, auth.requiresRole(userRoles.poster)], function(req, res){
        var post = Post.build(req.body);
        console.log('Entered posting');
        post.save()
            .error(function(err){
                console.log('Failed /rest/posts post with', err);
                res.status(500).send();
            })
            .success(function(newPost){
                newPost.setUser(req.user).success(function(){
                    res.send(JSON.stringify(newPost));
                });

            });
    });

    app.get('/rest/posts', function(req, res){
        var getAllPosts = routeUtils.findAll(Post, {}, {include: [User, Comment]});
        getAllPosts(req,res);
    });

    app.get('/rest/posts/:id', function(req, res){
        var getPost = routeUtils.find(Post, {
            where: {
                id: req.params.id
            }
        }, {include: [User, Comment]});
        getPost(req, res);
    });

    app.del('/rest/posts/:id', [auth.requiresLogin, auth.requiresRole(userRoles.poster)], function(req, res){
        var deletePost = routeUtils.del(Post, {
            where: {
                id: req.params.id
            }
        },[function(entity){return entity.UserId === req.user.id;},
           function(entity){return req.user.role === 'ADMIN';}
        ]);
        deletePost(req, res);
    });

    app.put('/rest/posts/:id', [auth.requiresLogin, auth.requiresRole(userRoles.poster)], function(req, res){
        var postPut = routeUtils.put(Post, {
                where: {
                    id: req.params.id
                }
            },
            function(req){
                return {
                    text: req.body.text,
                    header: req.body.header
                };
            },{include:[User, Comment]},
            [function(entity){return entity.UserId === req.user.id;},
             function(entity){return req.user.role === 'ADMIN';}
            ]);
        postPut(req,res);
    });




};
