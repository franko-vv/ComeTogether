﻿(function () {

    "use strict";

    angular.module("tasks_app")
        .controller("categoryEditController", categoryEditController);

    function categoryEditController($routeParams, $http) {

        var vm = this;
        vm.categoryId = $routeParams.categoryId;
        vm.categoryName = "";

        $http.get("/api/category/" + vm.categoryId)
            .then(function (response) {
                //Success
                vm.categoryName = response.data.name;
                console.log(response);
                console.log(vm.categoryName);
            }, function (error) {
                //Fail
                vm.errorMessage = "Failed to load data: " + error;
            })
            .finally(function () {
            });

        // Get Users related with current category
        vm.urlUsers = "/api/category/" + vm.categoryId + "/users";
        vm.usersListForCategory = [];
        $http.get(vm.urlUsers)
            .then(function (response) {
                //success
                vm.usersListForCategory = response.data;
            }, function (error) {
                //failed
            }).finally();        

        vm.url = "/api/category/edit/" + vm.categoryId;
        vm.editCategoryClick = function () {

            vm.isBusy = true;
            vm.errorMessage = "";            
            console.log("Click edit category click");

            vm.insertcategory = {
                data:
                    {
                        Id: vm.categoryId,
                        Name: vm.categoryName 
                    }
            };

            //{ Id: vm.categoryId, Name: vm.categoryName }
            $http.put(vm.url, vm.insertcategory.data)
                .then(function (response) {
                    //success
                    console.log("success");
                }, function (response) {
                    //failed
                    console.log("error");
                })
                .finally(function () {
                    vm.isBusy = false;
                });
        };


        // Add new users for this category
    }
})();