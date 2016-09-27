var Sequelize = require('sequelize');
var db = new Sequelize('postgres://localhost:5432/wikistack');
var marked = require('marked');
var Page = db.define('page', {
	title: {
		type: Sequelize.STRING, allowNull: false, defaultValue: 'New Page'
	},
	urlTitle: {
		type: Sequelize.STRING, allowNull: false
	},
	content: {
		type: Sequelize.TEXT, allowNull: false, defaultValue: 'This hasn\'t been written yet'
	},
	status: {
		type: Sequelize.ENUM('open', 'closed')
	},
    date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    },
    tags: {
        type: Sequelize.ARRAY(Sequelize.TEXT)
    }
}, {
    hooks: {
      beforeValidate: function(page, options){
          if (page.title){
            page.urlTitle = page.title.replace(/\s+/g, '_').replace(/\W/g, '');
          } else {
            page.urlTitle = Math.random().toString(36).substring(2, 7);
          }
        }
    },
    getterMethods: {
        pageRoute: function(){return '/wiki/' + this.urlTitle},
        renderedContent: function(){
            return marked(this.content);
        }
    },
    classMethods: {
        findByTag: function(tag){
            return Page.findAll({
                where:{
                    tags:{
                        $overlap:[tag]
                    }
                }
            });
    }
    },
    instanceMethods: {
        findSimilar: function(){
            return Page.findAll({
                where:{
                    tags:{
                        $overlap:this.tags
                    },
                    id:{
                        $ne:this.id
                    }
                }
            });
        }

    }
 });

var User = db.define('user', {
	name: {
		type: Sequelize.STRING, allowNull: false, defaultValue: 'New User'
	},
	email: {
		type: Sequelize.STRING, allowNull: false, isEmail: true, defaultValue: 'email@email.com'
	}
});

Page.belongsTo(User, { as: 'author' });

module.exports = {
	Page: Page,
	User: User
};
