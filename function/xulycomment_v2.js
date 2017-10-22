//Auto rep CMT
var mongoClient = require('mongodb').MongoClient;
var request = require('request');
var configDB = require('../config/database.js');
var fs = require('fs');
var async = require('async');
var hoangtien_request = require('hoangtien_request');
var login = require("facebook-chat-api");
var database = require("../node_modules/hoangtien_getinfo.js");

console.log('Xu ly cmt on Start');
console.log(process.pid)

process.on('message', (id) => {
	console.log(id)
	mongoClient.connect(configDB.url, function(err, row1) {
		var lenlichdangbai = row1.collection('lenlichdangbai');

		lenlichdangbai.update({'db.id': id}, {$set: {'db.xulycomment_pid': process.pid}})

		lenlichdangbai.find({'db.id': id}).toArray(function (err, data_accounts) {
			if(err)	return console.log(err)
			setInterval(()=>{
				async.forEachLimit(data_accounts, 1, (value_account, next_1)=>{
					database.find_accounts_facebook_messenger(value_account.db.id_account, (err, data_account_token)=>{
						var access_token = data_account_token[0].db.access_token
						var cookie = data_account_token[0].db.cookie
						var access_token_full = data_account_token[0].db.access_token_full

						async.forEachLimit(value_account.db.id_post, 1, (value_id_post, next_2)=>{
							var node = xulyid_get(value_id_post)+'?fields=comments.order(reverse_chronological).limit(10){permalink_url,id,message,from}'
							
							hoangtien_request.get(node, access_token, (html)=>{
								var obj_html = JSON.parse(html)
								if(obj_html.comments)
								{
									console.log(obj_html.comments)
									//Xử lý trạng thái auto trả lời cmt
									async.forEachLimit(obj_html.comments.data, 1, (value_comment, next_3)=>{
										if(value_comment.from.id != value_account.db.id_profile)
										{
											
											lenlichdangbai.find({'db.id_comment_log.id':value_comment.id}).toArray((err,row3)=>{
												if(row3.length>0)
													return next_3()
												else
												{
													lenlichdangbai.update({'db.id':value_account.db.id}, {$set:{'db.id_comment_log': obj_html.comments.data}},(err, row)=>{if(err) return console.log(err)})
													//Trường hợp bật tính năng trả lời cmt
													async.waterfall([(callback)=>{
														if(value_account.db.ds_tukhoa_cmt)
														{
															//Xử lý danh sách từ khóa của account
															async.forEachLimit(value_account.db.ds_tukhoa_cmt, 1, (value_ds_tukhoa, next_5)=>{
																get_tukhoa(value_ds_tukhoa, function(err, tukhoa, cautraloi){
																	if(err)
																	{
																		var ds_tukhoa = xulytukhoa(tukhoa);
																		var ds_cautraloi = xulytukhoa(cautraloi);
																		//Kiểm tra xem trong cmt có từ khóa hay không
																		async.forEachLimit(ds_tukhoa, 1, (value_tukhoa, next_6)=>{
																			if(value_comment.message.toUpperCase().indexOf(value_tukhoa.toUpperCase()) != -1)
																			{
																				if(value_comment.permalink_url.indexOf('&reply_comment_id') != -1)
																				{
																					var id_post = xulyid_comment(value_comment.permalink_url)
																					var url = 'https://graph.facebook.com/v2.10/'+id_post+'/comments'
																					var message = get_name_cautraloi(random_cautraloi(ds_cautraloi),value_comment.from.name)

																					request({
																						url : url,
																						json : {
																							message: message,
																							access_token: access_token_full
																						},
																						method: 'POST'
																					},(err, body, html)=>{
																						if(err) 
																						{
																							callback()
																							console.log(err)
																						}
																						callback()
																						if(html.error)
																						{
																							if(html.error.code == 190 || html.error.code == 100)
																							{
																								database.get_token(data_account_token[0].db.id, (err, access_token, access_token_full)=>{
																									var accounts_update = row1.collection('accounts_facebook_messenger');
																									accounts_update.update({'db.id':data_account_token[0].db.id},{$set:{'db.access_token':access_token,'db.access_token_full':access_token_full}})
																								})
																							}
																						}
																						console.log(html)
																					})
																				}
																				else
																				{
																					var id_post = value_comment.id
																					var url = 'https://graph.facebook.com/v2.10/'+id_post+'/comments'
																					var message = get_name_cautraloi(random_cautraloi(ds_cautraloi),value_comment.from.name)

																					request({
																						url : url,
																						json : {
																							message: message,
																							access_token: access_token_full
																						},
																						method: 'POST'
																					},(err, body, html)=>{
																						if(err) 
																						{
																							callback()
																							console.log(err)
																						}
																						else
																						{
																							callback()
																							if(html.error)
																							{
																								if(html.error.code == 190 || html.error.code == 100)
																								{
																									database.get_token(data_account_token[0].db.id, (err, access_token, access_token_full)=>{
																										var accounts_update = row1.collection('accounts_facebook_messenger');
																										accounts_update.update({'db.id':data_account_token[0].db.id},{$set:{'db.access_token':access_token,'db.access_token_full':access_token_full}})
																									})
																								}
																							}
																							
																							console.log(html)
																						}
																					})
																				}
																			}
																			else
																				next_6()
																		},()=>next_5())
																	}
																	else
																	{
																		next_5()
																	}
																})
															},()=>callback())
														}
													},(callback)=>{
														if(value_account.db.ds_tukhoa_messege)
														{
															async.forEachLimit(value_account.db.ds_tukhoa_messege, 1, (value_ds_tukhoa_messege, next_7)=>{
																get_tukhoa(value_ds_tukhoa_messege, function(err, tukhoa, cautraloi){
																	if(err)
																	{
																		var ds_tukhoa = xulytukhoa(tukhoa);
																		var ds_cautraloi = xulytukhoa(cautraloi);
																		//Kiểm tra xem trong cmt có từ khóa hay không
																		async.forEachLimit(ds_tukhoa, 1, (value_tukhoa, next_8)=>{
																			if(value_comment.message.toUpperCase().indexOf(value_tukhoa.toUpperCase()) != -1)
																			{
																				login({appState: JSON.parse(cookie)}, (err, api) => {
																					api.sendMessage(get_name_cautraloi(random_cautraloi(ds_cautraloi),value_comment.from.name), value_comment.from.id);
																					callback()
																				})
																			}
																			else
																			{
																				next_8()
																			}

																		},()=>next_7())
																	}
																	else
																	{
																		next_7()
																	}
																})
															},()=>callback())
														}
													},(callback)=>{
														if(value_account.db.quetsodt == 'on')
														{
															console.log('on mà')
															xulysdt(value_comment.message, function(err, text){
																console.log(err)
																if(err == true)
																{
																	login({appState: JSON.parse(cookie)}, (err, api) => {
																		api.sendMessage("\nNội dung cmt: "+value_comment.message+"\nLink của cmt đó: "+value_comment.permalink_url+"\n"+text, value_account.id_user);
																	})
																}
															})
															callback()
														}
													}],(err)=>{
														next_3()
													})
												}

											})
										}
										else
											return next_3() 

									},()=>next_2())
								}
							})
						},()=>{
							next_1()
					})
				})
			})
			},5000)
		})
	});
});

