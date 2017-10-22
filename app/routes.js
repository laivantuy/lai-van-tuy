var path = require('path');
var async = require('async');
var thongbao = {
    avata : 'a',
    password : 'a',
    user : 'a'
}

module.exports = function(app, passport, multer, hoangtien,io) {
    //My_Router
    app.get('/profile/edit', isLoggedIn,function(req, res) {
        thongbao = {
            avata : 'a',
            password : 'a',
            user : 'a'
        }
        res.render('./profile/edit_profile.ejs', {
            thongbao : thongbao,
            user : req.user
        });
    });

    app.post('/profile/delete_lichdangbai', isLoggedIn, (req, res)=>{
        hoangtien.delete_lichdangbai(req.body, (err)=>{
            if(err == true)
            {
                hoangtien.find_clone_messenger(req.user, function(err, data_accounts){
                    hoangtien.find_tukhoa(req.user, function(err, text, data2){
                        res.render('./profile/lichdangbai.ejs', {
                        thongbao : text,
                        ds_accclone: data_accounts,
                        form_tukhoa: data2,
                        user : req.user
                        });
                    })
                })
            }
        })
    })

    app.get('/profile/lichdangbai', isLoggedIn, function(req, res){
        hoangtien.find_clone_messenger(req.user, function(err, data_accounts){
            hoangtien.find_tukhoa(req.user, function(err, text, data2){
                res.render('./profile/lichdangbai.ejs', {
                thongbao : text,
                ds_accclone: data_accounts,
                form_tukhoa: data2,
                user : req.user
                });
            })
        })
    })

    //Xử lý lên lịch đăng bài
    app.post('/profile/lenlichdangbai_groups', isLoggedIn, function(req, res){
        hoangtien.lenlichdangbai_groups(req.user, req.body, (err)=>{
            if(err==true)
            {
                hoangtien.find_clone_messenger(req.user, function(err, data_accounts){
                    hoangtien.find_tukhoa(req.user, function(err, text, data2){
                        res.render('./profile/lenlichdangbai_groups.ejs', {
                        thongbao : text,
                        ds_accclone: data_accounts,
                        form_tukhoa: data2,
                        user : req.user
                        });
                    })
                })
            }
        })
    })

    //Lên lịch đăng bài
    app.get('/profile/lenlichdangbai_groups', isLoggedIn, function(req, res){
        hoangtien.find_clone_messenger(req.user, function(err, data_accounts){
            hoangtien.find_tukhoa(req.user, function(err, text, data2){
                res.render('./profile/lenlichdangbai_groups.ejs', {
                thongbao : text,
                ds_accclone: data_accounts,
                form_tukhoa: data2,
                user : req.user
                });
            })
        })
    })

    //Xử lý trạng thái chúc mừng sinh nhật
    app.post('/profile/auto_chucmungsinhnhat', isLoggedIn, function(req, res){
        hoangtien.trangthai_auto_chucmungsinhnhat(req.user, req.body, function(err, data){
            hoangtien.find_clone_messenger(req.user, function(err, data_accounts){
                res.render('./profile/auto_chucmungsinhnhat.ejs', {
                    thongbao : null,
                    ds_accclone: data_accounts,
                    user : req.user
                });
            })
        })
        console.log(req.body)
    })

    //Auto chúc mừng sinh nhật
    app.get('/profile/auto_chucmungsinhnhat', isLoggedIn, function(req, res){
        hoangtien.find_clone_messenger(req.user, function(err, data_accounts){
            res.render('./profile/auto_chucmungsinhnhat.ejs', {
                thongbao : null,
                ds_accclone: data_accounts,
                user : req.user
            });
        })
    })

    //Xử lý trạng thái auto cảm xúc
    app.post('/profile/auto_camxuc', isLoggedIn, function(req, res){
        hoangtien.trangthai_auto_camxuc(req.user, req.body, function(err, trangthai){
            hoangtien.find_clone_messenger(req.user, function(err, data_accounts){
                res.render('./profile/auto_camxuc.ejs', {
                    thongbao : null,
                    trangthai : trangthai,
                    ds_accclone: data_accounts,
                    user : req.user
                });
            })
        })
    })

    //Auto cảm xúc
    app.get('/profile/auto_camxuc', isLoggedIn, function(req, res){
        hoangtien.find_clone_messenger(req.user, function(err, data_accounts){
            res.render('./profile/auto_camxuc.ejs', {
                thongbao : null,
                ds_accclone: data_accounts,
                user : req.user
            });
        })
    })

    //Cập nhật config_sdt
    app.post('/profile/bot_messenger_config_quetsdt', isLoggedIn, function(req, res){
        hoangtien.bot_messenger_config_quetsdt(req.user, req.body, function(err, text, data){
            hoangtien.find_tukhoa(req.user, function(err, text, data2){
                    res.render('./profile/bot_messenger_setup.ejs', {
                    thongbao : text,
                    ds_accclone: data,
                    form_tukhoa: data2,
                    user : req.user
                });
            })
        })
        console.log(req.body)
    })

    //Cập nhật từ khóa cho account
    app.post('/profile/bot_messenger_capnhattk', isLoggedIn,function(req, res){
        hoangtien.add_tukhoa_to_account(req.user, req.body.id_account, req.body.tukhoa, function(err, text, data){
            hoangtien.find_tukhoa(req.user, function(err, text, data2){
                    res.render('./profile/bot_messenger_setup.ejs', {
                    thongbao : text,
                    ds_accclone: data,
                    form_tukhoa: data2,
                    user : req.user
                });
            })
        })
    })

    //Xử lý trạng thái
    app.post('/profile/bot_messenger_trangthai', isLoggedIn, function(req, res){
        if(req.body.trangthai == 1)
        {
            hoangtien.on_bot_messenger(req.user, req.body.id, function(err, text, data){
                hoangtien.find_tukhoa(req.user, function(err, text, data2){
                        res.render('./profile/bot_messenger_setup.ejs', {
                        thongbao : text,
                        ds_accclone: data,
                        form_tukhoa: data2,
                        user : req.user
                    });
                })
            })
        }
        else
        {
            hoangtien.off_bot_messenger(req.user.local.email, req.body.id, function(err, text, data){
                hoangtien.find_tukhoa(req.user, function(err, text, data2){
                        res.render('./profile/bot_messenger_setup.ejs', {
                        thongbao : text,
                        ds_accclone: data,
                        form_tukhoa: data2,
                        user : req.user
                    });
                })
            })
        }
    })

    //Kích hoạt messenger
    app.get('/profile/bot_messenger_setup', isLoggedIn, function(req, res){
        hoangtien.find_clone_messenger(req.user, function(err, data_accounts){
            hoangtien.find_tukhoa(req.user, function(err, text, data2){
                    res.render('./profile/bot_messenger_setup.ejs', {
                    thongbao : text,
                    ds_accclone: data_accounts,
                    form_tukhoa: data2,
                    user : req.user
                });
            })
        })
    })

    //Xóa từ khóa
    app.post('/user/bot_messenger_deletetukhoa', isLoggedIn, function(req, res){
        hoangtien.delete_tukhoa(req.user, req.body, function(err, text, data){
            res.render('./user/bot_messenger_dstukhoa.ejs', {
                thongbao : text,
                user : req.user,
                data : data
            });
        })
    })

    //Xử lý danh sách từ khóa được gửi lên server
    app.post('/user/bot_messenger_dstukhoa', isLoggedIn, function(req, res){
        req.body.ds_tukhoa = change_tukhoa(req.body.ds_tukhoa);
        req.body.ds_cautraloi = change_tukhoa(req.body.ds_cautraloi);
        req.body.id = guidGenerator();
        req.body.id_user_local = req.user.local.id;

        hoangtien.add_tukhoa(req.body, function(err, text, data){
            if(err)
                return err;

            res.render('./user/bot_messenger_dstukhoa.ejs', {
                id_account: req.body.id_account,
                thongbao : text,
                user : req.user,
                data : data
            });
        })
    })

    //Danh sách từ khóa /profile/bot_messenger_dstukhoa
    app.get('/user/bot_messenger_dstukhoa/', isLoggedIn, function(req, res){
        hoangtien.find_tukhoa(req.user, function(err, text, data){
            if(err)
                return err;
            res.render('./user/bot_messenger_dstukhoa.ejs', {
                id_account: req.params.id,
                thongbao : text,
                user : req.user,
                data : data
            });
        })
    })

    //Xóa tài khoản clone bot_messenger_delete
    app.post('/profile/bot_messenger_delete', isLoggedIn,function(req, res){
        hoangtien.delete_clone_messenger(req.user, req.body.id,function(err,text,data){
                res.render('./profile/ds_accounts.ejs', {
                    thongbao : text,
                    ds_accclone: data,
                    user : req.user
            })
        })
    })

    //Cài đặt tài khoản tự động trả lời messenger

    //Danh sách tài khoản clone
    app.get('/profile/ds_accounts', isLoggedIn,function(req, res) {
        hoangtien.find_clone_messenger(req.user, function(err, data){
            res.render('./profile/ds_accounts.ejs', {
                thongbao : null,
                ds_accclone: data,
                user : req.user
            });
        })
    });

    //Thêm tài khoản clone messenger /profile/bot_messenger/addclone
    app.post('/profile/bot_messenger/addclone', isLoggedIn, function(req, res) {
        hoangtien.login_facebook_messenger(req.user, req.body.cookie, function(fb,text,data){
                res.render('./profile/ds_accounts.ejs', {
                thongbao : text,
                ds_accclone: data,
                user : req.user
            })
        })
    })

    //Edit profile
    app.post('/profile/edit', isLoggedIn, function(req, res) {
        hoangtien.edit_profile(req.user._id, req.body.name, req.body.phone, req.body.gioitinh, req.body.id_facebook, function(data){
            if(data)
            {
                thongbao = {
                    avata : 'a',
                    password : 'a',
                    user : true
                }
                res.render('./profile/edit_profile.ejs', {
                    thongbao : thongbao,
                    user : req.user
                });
            }
        });
    });

    //Up Avata
    app.post("/profile/upload_ava", isLoggedIn,function(req, res) {
        var storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, './public/image_ava/');
            },
            filename: function (req, file, cb) {
                cb(null, req.user._id+path.extname(file.originalname));
            }
        })

        var upload = multer({storage:storage}).single('image_ava');

        upload(req,res,function(err){
            if(err){
                res.status(500).json({'success':false});
                return;
            }
            if(req.file)
            {
                thongbao.avata = true
                hoangtien.addava(req.user._id, req.file.path, function(){
                    res.render('./profile/edit_profile.ejs', {
                        thongbao : thongbao,
                        user : req.user
                    });
                }); 
            }
            else
            {
                thongbao.avata = false
                res.render('./profile/edit_profile.ejs', {
                    thongbao : thongbao,
                    user : req.user
                });
            }
        });
    });
    //End Up Avata

    //Đổi mất khẩu
    app.post("/profile/doimatkhau", isLoggedIn, function(req, res){
        hoangtien.doimatkhau(req.body.matkhaucu, req.body.matkhaumoi, req.user._id, function(data){
            if(data)
            {
                thongbao.password =  true
                res.render('./profile/edit_profile.ejs', {
                    thongbao : thongbao,
                    user : req.user
                });
            }
            else
            {
                thongbao.password =  false
                res.render('./profile/edit_profile.ejs', {
                    thongbao : thongbao,
                    user : req.user
                });
            }
        })
    })
    //End đổi mật khẩu
    app.get('/hd_getcookie', function(req, res) {
        res.render('./page/huowngdan_getcookie');
    });

    //Trang admin
    app.post('/admin/off_user_messenger', isLoggedIn, function(req,res){
        hoangtien.admin_off_user_messenger(req.body.id_user_local, function(err, text){
            res.send(text)
        })
    })

    app.get('/admin', isLoggedIn, function(req, res){
        if(req.user.level==0)
        {
            res.render('./admin.ejs', {
                thongbao : thongbao,
                user : req.user
            });
        }
        else
            res.redirect('/')
    })
// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        console.log('Co ket noi: '+req.ip)
        res.render('index.ejs');

        io.on('connection', function(socket){
            console.log('a user connected'+ socket.id);
            //socket.on > lắng nghe thông điệp >> 1111
            socket.on('chat message', function(msg){
                console.log('message: ' + msg);
                //server ::emit gửi thông điệp cho tất cả client >> 2222
                socket.emit('chat message',msg);
                //socket.broadcast.emit('chat message', msg);
                io.to("w0VDgMp-iN6ktOBAAAAC").emit('chat message', msg);
            });
        
            socket.on('disconnect', function(){
                console.log('user disconnected'+socket.id);
            });
        }); 

    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('./profile/profile.ejs', {
            user : req.user
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('./login/login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            hoangtien.find_user((data_user)=>{
                if(data_user.length>35)
                    res.send('Số tài khoản đã vượt quá 20 tài khoản, mong bạn đợi lần test sau.<a class="navbar-brand" href="/profile">Quay về trang chủ</a>')
                else
                    res.render('./login/signup.ejs', { message: req.flash('signupMessage') });
            })
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile/edit', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

        // handle the callback after facebook has authenticated the user
        app.get('/auth/facebook/callback',
            passport.authenticate('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/auth/twitter', passport.authenticate('twitter', { scope : 'email' }));

        // handle the callback after twitter has authenticated the user
        app.get('/auth/twitter/callback',
            passport.authenticate('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

        // the callback after google has authenticated the user
        app.get('/auth/google/callback',
            passport.authenticate('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
// =============================================================================

    // locally --------------------------------
        app.get('/connect/local', function(req, res) {
            res.render('connect-local.ejs', { message: req.flash('loginMessage') });
        });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/connect/local', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

    // facebook -------------------------------

        // send to facebook to do the authentication
        app.get('/connect/facebook', passport.authorize('facebook', { scope : 'email' }));

        // handle the callback after facebook has authorized the user
        app.get('/connect/facebook/callback',
            passport.authorize('facebook', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

    // twitter --------------------------------

        // send to twitter to do the authentication
        app.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));

        // handle the callback after twitter has authorized the user
        app.get('/connect/twitter/callback',
            passport.authorize('twitter', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));


    // google ---------------------------------

        // send to google to do the authentication
        app.get('/connect/google', passport.authorize('google', { scope : ['profile', 'email'] }));

        // the callback after google has authorized the user
        app.get('/connect/google/callback',
            passport.authorize('google', {
                successRedirect : '/profile',
                failureRedirect : '/'
            }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.facebook.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function(req, res) {
        var user           = req.user;
        user.twitter.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function(req, res) {
        var user          = req.user;
        user.google.token = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

    // Handle 404 - Keep this as a last route
    app.use(function(req, res, next) {
        res.status(404).send('Không có trang');
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}


function change_tukhoa (text)
{
    var str = text
    str= str.replace(/,/g," | ");
    return str;
}
function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
