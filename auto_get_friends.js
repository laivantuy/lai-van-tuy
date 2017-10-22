//Auto cảm xúc
var mongoClient = require('mongodb').MongoClient;
var request = require('request');
var configDB = require('./config/database.js');
var fs = require('fs');
const login = require("facebook-chat-api");
var async = require('async');
var database = require("./node_modules/hoangtien_getinfo.js");

console.log('auto_get_friends.js on Start');

// setInterval(function(){
	mongoClient.connect(configDB.url, function(err, row1) {
		var accounts = row1.collection('accounts_facebook_messenger');
		var time = get_time()
		console.log(time)
		accounts.find({}).toArray(function (err, data_accounts) {
			if(err)	return console.log(err)

			if(data_accounts.length > 0)
			{
				async.forEachLimit(data_accounts, 1, (value_account, next_one) => {
					console.log("-------"+value_account.db.id+"------");
					
					var url = 'https://graph.facebook.com/v2.10/me?fields=friends.limit(5000)&access_token='+value_account.db.access_token

					request(url,(err, body, html)=>{
						if(err) return	console.log(err)

						var obj_html = JSON.parse(html)
						console.log(obj_html.friends)
						if(obj_html.error)
						{
							next_one()
						}
						else
						{
							console.log(obj_html.friends.data)
							accounts.update({'db.id':value_account.db.id},{$set:{'db.ds_banbe':obj_html.friends.data}})
							next_one()
						}
					})

					console.log("--------------");
				},()=>console.log('end'))
			}
			else
				return console.log('AUTO_CMSN Chua co ai dung')
		})
	});
// },60000*2)

function xulycautraloi (text)
{
	var str = text
	str= str.split(",");
	return str;
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

function random_reactions(text)
{
	return text[Math.floor((Math.random() * text.length) + 0)]
}

function get_time()
{
	var d = new Date();
	var h = d.getHours();
	var p = d.getMinutes();

	return h*3600+p*60
}