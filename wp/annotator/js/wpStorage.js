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
// wordpress storage
function annot8Create(http, annotations, annotation) {
  var annot = Object.assign({},annotation);
  annot.range = JSON.parse(annot.range);
  var comment = annot.quote;
  var url = window.location.origin + '/wp-json/annotator/v1/annotations';
  http({
    method:'POST',
    url:url, 
    headers: {
        'X-WP-Nonce': annot8Config.nonce
    },
    params: {
        post: annot8Config.postid,
        annotation: annot,
        content: comment,
        comment_type: 'annotation'
    }
    })
    .then(function(response) {
        console.log(response);
    })
    .catch(err=>{
        console.log(err);
    });

  return Promise.resolve();
}

function annot8Read(http) {
  var url = window.location.origin + '/wp-json/annotator/v1/annotations';
  var promise = new Promise(function(resolve, reject) {

    http({
        method:'GET',
        url:url,
        headers: {
        'X-WP-Nonce': annot8Config.nonce
        },
        params: {
        post: annot8Config.postid,
        comment_type: 'annotation'
      }})
      .then(function(response) {
        var annotations = [];
        response.data.forEach(comment=>{
            var annotationRaw = comment['meta']['Annotator_Plugin_annotation'][0];
            try {
                var annotation = JSON.parse(annotationRaw);
                annotation.comment = comment['comment_content'];
                annotation.author = comment['comment_author'];
                annotation.author_email = comment['comment_author_email'];
                annotation.created = comment['comment_date'];
                annotation.comment_id = comment['comment_ID'];
                annotation.range = JSON.stringify(annotation.range);
                annotations.push(annotation);
            } catch(e) {
                console.log('skipped...' + annotationRaw);
            }
            // console.log(annotations);
            return resolve(annotations);
        });
      })
      .catch(err=>{
        reject(err);
    });

  });

  return promise;
}
function annot8Update(http, annotations, annotation) {
  var annot = Object.assign({},annotation);
  annot.range = JSON.parse(annot.range);
  annot.rects = [];
  var comment = annot.comment || ''; //annot.quote;
  var url = window.location.origin + '/wp-json/annotator/v1/annotations';

  http({
    method:'PUT',
    url:url, 
    headers: {
        'X-WP-Nonce': annot8Config.nonce
    },
    params: {
        id: annot.comment_id,
        annotation: annot,
        content: comment
    }
    })
    .then(function(response) {
        console.log(response);
    })
    .catch(err=>{
        console.log(err);
    });

  return Promise.resolve();
}
function annot8Delete(http, annotations, annotation) {
  var annot = Object.assign({},annotation);
  var url = window.location.origin + '/wp-json/annotator/v1/annotations';

  http({
    method:'DELETE',
    url:url, 
    headers: {
        'X-WP-Nonce': annot8Config.nonce
    },
    params: {
        id: annot.comment_id
    }
    })
    .then(function(response) {
        console.log(response);
    })
    .catch(err=>{
        console.log(err);
    });

  return Promise.resolve();
}