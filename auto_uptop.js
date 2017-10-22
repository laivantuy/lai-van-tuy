//Auto rep CMT
var mongoClient = require('mongodb').MongoClient;
var request = require('request');
var configDB = require('./config/database.js');
var fs = require('fs');
var async = require('async');
var hoangtien_request = require('hoangtien_request');

console.log('Auto up top on Start');

// setInterval(function(){
	mongoClient.connect(configDB.url, function(err, row1) {
		var lenlichdangbai = row1.collection('lenlichdangbai');

		lenlichdangbai.find({'db.trangthai': "done", 'db.auto_uptop':'on'}).toArray(function (err, data_accounts) {
			if(err)	return console.log(err)

			if(data_accounts.length>0)
			{
				async.forEachLimit(data_accounts, 1, (value_account, next_1)=>{
					async.forEachLimit(value_account.db.id_post, 1, (value_id_post, next_2)=>{
						var url = 'https://graph.facebook.com/v2.10/'+value_id_post+'/comments'
						request({
							url : url,
							json : {
								message: 'Auto up top for autofbmkt.com',
								access_token: value_account.db.access_token
							},
							method: 'POST'
						},(err, body, html)=>{
							if(err) return console.log(err)
							// var obj_html = JSON.parse(html)

							var url = 'https://graph.facebook.com/v2.10/'+html.id

							request({
								url : url,
								json : {
									access_token: value_account.db.access_token
								},
								method: 'DELETE'
							},(err, body, html)=>{
								if(err) return console.log(err)

								console.log('delete')
								console.log(html)
								next_2()
							})
							console.log(html)
						})
					},()=>{
						next_1()
					})
				})
			}
			else
				return console.log('Auto up top Chưa có ai dùng')
		})
	});
// },1000)

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