function xulysdt(text, callback){
	var dau3so = ["098","097","096","091","094","090","093","092","099","095","086"];
	var dau3so1 = ["+8498","+8497","+8496","+8491","+8494","+8490","+8493","+8492","+8499","+8495","+8486"];

	var dau4so = ["0169","0168","0167","0166","0165","0164","0163","0162","0123","0124","0125","0127","0129","0120","0121","0122","0126","0128","0188","0993","0994","0995","0996"];
	var dau4so1 = ["+84169","+84168","+84167","+84166","+84165","+84164","+84163","+84162","+84123","+84124","+84125","+84127","+84129","+84120","+84121","+84122","+84126","+84128","+84188","+84993","+84994","+84995","+84996"];
	
	async.waterfall([
	    function(next) {
	    	async.forEachLimit(dau3so, 1, (sdt1, next_1)=>{
				var log = text.indexOf(sdt1)
				if(log != -1)
					return	callback(true,text)
				else
					next_1()
	    	},()=>next())
	    },
	    function(next) {
	    	async.forEachLimit(dau4so, 1, (sdt2, next_2)=>{
	    		var log = text.indexOf(sdt2)
				if(log != -1)
					return	callback(true,text)
				else
					next_2()

	    	},()=>next())
	    },
	    function(next) {
	    	async.forEachLimit(dau3so1, 1, (sdt3, next_3)=>{
	    		var log = text.indexOf(sdt3)
				if(log != -1)
					return	callback(true,text)
				else
					next_3()

	    	},()=>next())
	    },
	    function(next){
	    	async.forEachLimit(dau3so, 1, (sdt4, next_4)=>{
	    		var log = text.indexOf(sdt4)
				if(log != -1)
					return	callback(true,text)
				else
					next_4()
	    	},()=>next())
	    },()=>callback(false,text)
	])
}

function random_cautraloi (text)
{
	return text[Math.floor((Math.random() * text.length) + 0)]
}

function get_name_cautraloi (text, value)
{
	var str = text
	str= str.replace(/{get_name}/g,value);
	return str;
}

function xulyid_comment(link)
{
	return /comment_id=(.+?)&reply_comment_id/.exec(link)[1]
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

function xulyid_get(id)
{
	return id.split('_')[1]
}

function get_tukhoa(data_id, callback) {
	mongoClient.connect(configDB.url, function(err, db){
		var tukhoa = db.collection('tukhoa_profile_facebook_messenger');
		var tukhoa_full 
		var cautraloi_full 

		tukhoa.find({'db.id':data_id}).toArray(function(err, data){
			if(err) return console.log(err)

			if(data.length != 0)
			{
				return callback(true, data[0].db.ds_tukhoa,data[0].db.ds_cautraloi)
			}
			else
				return callback(false, null, null)
		})
	})
}

function xulytukhoa (text)
{
	var str = text
	str= str.split(" | ");
	return str;
}
