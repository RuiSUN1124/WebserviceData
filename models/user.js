'use strict'
var mongodb = require('./mongodb');
var Schema =  mongodb.mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
    username: String,
    password: String,
    userId: String,
    //userAdmin: {type: String,default:'Admin'},//this function repetitive?
    userLevel: Number,//Normal: 1 Super: 2
	//avatar: {type: String, default: 'default.jpg'},
    city: String,
    district: String,
    road: String
});
UserSchema.plugin(passportLocalMongoose);

var UserModel = mongodb.mongoose.model('user',UserSchema);

//operations
var UserOp = function(){};
//function save
UserOp.prototype.save = function(obj,callback){
    var instance = new UserModel(obj);
    instance.save(function(err){
        callback(err);
    })
}

exports.UserOp = new UserOp();
exports.UserModel = UserModel;