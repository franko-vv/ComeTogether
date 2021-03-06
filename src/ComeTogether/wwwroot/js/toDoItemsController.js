﻿/// <reference path="../lib/angular/angular.min.js" />
/// <reference path="../lib/angular/angular.js" />

(function () {

    "use strict";

    angular.module("tasks_app").controller("toDoItemsController", toDoItemsController);

    function toDoItemsController($routeParams, $http/*, userConfig*/) {

        var vm = this;
        vm.categoryId = $routeParams.categoryId;
        vm.errorMessage = "";
        vm.isBusy = true;
        vm.todoItems = [];

        //vm.userName = userConfig.userName;
        //console.log("username = " + vm.userName);

        // GET CURRENT USER NAME
        vm.userName = {};
        $http.get("/api/currentuser")
            .then(function (response) {
                //Success
                vm.userName = response.currentUser;
            }, function (error) {
            }).finally(function () { });
        console.log(vm.userName);


        vm.today = new Date().toJSON().slice(0, 10);
        var urlTasks = "/api/category/" + vm.categoryId + "/tasks";

        // GET - TODOITEMS LIST
        vm.refreshToDoItems = function () {
            $http.get(urlTasks)
                .then(function (response) {
                    //success
                    vm.todoItems = response.data;
                }, function () {
                    //error
                    vm.errorMessage = "Failed to load To Do Items from db";
                }).finally(function () {
                    vm.isBusy = false;
                });
        };
        vm.refreshToDoItems();



        // TOGGLE BUTTON - SHOW/HIDE NEW TASK        
        vm.newItemMenuToggle = false; // Show/hide add new category
        vm.textToggleBtn = "Show add todo form"
        vm.usersListForCategory = [];

        vm.showNewItem = function () {
            vm.newItemMenuToggle = !vm.newItemMenuToggle;
            
            if (vm.newItemMenuToggle)
            {
                vm.textToggleBtn = "Hide add todo form";

                if (vm.usersListForCategory.length == 0)
                    vm.getUsersRelatedWithCategory();
            }                
            else
                vm.textToggleBtn = "Show add todo form";
        };    
        vm.getUsersRelatedWithCategory = function () {
            // Get Users related with current category for dropdown button
            vm.urlUsers = "/api/category/" + vm.categoryId + "/users";
            $http.get(vm.urlUsers)
                .then(function (response) {
                    //success
                    vm.usersListForCategory = response.data;
                    console.log('vm.usersListForCategory'); console.log(vm.usersListForCategory);
                }, function (error) {
                    //failed
                }).finally();
        };
        

        // POST - ADD NEW TASK
        vm.newTodoitem = {};
        vm.isBusyAddNew = false;

        vm.addNewToDoItem = function () {
            vm.errorMessageAddNew = "";
            vm.isBusyAddNew = true;
            try {
                vm.newTodoitem.dateFinish.setHours(vm.newTodoitem.dateFinish.getHours() - vm.newTodoitem.dateFinish.getTimezoneOffset() / 60);
            }
            catch (err) {
                vm.errorMessageAddNew = "Can't add new task to db. Check your date";
                vm.isBusyAddNew = false;
                return;
            }

            vm.urlNewtask = "/api/category/" + vm.categoryId + "/tasks";

            $http.post(vm.urlNewtask, vm.newTodoitem)
                .then(function () {
                    //success
                    vm.refreshToDoItems();
                }, function () {
                    //failed
                    vm.errorMessageAddNew = "Can't add new task to db. Check if date is correct.";
                })
                .finally(function () {
                    vm.newTodoitem = {};
                    vm.isBusyAddNew = false;
                });            
        };



        // PUT - CHANGE CHECKBOX STATUS         
        vm.updateStatus = function (id, $index) {
            vm.updatedItem = vm.todoItems[$index];
            vm.updatedItem.done = !vm.updatedItem.done;

            vm.urlupdate = "/api/category/" + vm.categoryId + "/tasks/" + id;

            $http.put(vm.urlupdate, vm.updatedItem)
                .then(function (response) {
                    //success
                    console.log(vm.urlupdate + ": success");
                }, function (response) {
                    //failed
                    console.log("error");
                })
                .finally(function () {
                    vm.isBusy = false;
                });
        };
        // PUT - TASK To RECYCLE
        vm.deleteTask = function (id, $index) {
            console.log("Id task to delete - " + id);

            vm.updatedItem = vm.todoItems[$index];
            vm.updatedItem.isDeleted = true;

            var urlTaskToDel = "/api/category/" + vm.categoryId + "/tasks/";

            $http.put(urlTaskToDel + id, vm.updatedItem)
                .then(function () {
                    //success
                    vm.todoItems.splice($index, 1 );
                }, function () {
                    //error
                }).finally(function () {

                });
        };



        // PUT - ALL DONE TASKS To RECYCLE
        vm.deleteAllDone = function () {
            var urlDelete = "/api/category/" + vm.categoryId + "/tasks/deleteAllDone";
            $http.put(urlDelete)
                .then(function () {
                    //success
                    vm.refreshToDoItems();
                }, function () {
                    //error
                }).finally(function () {

                });
        };

        //---------------------------------COMMENTS------------------------//

        // SHOW COMMENTS BTN
        vm.showCommentsFlag = false;
        vm.comments = [];
        vm.selectedCommentButton = {};

        vm.showComments = function (taskId) {
            vm.selectedCommentButton = taskId;
            vm.showCommentsFlag = true;
            var urlComments = "/api/category/" + vm.categoryId + "/" + taskId + "/comments";
            $http.get(urlComments)
                .then(function (response) {
                    //success
                    vm.comments = response.data;
                    console.log(vm.comments);
                }, function () {
                    //failed
                })
                .finally(function () {
                });
        };

        // POST - ADD NEW COMMENT
        vm.newComment = {};
        vm.addNewComment = function () {
            if (vm.selectedCommentButton == "" || vm.selectedCommentButton == null)
                return;

            vm.newComment.dateAdded = vm.today;

            vm.urlNewComment = "/api/category/" + vm.categoryId + "/" + vm.selectedCommentButton + "/comments";

            $http.post(vm.urlNewComment, vm.newComment)
                .then(function () {
                    //success
                    vm.showComments(vm.selectedCommentButton);
                }, function () {
                    //failed
                    vm.errorMessageAddNew = "Something wrong. Can't add new comment.";
                })
                .finally(function () {
                    vm.newComment = {};
                });
        };

        // DELETE - DELETE COMMENT
        vm.deleteComment = function (commentId, $index) {
            var urlCommentDelete = "/api/category/" + vm.categoryId + "/" + vm.selectedCommentButton + "/comments/" + commentId;
            console.log($rootScope.currentUser);
            $http.delete(urlCommentDelete)
                .then(function () {
                    //success
                    vm.comments.splice($index, 1);
                }, function () {
                    //failed
                }).finally(function () { });
        };
    }
})();