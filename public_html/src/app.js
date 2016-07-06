var Sequelize = require('sequelize')
var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var session = require('express-session')
app.use(bodyParser.urlencoded ({extended: false}));
app.use(express.static('./static'));

app.use(session({
	secret: 'oh wow very secret much security',
	resave: true,
	saveUninitialized: false
}));


var sequelize = new Sequelize('blog', 'postgres', "", { //ww op ""
	host: 'localhost',
	dialect: 'postgres',
        define: {
		timestamps: false
	}
});

var Register = sequelize.define('register', {
	username: Sequelize.TEXT,
	password: Sequelize.TEXT,
        email: Sequelize.TEXT
});

var Post = sequelize.define('post', {
	title: Sequelize.TEXT,
	bericht: Sequelize.TEXT,
        author: Sequelize.TEXT
});

var Comment = sequelize.define('comment',{
        comment: Sequelize.TEXT,
        author: Sequelize.TEXT
})

Register.hasMany(Post);
Post.belongsTo(Register);
Post.hasMany(Comment)
Comment.belongsTo(Post)




app.set ("views", "src/views");
app.set ("view engine","jade");


app.get('/logout', function (request, response) {
	request.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		response.redirect('index');
	})
});


app.get('/index', function (request, response){
    response.render('index')
})

app.get('/login', function (request, response){
    response.render('login')
})

app.get('/', function (request, response){
    response.render('index')
})

app.get('/register', function (request, response){
    response.render('register')
})

app.get('/homepage', function (request,response){
   	var user = request.session.user;
	if (user === undefined) {
		response.redirect('index');
	} else {
		response.render('homepage');
	}
})

app.get('/post',function (request,response){
      	var user = request.session.user;
	if (user === undefined) {
		response.redirect('index');
	} else {
		response.render('post');
	}
})

app.get('/wall',function(request,response){
    	var user = request.session.user;
	if (user === undefined) {
		response.redirect('index');
	} else {
            Post.findAll({include:[Register,Comment]}).then(function(theposts){
                //response.send(theposts)
                response.render('wall',{ blog : theposts});
            })
         
	}
})

app.post('/post',function (request,response){
    Register.findOne({
        where: {
            id: request.session.user.id
        }
    }).then(function(theuser){
        theuser.createPost({
           title: request.body.title ,
           bericht: request.body.body,
           author: request.session.user.username
        }).then(function(thepost){
               response.redirect ("/wall")
        })
    }) 
})


app.get('/ownpost',function(request,response){
    
       	var user = request.session.user;
	if (user === undefined) {
		response.redirect('index');
	} else {
            
		Post.findAll({
                     where: {
                     registerId: request.session.user.id
             }
                }).then(function(theposts){

                response.render('ownpost',{ blog : theposts});
              
            })
	}  
})





app.post("/register",function(request,response){
    
	Register.create({
            username: request.body.username,
            password: request.body.password,
            email: request.body.email
	}).then(function(){
                response.render('index')
        })
})

app.post("/login", function (request,response){
    if(request.body.username.length === 0) {
		response.redirect('login');
		return;
	}
        
    if(request.body.password.length === 0) {
		response.redirect('login');
		return;
	}
        
    Register.findOne({
		where: {
			username: request.body.username
		}
	}).then(function (user) {
		if (user !== null && request.body.password === user.password) {
			request.session.user = user;
			response.redirect('/homepage');
		} else {
			response.redirect('/login');
		}
	});
})

//app.post('/wall',function(request,response){
//        var user = request.session.user;
//	if (user === undefined) {
//		response.redirect('index');
//	} else {
//            Post.findOne({
//                where: {
//                    id: request.body.postid
//                   }
//            })
//            .then(function(thecomment){
//                thecomment.createComment({
//                comment: request.body.comment 
//            }).then(function(thepost){
//                 response.redirect ("/uniek?id=" + request.body.postid)
//            })
//        }) 
//    }
//})

app.post('/uniek',function(request,response){
           var user = request.session.user;
	if (user === undefined) {
		response.redirect('/index');
	} else { 
            Comment.create({
                postId: postid,
                author: request.session.user.username,
                comment: request.body.comment
            })
           response.redirect('uniek/' + postid)
    } 
})


app.get('/uniek/:postid',function(request,response){
    var user = request.session.user;
     postid = request.params.postid
    console.log(postid)
    
	if (user === undefined) {
		response.redirect('/index');
	} else {
            Post.findOne({
                where : {
                    id: postid
                },
                include:[Comment]
                
            }).then(function(thepost){
            response.render('uniek',{post : thepost})
            // response.send(thepost)
          // console.log(thepost)
            })
    }
})



sequelize.sync({force: false})
var server = app.listen(3000 , function (){
    
        console.log("example app listening on port : " + server.address().port)
})
