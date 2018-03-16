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

    // local storage
    var currentAnnotationId = 0;
    function annot8Create(http, annotations, annotation) {
      if (currentAnnotationId < annotations.length) {
        currentAnnotationId = annotations.length;
      }
      currentAnnotationId++;
      var id = 'a8-' + currentAnnotationId;
      annotation.id = currentAnnotationId;
      localStorage.setItem('a8-' + annot8Config.docid, JSON.stringify(annotations));
      return Promise.resolve();
    }
    function annot8Read(http) {
      var obj = JSON.parse(localStorage.getItem('a8-' + annot8Config.docid));
      return Promise.resolve(obj);
    }
    function annot8Update(http, annotations, annotation) {
      console.log(annotations);
      localStorage.setItem('a8-' + annot8Config.docid, JSON.stringify(annotations));
      return Promise.resolve();
    }
    function annot8Delete(http, annotations, annotation) {
      localStorage.setItem('a8-' + annot8Config.docid, JSON.stringify(annotations));
      return Promise.resolve();
    }

    var annot8Config = {
      docid: window.location.href,
      selector: ['article'],
      debug: true,
      svg: false,
      source: {
        baseUrl: window.location.origin,
        create: annot8Create,
        read:   annot8Read,
        update: annot8Update,
        delete: annot8Delete,
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
