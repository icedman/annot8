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
    wp_register_style( 'annot8-css', plugins_url( '/annot8.css', __FILE__ ) );
}

function annot8_enqueue_scripts()
{
    // wp_enqueue_script( 'annot8-main' );
    wp_enqueue_style( 'annot8-css' );
}

function annot8_print_scripts() {

?>   
<div id="annot8-app"></div>
<script>
var annot8Config = {
    selector: '.entry-content',
    debug: true
};
</script>
<?php
    wp_print_scripts('annot8-main');
?>
<style>
.annot8-toolbar {
    background-color: black;
}
</style>
<?php
}

add_action('init', 'annot8_init' );
add_action('wp_enqueue_scripts', 'annot8_enqueue_scripts' );
add_action('wp_footer', 'annot8_print_scripts');

