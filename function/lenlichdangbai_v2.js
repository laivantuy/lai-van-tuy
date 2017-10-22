//Lên lịch đăng bài
var mongoClient = require('mongodb').MongoClient;
var request = require('request');
var configDB = require('../config/database.js');
var fs = require('fs');
const login = require("facebook-chat-api");
var async = require('async');
var request = require('request');
var hoangtien_request = require('hoangtien_request');
var database = require("../node_modules/hoangtien_getinfo.js");
var CronJob = require('cron').CronJob;
const child_process = require('child_process');

console.log('Lenlichdangbai.js on Start');
console.log(process.pid)
process.on('message', (post_id) => {
	mongoClient.connect(configDB.url, function(err, row1) {
		var lenlichdangbai = row1.collection('lenlichdangbai');
		lenlichdangbai.find({'db.id': post_id}).toArray(function (err, value_account) {
			if(err) return console.log(err)

			lenlichdangbai.update({'db.id': post_id},{$set:{'db.pid': process.pid}})
			xulytime(value_account[0].db.time, (new_time)=>{
				var job = new CronJob({
				  cronTime: new_time,
				  onTick: function() {
				    console.log("-------"+value_account[0].db.id_account+"------");
				    var id
					if(value_account[0].db.id_groups.indexOf('|') != -1)
						id = value_account[0].db.id_groups.split('|')
					else
						id = value_account[0].db.id_groups.split('\r\n')

					database.find_accounts_facebook_messenger(value_account[0].db.id_account, (err, data_account_token)=>{
						var noidung = value_account[0].db.noidung
						var access_token = data_account_token[0].db.access_token

						console.log(value_account[0].db.noidung)
						async.forEachLimit(id, 1, function(value_id, next_2){
							console.log(value_id)

							var json = {}
							if(value_account[0].db.file)
							{
								switch(value_account[0].db.file){
									case 'share':{
										var url = 'https://graph.facebook.com/v2.10/'+value_id+'/feed'
										var link = value_account[0].db.url
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
											updateOne_lenlicdangbai(value_account[0].db.id, html, ()=>{
												next_2()
											})
											// console.log(html)
										})
										break;
									}
									case 'video':{
										var url = 'https://graph.facebook.com/v2.10/'+value_id+'/videos'
										var link = value_account[0].db.url
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
											updateOne_lenlicdangbai(value_account[0].db.id, html, ()=>{
												next_2()
											})
											// console.log(html)
										})
										break;
									}
									case 'image':{
										var url = 'https://graph.facebook.com/v2.10/'+value_id+'/photos'
										var link = value_account[0].db.url
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
											updateOne_lenlicdangbai(value_account[0].db.id, html, ()=>{
												next_2()
											})
											// console.log(html)
										})
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
											updateOne_lenlicdangbai(value_account[0].db.id, html, ()=>{
												next_2()
											})
											// console.log(html)
										})
										break;
									}
								}
							}
							else
							{
								var url = 'https://graph.facebook.com/v2.10/'+value_id+'/feed'
								var link = value_account[0].db.url
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
									updateOne_lenlicdangbai(value_account[0].db.id, html, ()=>{
										next_2()
									})
									// console.log(html)
								})
							}
						},()=>{
							console.log('goi autoupto ma khong thay')

							if(value_account[0].db.auto_uptop == 'on')
							{
								console.log('goi autoupto ma khong thay')
								const uptop = child_process.fork(`./function/auto_uptop_v2.js`);
								uptop.send(value_account[0].db.id);
								
							}
							
							if(value_account[0].db.xulycomment == 'on')
							{
								console.log('goi autoupto ma khong thay')
								const uptop = child_process.fork(`./function/xulycomment_v2.js`);
								uptop.send(value_account[0].db.id);
								
							}

							if(value_account[0].db.xulycomment == 'on' || value_account[0].db.auto_uptop == 'on')
								return
							else
								process.kill(process.pid)
						})
					})
					console.log("--------------");
				  },
				  start: true,
				  timeZone: 'Asia/Ho_Chi_Minh'
				});
			})
		})
	});
});
		
function updateOne_lenlicdangbai(id, body, callback){
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
							callback()
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
							callback()
						})
				})
			})
		}
	});
}

function xulytime(time, callback)
{
	var time = time.split(' ')
	var new_day = time[0].split('/')
	var new_time = time[1].split(':')

	console.log('00 '+new_time[1]+' '+new_time[0]+' '+new_day[1]+' '+(new_day[0]-1)+' *')
	callback('00 '+new_time[1]+' '+new_time[0]+' '+new_day[1]+' '+(new_day[0]-1)+' *')
}