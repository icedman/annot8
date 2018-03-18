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
      localStorage.setItem('a8-' + annot8Config.docid, JSON.stringify(annotations));
      return Promise.resolve();
    }
    function annot8Delete(http, annotations, annotation) {
      localStorage.setItem('a8-' + annot8Config.docid, JSON.stringify(annotations));
      return Promise.resolve();
    }