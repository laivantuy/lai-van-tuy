//Auto rep CMT
var mongoClient = require('mongodb').MongoClient;
var request = require('request');
var configDB = require('../config/database.js');
var fs = require('fs');
var async = require('async');
var hoangtien_request = require('hoangtien_request');
var database = require("../node_modules/hoangtien_getinfo.js");
var login2 = require('login2')

console.log('Auto up top on Start');

console.log(process.pid)
process.on('message', (id) => {
	mongoClient.connect(configDB.url, function(err, row1) {
		var lenlichdangbai = row1.collection('lenlichdangbai');

		lenlichdangbai.update({'db.id': id}, {$set: {'db.uptop_pid': process.pid}})
		
		lenlichdangbai.find({'db.id': id}).toArray(function (err, value_account) {
			if(err)	return console.log(err)

			database.find_accounts_facebook_messenger(value_account[0].db.id_account, (err, data_account_token)=>{
				var message = value_account[0].db.noidung_uptop
				var access_token = data_account_token[0].db.access_token

				async.forEachLimit(value_account[0].db.id_post, 1, (value_id_post, next_2)=>{
					var url = 'https://graph.facebook.com/v2.10/'+value_id_post+'/comments'

					setInterval(function(){
						request({
							url : url,
							json : {
								message: message,
								access_token: access_token
							},
							method: 'POST'
						},(err, body, html)=>{
							if(err) return console.log(err)

							if(html.error)
							{
								switch(html.error.code)
								{
									case 200:{
										get_token(data_account_token[0].db.cookie, data_account_token[0].db.link_profile, (err, token)=>{
											if(err) return console.log(err)

											var update_token = row1.collection('accounts_facebook_messenger');
											update_token.updateOne({'db.id':data_account.db.id_account}, {$set: { 'db.access_token': token}}, function (err,row) {
												if (err) return console.log(err)
											})
										})
									}
								}
							}
							else
							{
								if(value_account[0].db.uptop_delete == 'on')
								{
									var url = 'https://graph.facebook.com/v2.10/'+html.id
									request({
										url : url,
										json : {
											access_token: access_token
										},
										method: 'DELETE'
									},(err, body, html)=>{
										if(err) return console.log(err)
										console.log('delete')
										console.log(html)
									})
								}
							}
							console.log(html)
						})
					},value_account[0].db.time_uptop*60000)
					next_2()
				})
			})
		})
	});
});

function get_token(cookie, req_url, callback)
{
    login2({appState: JSON.parse(cookie)}, req_url,(err, api) => {
        if(err) 
        {
        	callback(err, null)
            return console.error(err);
        }
        try{
        	var access_token = /access_token:"(.+?)"/.exec(api)[1]

	        return callback(null, access_token)
        }
        catch(e){
        	callback(false, null, null)
        	return	console.log(e.message)
        }
    });
}

function get_tukhoa(id, callback)
{
	mongoClient.connect(configDB.url, (err, row1)=>{
		var tukhoa = row1.collection('tukhoa_profile_facebook_messenger');
		tukhoa.find({'db.id':id}).toArray((err, ds_tukhoa)=>{
			if(err) return console.log(err)

			return callback(ds_tukhoa)
		})
	})
}