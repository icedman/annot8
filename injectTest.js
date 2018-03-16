function annot8Tweet(annotation) {
      var shareLink = document.querySelector('#annot8_twitter_link');
      var url = encodeURIComponent(window.location.href);
      var text = encodeURI(annotation.quote.substring(0,120));
      var href = "https://twitter.com/intent/tweet?text=" + text + "&url=" + url;
      shareLink.href = href;
      setTimeout(function() {
        shareLink.click();
      }, 50);
    }
    function annot8FB(annotation) {
      var shareLink = document.querySelector('#annot8_facebook_link');
      var url = encodeURIComponent(window.location.href);
      var text = encodeURI(annotation.quote.substring(0,120));
      var href = "https://facebook.com/sharer/sharer.php?u=" + url;
      shareLink.href = href;
      setTimeout(function() {
        shareLink.click();
      }, 50);
    }
    function annot8Comment(annotation) {
      console.log(annotation);
    }
    var annot8Config = {
      selector: ['article .entry-content', 'article'],
      debug: true,
      svg: false,
      source: {
        baseUrl: window.location.origin,
        create: '',
        read: '',
        update: '',
        delete: '',
      },
      buttons: [
        { action:'annotate',  title:'Highlight', icon:'#si-entypo-brush',     tool: 'create' },
        { action:'tags',      title:'Tag', icon:'#si-awesome-tags',   tool: 'create' },

        { action:'tags',      title:'Tag', icon:'#si-awesome-tags',   tool: 'tags' },
        { action:'annotate',  title:'Tag', icon:'#si-awesome-tag',    tool: 'tags', tag: '' },
        { action:'annotate',  title:'Tag', icon:'#si-awesome-tag',    tool: 'tags', tag: 'tag1' },
        { action:'annotate',  title:'Tag', icon:'#si-awesome-tag',    tool: 'tags', tag: 'tag2' },
        { action:'annotate',  title:'Tag', icon:'#si-awesome-tag',    tool: 'tags', tag: 'tag3' },
        { action:'annotate',  title:'Tag', icon:'#si-awesome-tag',    tool: 'tags', tag: 'tag4' },
        { action:'annotate',  title:'Tag', icon:'#si-awesome-tag',    tool: 'tags', tag: 'tag5' },
        // { action:'annotate',  title:'Tag', icon:'#si-awesome-underline', tool: 'tags', tag: 'tag6' },

        { action:'tags',      title:'Tag',       icon:'#si-awesome-tags',     tool: 'edit' },
        { action:annot8Tweet, title:'Tweet',     icon:'#si-awesome-twitter',  tool: 'edit' },
        // { action:annot8FB,    title:'Facebook',  icon:'#si-awesome-facebook', tool: 'edit' },
        { action:annot8Comment, title:'Comment', icon:'#si-awesome-comment',  tool: 'edit' },
        { action:'annotate',  title:'Erase',     icon:'#si-bootstrap-erase',  tool: 'edit' }
      ]
    };
var script = document.createElement("script");
  script.setAttribute("src", "https://appsmart-contracts.firebaseapp.com/dist/build.js");
  document.body.appendChild(script);

/*
var script = document.createElement("script");
  script.setAttribute("src", "https://appsmart-contracts.firebaseapp.com/injectTest.js");
  document.body.appendChild(script);
*/
