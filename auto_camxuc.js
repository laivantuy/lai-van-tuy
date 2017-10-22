//Auto cảm xúc
var mongoClient = require('mongodb').MongoClient;
var request = require('request');
var configDB = require('./config/database.js');
var fs = require('fs');
var async = require('async');
var database = require("./node_modules/hoangtien_getinfo.js");
var login2 = require('login2')

console.log('AUTO_LIKE on Start');

// setInterval(()=>{
	try{
		mongoClient.connect(configDB.url, function(err, row1) {
			if(err) return console.log(err)
			var accounts = row1.collection('auto_camxuc');

			accounts.find({'db.id_account': "7cbb6c92-f47f-e8bf-9d26-239239d27ef7" }).toArray(function (err, data_accounts) {
			// accounts.find({'db.trangthai': "1" }).toArray(function (err, data_accounts) {
				if(err)	return console.log(err)

				if(data_accounts.length > 0)
				{
					async.forEachLimit(data_accounts, 1, (data_account, next1)=>{
						console.log('\n'+data_account.db.id_account)
						database.find_accounts_facebook_messenger(data_account.db.id_account, (err, data_account_token)=>{
							if(err) return console.log(err)

							var url_get = 'https://graph.facebook.com/me?fields=home.limit(5){id}&access_token='+data_account_token[0].db.access_token;
							request(url_get, function(err, body, html){
								if(err) return err

								var obj_html = JSON.parse(html)

								if(obj_html.home)
								{
									async.forEachLimit(obj_html.home.data, 1, (obj_html_data, next2)=>{
										if(!data_account.db.ds_chan)
											like(data_account, obj_html_data, data_account_token, ()=>next2())
										else
										{
											sosanh_id(data_account.db.ds_chan, obj_html_data.id, (err)=>{
												if(err == true)
													like(data_account, obj_html_data, data_account_token, ()=>next2())
												else
												{
													next2()
													return console.log('Da chan: '+obj_html_data.id)
												}
											})
										}
									},()=>next1())
								}
								else
									if(obj_html.error.code == 190)
									{
										get_token(data_account_token[0].db.cookie, data_account_token[0].db.link_profile, (err, token)=>{
											if(err)
											{
												console.log('1')
												mongoClient.connect(configDB.url, function(err, row1) {
													if (err) return console.log(err);
													var auto_camxuc = row1.collection('auto_camxuc');
													auto_camxuc.update({'db.id':data_account.db.id}, {$set:{'db.trangthai': 0}},(err, row)=>{
														row1.close()
													})
												});
												console.log(err)
												return next1()
											} 
												

											var update_token = row1.collection('accounts_facebook_messenger');
											update_token.updateOne({'db.id':data_account.db.id_account}, {$set: { 'db.access_token': token}}, function (err,row) {
												if (err) return console.log(err)
												next1()
											})
										})
									}
							})
						})
						},()=>row1.close())
					}
					else
					{
						row1.close()
						return console.log('Auto like Chua co ai dung')
					}
				})
		});
	}catch(e)
	{
		return console.log(e.messsage)
	}
	
// },10000)

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

function like(data_account, obj_html_data, data_account_token, callback)
{
	xulyidpost(data_account.db.id_account, obj_html_data.id, function(log){
		if(log == true)
			if(typeof data_account.db.camxuc == 'string')
				sent_request(data_account.db.id,obj_html_data.id, data_account.db.camxuc, data_account_token[0].db.access_token, ()=>callback())
			else
				sent_request(data_account.db.id,obj_html_data.id, random_reactions(data_account.db.camxuc), data_account_token[0].db.access_token, ()=>callback())
		else
			callback()
	})
}

function sent_request(id, id_post, type, access_token, callback)
{
	// setTimeout(()=>{
		var url_post = 'https://graph.facebook.com/v2.10/'+id_post+'/reactions?type='+type+'&access_token='+access_token;
		request({
			url: url_post,
			method: 'post'
		},function(err, body, html){
			if(err) return console.log(err)

			var obj_html_err = JSON.parse(html)

			if(obj_html_err.error)
			{
				console.log(obj_html_err)
				if(obj_html_err.error.code == 368)
				{
					mongoClient.connect(configDB.url, function(err, row1) {
						if (err) return console.log(err);
						var auto_camxuc_idposst = row1.collection('auto_camxuc');
						auto_camxuc_idposst.update({'db.id':id}, {$set:{'db.trangthai': 0}},(err, row)=>{
							row1.close()
						})
					});
				}
				return callback()
			}
			if(obj_html_err.success)
			{
				try{
					mongoClient.connect(configDB.url, function(err, row1) {
						var auto_camxuc_idposst = row1.collection('auto_camxuc');

						auto_camxuc_idposst.update({'db.id':id}, {$push:{'db.id_post': id_post}},(err, row)=>{
							if(err){
								row1.close()
								callback()
								return	console.log(err)
							}
							console.log(new Date(new Date().getTime())+' - Đã like: '+id_post)
							callback()
							row1.close()
						})
					});
				}
				catch(e){
					callback()
					return console.log(e.message)
				}
				
			}
		})
	// },5000*random_time())
}

function xulyidpost(user, id, callback)
{
	try{
		mongoClient.connect(configDB.url, function(err, row1) {
			if (err) return console.log(err);

			var ds_banbe = row1.collection('accounts_facebook_messenger')
			ds_banbe.find({'db.id': user, 'db.ds_banbe.id': id.split('_')[0]}).toArray((err, data_banbe)=>{
				if(err) return console.log(err)

				if(data_banbe.length > 0)
				{
					var auto_camxuc_idposst = row1.collection('auto_camxuc');
			
					auto_camxuc_idposst.find({'db.id_post':id, 'db.id_account':user}).toArray((err, data)=>{
						if(err) return console.log(err)

						if(data.length > 0)
						{
							if(data[0].db.id_post.length > 300)
								auto_camxuc_idposst.update({'db.id_account':user}, {$set:{'db.id_post': [id]}},(err, row)=>{
									row1.close()
								})
							console.log(new Date(new Date().getTime())+' - Trùng : '+id)
							return callback(false)
						}
						else
						{
							row1.close()
							return callback(true)
						}
					})
				}
				else
				{
					row1.close()
					console.log('Không phải bạn bè: '+ id.split('_')[0])
					return callback(false)
				}
			})
		});
	}
	catch(e){
		callback(true)
	}
}

function sosanh_id(id1, id2, callback)
{
	var id2 = id2.split('_')

	
	if(id1.indexOf(id2[0]) != -1)
	{
		return callback(false)
	}
	else
	{
		return callback(true)
	}
}

function random_reactions(text)
{
	return text[Math.floor((Math.random() * text.length) + 0)]
}

function random_time()
{
	return Math.floor((Math.random() * 10) + 5)
}