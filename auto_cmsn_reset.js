var CronJob = require('cron').CronJob;
var mongoClient = require('mongodb').MongoClient;
var async = require('async');
var configDB = require('./config/database.js');

console.log('AUTO_CMSN_Rs on Start');

var job = new CronJob({
	cronTime: '00 00 00 * * *',
	onTick: function() {
	  	mongoClient.connect(configDB.url, function(err, db) {
	  		
	  		var cmsn = db.collection('auto_chucmungsinhnhat');

	  		cmsn.find({'db.trangthai':'done'}).toArray((err, data_accounts)=>{
	  			if(err) return console.log(err)

	  			async.forEachLimit(data_accounts, 1, (value_account, next)=>{
	  				cmsn.update({'db.id':value_account.db.id}, {$set:{'db.trangthai':1}})
	  				next()
	  			},()=>{
	  				console.log('Đã rs ngày: '+ new Date(new Date().getTime()))
	  				db.close()
	  			})
	  		})
  		});
	},
	start: true,
	timeZone: 'Asia/Ho_Chi_Minh'
});