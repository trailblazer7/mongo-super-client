var app = angular.module('msc-app', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'home.html'
    })
    .when('hello', {
        templateUrl: 'hello.html'
    })
    .when('world', {
        templateUrl: 'world.html'
    })
});

var mongojs = require('mongojs');
var db = mongojs;