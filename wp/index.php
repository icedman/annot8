<?php
/*
Plugin Name: Annot8
Description:
Version: 1
Author: Marvin Sanchez
Author URI: http://lawyerly.ph
*/

function annot8_init() {
    wp_register_script( 'annot8-main', plugins_url( '/annot8/dist/build.js', __FILE__ ));
    wp_register_script( 'annot8-main', plugins_url( '/annot8/dist/build.js', __FILE__ ));
    // wp_register_style( 'annot8-css', plugins_url( '/annot8.css', __FILE__ ) );
}

function annot8_enqueue_scripts()
{
    // wp_enqueue_script( 'annot8-main' );
    // wp_enqueue_style( 'annot8-css' );
}

function annot8_print_scripts() {
    // require_once('scripts.html');
    // require_once('twitter.html');
?>
<div id="annot8-app"></div>
<script src="<?php echo plugins_url( '/annot8/wp/storage.js', __FILE__ )?>"></script>
<script>
var annot8Config = {
  docid: window.location.href,
  selector: ['article .entry-content', '.entry-content'],
  debug: true,
  svg: false,
  source: {
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
    { action:annot8FB,    title:'Facebook',  icon:'#si-awesome-facebook', tool: 'edit' },
    { action:annot8Comment, title:'Comment', icon:'#si-awesome-comment',  tool: 'edit' }, // not ready
    { action:'erase',     title:'Erase',     icon:'#si-bootstrap-erase',  tool: 'edit' }
  ]
};
</script>
<?php
    wp_print_scripts('annot8-main');
}

add_action('init', 'annot8_init' );
add_action('wp_enqueue_scripts', 'annot8_enqueue_scripts' );
add_action('wp_footer', 'annot8_print_scripts');

