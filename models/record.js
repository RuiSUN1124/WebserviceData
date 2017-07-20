'use strict'
var mongodb = require('./mongodb');
var Schema =  mongodb.mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var RecordSchema = new Schema({
    recorderName: String,
    timeRepaire: String,
    locationRepaire: {xPoint: Double,
               yPoint: Double },
    //userAdmin: {type: String,default:'Admin'},//this function repetitive?
    repaireId: String,
    Content: String
});
RecordSchema.plugin(passportLocalMongoose);
//collection name
var RecordModel = mongodb.mongoose.model('record',RecordSchema);

//operations
var UserOp = function(){};
//function save
UserOp.prototype.save = function(obj,callback){
    var instance = new RecordModel(obj);
    instance.save(function(err){
        callback(err);
    })
}

exports.UserOp = new UserOp();
exports.RecordModel = RecordModel;