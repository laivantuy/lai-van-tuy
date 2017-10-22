//Lên lịch đăng bài
var mongoClient = require('mongodb').MongoClient;
var request = require('request');
var configDB = require('./config/database.js');
var fs = require('fs');
const login = require("facebook-chat-api");
var async = require('async');
var request = require('request');
var hoangtien_request = require('hoangtien_request');
var database = require("./node_modules/hoangtien_getinfo.js");

console.log('Lenlichdangbai.js on Start');

setInterval(function(){
	console.log(new Date(new Date().getTime()))
	mongoClient.connect(configDB.url, function(err, row1) {
		var time = new Date()
		var lenlichdangbai = row1.collection('lenlichdangbai');
		lenlichdangbai.find({'db.trangthai': "on", 'db.time':{$lte:time.getTime()} }).toArray(function (err, data_accounts) {
			if(err)	return console.log(err)

			if(data_accounts.length > 0)
			{
				async.forEachLimit(data_accounts, 1, function(value_account, next_1){
					console.log("-------"+value_account.db.id_account+"------");

					var id
					if(value_account.db.id_groups.indexOf('|') != -1)
						id = value_account.db.id_groups.split('|')
					else
						id = value_account.db.id_groups.split('\r\n')
					
					database.find_accounts_facebook_messenger(value_account.db.id_account, (err, data_account_token)=>{
						var noidung = value_account.db.noidung
						var access_token = data_account_token[0].db.access_token

						console.log(value_account.db.noidung)
						async.forEachLimit(id, 1, function(value_id, next_2){
							console.log(value_id)

							var json = {}
							if(value_account.db.file)
							{
								switch(value_account.db.file){
									case 'share':{
										var url = 'https://graph.facebook.com/v2.10/'+value_id+'/feed'
										var link = value_account.db.url
										json = {
											message: noidung,
											link: link,
											access_token: access_token
										}
										request({
											url : url,
											json : json,
											method: 'POST'
										},(err, body, html)=>{
											if(err) return console.log(err)
											updateOne_lenlicdangbai(value_account.db.id, html)
											// console.log(html)
										})
										next_2()
										break;
									}
									case 'video':{
										var url = 'https://graph.facebook.com/v2.10/'+value_id+'/videos'
										var link = value_account.db.url
										json = {
											description: noidung,
											file_url: link,
											access_token: access_token
										}
										request({
											url : url,
											json : json,
											method: 'POST'
										},(err, body, html)=>{
											if(err) return console.log(err)
											updateOne_lenlicdangbai(value_account.db.id, html)
											// console.log(html)
										})
										next_2();
										break;
									}
									case 'image':{
										var url = 'https://graph.facebook.com/v2.10/'+value_id+'/photos'
										var link = value_account.db.url
										json = {
											message: noidung,
											access_token: access_token
										}
										request({
											url : url,
											json : json,
											method: 'POST'
										},(err, body, html)=>{
											if(err) return console.log(err)
											updateOne_lenlicdangbai(value_account.db.id, html)
											// console.log(html)
										})
										next_2()
										break;
									}
									case 'null':{
										var url = 'https://graph.facebook.com/v2.10/'+value_id+'/feed'
										json = {
											message: noidung,
											access_token: access_token
										}
										request({
											url : url,
											json : json,
											method: 'POST'
										},(err, body, html)=>{
											if(err) return console.log(err)
											updateOne_lenlicdangbai(value_account.db.id, html)
											// console.log(html)
										})
										next_2()
										break;
									}
								}
							}
							else
							{

								var url = 'https://graph.facebook.com/v2.10/'+value_id+'/feed'
								var link = value_account.db.url
								json = {
									message: noidung,
									access_token: access_token
								}
								request({
									url : url,
									json : {
										message: noidung,
										access_token: access_token
									},
									method: 'POST'
								},(err, body, html)=>{
									if(err) return console.log(err)
									updateOne_lenlicdangbai(value_account.db.id, html)
									// console.log(html)
									next_2()
								})
							}
						},()=>{
							next_1()
						})
					})
					console.log("--------------");
				})
			}
			else
				return console.log('Lenlichdangbai.js Chua co ai dung')
		})
	});
},60000)

function updateOne_lenlicdangbai(id, body){
	mongoClient.connect(configDB.url, function(err, db) {
		var lenlichdangbai = db.collection('lenlichdangbai');

		if(body.error)
		{
			lenlichdangbai.update({'db.id':id}, { $push :{ 'db.id_post': 'err' }}, function (err,row) {
				if (err) return console.log(err)
				lenlichdangbai.update({'db.id':id}, { $set :{ 'db.trangthai': 'err' }}, function (err,row) {
					if (err) return console.log(err)
						var account = db.collection('accounts_facebook_messenger')
						account.update({ 'db.lenlichdangbai': { $elemMatch: { 'id': id } } }, { $push :{ 'db.lenlichdangbai.$.id_post': 'err' }, $set:{ 'db.lenlichdangbai.$.trangthai': 'err' }},(err, row)=>{
							if(err) return console.log(err)
						})
				})
			})
		}
		else
		{
			lenlichdangbai.update({'db.id':id}, { $push :{ 'db.id_post': body.id }}, function (err,row) {
				if (err) return console.log(err)
				lenlichdangbai.update({'db.id':id}, { $set :{ 'db.trangthai': 'done' }}, function (err,row) {
					if (err) return console.log(err)
						var account = db.collection('accounts_facebook_messenger')
						account.update({ 'db.lenlichdangbai': { $elemMatch: { 'id': id } } }, { $push :{ 'db.lenlichdangbai.$.id_post': body.id }, $set:{ 'db.lenlichdangbai.$.trangthai': 'done' }},(err, row)=>{
							if(err) return console.log(err)
						})
				})
			})
		}
	});
}