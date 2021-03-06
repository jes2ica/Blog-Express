
var crypto = require('crypto'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment = require('../models/comment.js')

exports.index = function(req, res) {
	//判断是否是第一页，并把请求的页数转换成number类型
	var page = req.query.p ? parseInt(req.query.p) : 1;
	//查询并返回第page页的10篇文章
	Post.getTen(null, page, function(err, posts, total) {
		if(err) {
			posts = [];
		}
		res.render('index', {
			title:'主页',
			posts: posts,
			page: page,
			isFirstPage: (page - 1) == 0,
			isLastPage: ((page - 1) * 10 + posts.length) == total,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
};

exports.reg = function(req, res){
	res.render('reg', { 
  	title: '注册',
  	user: req.session.user,
  	success: req.flash('success').toString(),
  	error: req.flash('error').toString() 
  });
};

exports.reg_post = function(req, res){
	var name = req.body.name,
			password = req.body.password,
			password_re = req.body['password-repeat'];

	//检验用户两次输入的密码是否一致
	if (password_re != password){
		req.flash('error', '两次输入的密码不一致！');
		return res.redirect('/reg');//返回注册页
	}

	//生成密码的md5值
	var md5 = crypto.createHash('md5'),
		  password = md5.update(req.body.password).digest('hex');
	var newUser = new User({
			name: name,
			password: password,
			email: req.body.email
	});

	//检查用户名是否已经存在
	User.get(newUser.name, function (err, user) {
		if (err) {
			req.falsh('error', err);
			return res.redirect('/');
		}
		if (user) {
			req.flash('error', '用户已存在!');
			return res.redirect('/reg');
		}
		//如果不存在则新增用户
		newUser.save(function (err, user) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/reg');//注册失败返回注册页
			}
			req.session.user = user;//用户信息存入session
			req.flash('success','注册成功');
			res.redirect('/');//注册成功后返回首页
		});

	});
};

exports.login = function(req, res){
  res.render('login', { 
  	title: '登录',
  	user: req.session.user,
  	success: req.flash('success').toString(),
  	error: req.flash('error').toString()
  });
};

exports.login_post = function(req, res){
	//生成密码的md5值
	var md5 = crypto.createHash('md5'),
		  password = md5.update(req.body.password).digest('hex');
	//检查用户是否存在
	User.get(req.body.name, function(err, user) {
		if(!user) {
			req.flash('error', '用户不存在！');
			return res.redirect('/login'); //用户不存在则跳转到登录页
		}
		//检查密码是否一致
		if(user.password != password) {
			req.flash('error', '密码错误!');
			return res.redirect('/login'); //密码错误则跳转到登录页
		}
		//用户名密码都匹配后，将用户信息存入session
		req.session.user = user;
		req.flash('success', '登录成功');
		res.redirect('/'); //登录成功后跳转到主页
	});
};

exports.post = function (req, res) {
  res.render('post', {
    title: '发表',      
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
};

exports.post_post = function(req, res){
	var currentUser = req.session.user,
			tags = [req.body.tag1, req.body.tag2, req.body.tag3],
			post = new Post(currentUser.name, currentUser.head, req.body.title, tags, req.body.post);
	post.save(function (err) {
		if(err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发布成功！');
		return res.redirect('/');//发表成功跳转到主页
	});
};

exports.logout = function(req, res){
	req.session.user = null;
	req.flash('success', '登出成功！');
	res.redirect('/'); //登出成功后跳转导主页
};

exports.upload = function(req, res) {
	res.render('upload', {
		title: '文件上传',
		user: req.session.user,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
};

exports.upload_post = function(req, res) {
	req.flash('success', '文件上传成功！');
	res.redirect('/upload');
};

exports.search = function(req, res) {
	Post.search(req.query.keyword, function (err, posts) {
		if(err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('search', {
			title: "SEARCH:" + req.query.keyword,
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
};

exports.user_posts = function(req, res) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	//检查用户是否存在
	User.get(req.params.name, function (err, user) {
		if(!user) {
			req.flash('error', '用户不存在！');
			return res.redirect('/'); //用户不存在则跳转到主页
		}

		//查询并返回该用户第page页的10篇文章
		Post.getTen(user.name, page, function(err, posts, total) {
			if(err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			res.render('user', {
				title: user.name, 
				posts: posts,
				page: page,
				isFirstPage: (page - 1) == 0,
				isLastPage: ((page - 1) * 10 + posts.length) == total,
				user: req.session.user,
				success: req.flash('success').toString(),
				error: req.flash('error').toString()
			});
		});
	});
};

exports.getPost = function(req, res) {
	Post.getOne(req.params._id, function(err, post) {
		if(err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('article', {
			title: post.title,
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
};

exports.addComment = function (req, res) {
	var date = new Date(),
			time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
						 date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

	var md5 = crypto.createHash('md5'),
			email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
			head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";

	var comment = {
		name: req.body.name,
		head: head,
		email: req.body.email,
		website: req.body.website,
		time: time,
		content: req.body.content
	};

	var newComment = new Comment(req.params._id, comment);
	newComment.save(function (err) {
		if(err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '留言成功！');
		res.redirect('back');
	});
};

exports.edit = function(req, res) {
	var currentUser = req.session.user;
	Post.edit(req.params._id, function(err, post) {
		if(err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		res.render('edit', {
			title: '编辑',
			post: post,
			user: req.session.user,
			success: req.flash('success').toString(),
			error:req.flash('error').toString()
		});
	});
};

exports.edit_post = function(req, res) {
	var currentUser = req.session.user;
	Post.update(req.params._id, req.body.post, function(err) {
		var url = encodeURI('/p/' + req.params._id);
		if(err) {
			req.flash('error', err);
			return res.redirect(url);//出错！返回文章页
		}
		req.flash('success', '修改成功！');
		res.redirect(url);//成功！返回文章页
	});
};

exports.remove = function(req, res) {
	var currentUser = req.session.user;
	Post.remove(req.params._id, function(err) {
		if(err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '删除成功！');
		res.redirect('/');
	});
};

exports.archive = function(req, res) {
	Post.getArchive(function (err, posts) {
		if(err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('archive', {
			title: '存档',
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
};

exports.tags = function(req, res) {
	Post.getTags(function (err, posts) {
		if(err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('tags', {
			title: "标签",
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
};

exports.tag = function(req, res) {
	Post.getTag(req.params.tag, function (err, posts) {
		if(err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		res.render('tag', {
			title: 'TAG:' + req.params.tag,
			posts: posts,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
};

exports.checkLogin = function(req, res, next) {
  if(!req.session.user) {
    req.flash('error', '未登录!');
    return res.redirect('/login');
  }
  next();
};

exports.checkNotLogin = function(req, res, next) {
	if(req.session.user) {
    req.flash('error', '已登录!');
    return res.redirect('back');
  }
  next();
};