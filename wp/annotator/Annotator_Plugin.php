<?php

include_once('Annotator_LifeCycle.php');

define('HIGHLIGHT_COlORS_COUNT', 5);

class Annotator_Plugin extends Annotator_LifeCycle {

    /**
     * See: http://plugin.michael-simpson.com/?page_id=31
     * @return array of option meta data.
     */
    public function getOptionMetaData() {
        //  http://plugin.michael-simpson.com/?page_id=31
        return array(
//'_version' => array('Installed Version'), // Leave this one commented-out. Uncomment to test upgrades.

'GlobalAnnotation' => array(
    'Global Annotation',
    [ 'type'=>'checkbox', 'description'=>'Allow annotations globally on all Pages or Posts. Otherwise, use the shortcode <strong style="background-color:yellow">[annotate]</strong> to enable annotation on a single Page or Post.',
        'default'=>'on' ]),
'Storage' => array(
    __('Data Storage', 'annotator_plugin'),
    [ 'description'=>'Local storage allow users to save annotations on their local browser storage. Server database allow users to upload and share their annotations as <strong>comments</strong>.',
        'default'=>'Local Storage',
        'options'=> ['Local Storage','Server Database'] ]
),
'TagSelect' => array(
    'Highlight by Tag',
    [ 'type'=>'checkbox', 'description'=>'Enable tag selection with each tag assigned with a highlight color.', 'default'=>'on' ]),
'ColorTag1' => array(
    __('Tag Colors', 'annotator_plugin'),
    [ 'description' => 'Set ' . HIGHLIGHT_COlORS_COUNT . ' tag highlight colors. Clear the color to disable the tag.','class'=>'color-field',  'default'=>'#FFFF00' ]
),
'ColorTag2' => array(
    '',
    [ 'class'=>'color-field', 'default'=>'#B4FFB4' ] 
),
'ColorTag3' => array(
    '',
    [ 'class'=>'color-field', 'default'=>'#8080FF' ] 
),
'ColorTag4' => array(
    '',
    [ 'class'=>'color-field', 'default'=>'#B428FF' ] 
),
'ColorTag5' => array(
    '',
    [ 'class'=>'color-field', 'default'=>'#FF0000' ] 
),
// 'ColorTag6' => array(
//     '',
//     [ 'class'=>'color-field', 'default'=>'#FFA500' ] 
// ),
'TwitterShare' => array(
    'Twitter',
    [ 'type'=>'checkbox', 'description'=>'Enable Twitter sharing. The quoted text will be shared by default.', 'default'=>'on' ]),
'FacebookShare' => array(
    'Facebook',
    [ 'type'=>'checkbox', 'description'=>'Enable Facebook sharing.' ]),
'Notes' => array(
    'Notes',
    [ 'type'=>'checkbox', 'description'=>'Allow notes to be saved with the highlights.', 'default'=>'on' ]),

'SvgRenderer' => array(
    'SVG Rendering Mode',
    [ 'type'=>'checkbox', 'description'=>'Enable experimental SVG rendering mode.' ]),

'DebugMode' => array(
    'Debug Mode',
    [ 'type'=>'checkbox', 'description'=>'Enable debug mode.' ]),

// 'CanDoSomething' => array(__('Which user role can do something', 'annotator_plugin'),
//     [ 'options'=> ['Administrator', 'Editor', 'Author', 'Contributor', 'Subscriber', 'Anyone'] ])

        );
    }

   protected function getOptionValueI18nString($optionValue) {
       $i18nValue = parent::getOptionValueI18nString($optionValue);
       return $i18nValue;
   }

    protected function initOptions() {
        $options = $this->getOptionMetaData();
        if (!empty($options)) {
            foreach ($options as $key => $arr) {
                $opt = $arr[1];
                if (!empty($opt['default'])) {
                    $this->addOption($key, $opt['default']);
                }
            }
        }
    }

    public function getPluginDisplayName() {
        return 'Annotator';
    }

    protected function getMainPluginFileName() {
        return 'annotator.php';
    }

    /**
     * See: http://plugin.michael-simpson.com/?page_id=101
     * Called by install() to create any database tables if needed.
     * Best Practice:
     * (1) Prefix all table names with $wpdb->prefix
     * (2) make table names lower case only
     * @return void
     */
    protected function installDatabaseTables() {
               // global $wpdb;
               // $tableName = $this->prefixTableName('mytable');
               // $wpdb->query("CREATE TABLE IF NOT EXISTS `$tableName` (
               //     `id` INTEGER NOT NULL");
    }

    /**
     * See: http://plugin.michael-simpson.com/?page_id=101
     * Drop plugin-created tables on uninstall.
     * @return void
     */
    protected function unInstallDatabaseTables() {
        //        global $wpdb;
        //        $tableName = $this->prefixTableName('mytable');
        //        $wpdb->query("DROP TABLE IF EXISTS `$tableName`");
    }


    /**
     * Perform actions when upgrading from version X to version Y
     * See: http://plugin.michael-simpson.com/?page_id=35
     * @return void
     */
    public function upgrade() {
    }

    public function addActionsAndFilters() {

        // Add options administration page
        // http://plugin.michael-simpson.com/?page_id=47
       add_action('admin_menu', array(&$this, 'addSettingsSubMenuPage'));

        register_meta( 'comment',
            $this->getOptionNamePrefix().'annotation',
            [ 'show_in_rest' => true ]
        );

       wp_register_script( 'annot8-main', plugins_url( '/js/annot8.js', __FILE__ ));
       // wp_enqueue_style( 'wp-color-picker' );

       add_action( 'admin_enqueue_scripts', array(&$this, 'enqueueColorPickerScripts'));

       // add_action('admin_enqueue_scripts', array( $this, 'enqueue_admin_js' ) );

       add_action('wp_footer', array(&$this, 'addAnnot8Script'));

        // Register short codes
        // http://plugin.michael-simpson.com/?page_id=39
       $this->enableAnnotator = false;
       add_shortcode('annotate', array($this, 'enableAnnotatorOnCode'));

        // Register AJAX hooks
        // http://plugin.michael-simpson.com/?page_id=41

        add_action('rest_api_init', function() {

            register_rest_route( 'annotator/v1', '/annotations',
            array(
                array(
                    'methods' => 'GET',
                    'callback' => array( $this, 'getAnnotations')
                ),
                array(
                    'methods' => 'POST',
                    'callback' => array( $this, 'createAnnotation')
                ),
                array(
                    'methods' => 'PUT',
                    'callback' => array( $this, 'updateAnnotation')
                ),
                array(
                    'methods' => 'DELETE',
                    'callback' => array( $this, 'deleteAnnotation')
                )
            ));

        });

    }

    public function getAnnotations( WP_REST_Request $request ) {
        $user = wp_get_current_user();
        $params = $request->get_params();
        if (empty($params['post']))
            return [];

        $controller = new WP_REST_Comments_Controller;
        // $response = $controller->get_item_permissions_check($request);
        // if ($response->errors)
        //     return $response;

        $comments = get_comments([
            'post_id'=>$request['post'],
            'type'=>'annotation',
            'meta_key'=>$this->getOptionNamePrefix().'annotation'
        ]);

        $filtered = [];
        foreach($comments as $comment) {
            if ($comment->comment_approved != "1") {
                if ((string)($user->ID)!=(string)$comment->user_id) {
                    continue;
                }
            }
            $comment->meta = get_comment_meta($comment->comment_ID);
            // $comment->comment_date = strtotime($comment->date);
            $filtered[] = $comment;
        }

        return $filtered;
        // return $controller->get_item($request);
    }

    public function createAnnotation( WP_REST_Request $request ) {
        $user = wp_get_current_user();
        $params = $request->get_params();
        if (empty($params['post']) || empty($user->ID))
            return [ 'error', 'params'=>$params, 'user'=>$user];

        // global $wpdb;
        // $wpdb->query('START TRANSACTION');

        $controller = new WP_REST_Comments_Controller;
        $response = $controller->create_item_permissions_check($request);
        if ($response->errors)
            return $response;

        $response = $controller->create_item($request);

        if ($response->errors)
            return $response;
        
        $comment_id = $response->data['id'];
        $comment_args = [
            'comment_ID' => $comment_id,
            'comment_type' => 'annotation',
        ];
        wp_update_comment($comment_args);
        $comment = get_comment($comment_id);

        add_comment_meta( $comment_id, $this->getOptionNamePrefix().'annotation', $params['annotation']);

        // $wpdb->query('ROLLBACK');
        return $comment;
    }

    public function updateAnnotation( WP_REST_Request $request ) {
        $user = wp_get_current_user();
        $params = $request->get_params();
        if (empty($params['id']) || empty($user->ID))
            return [ 'error', 'params'=>$params, 'user'=>$user];

        // global $wpdb;
        // $wpdb->query('START TRANSACTION');

        $controller = new WP_REST_Comments_Controller;
        $response = $controller->update_item_permissions_check($request);
        if ($response->errors)
            return $response;

        $comment_id = $params['id'];
        $comment_args = [
            'comment_ID' => $comment_id,
            'comment_content' => $params['content'],
        ];
        $response = wp_update_comment($comment_args);

        // $comment1 = get_comment_meta( $comment_id, $this->getOptionNamePrefix().'annotation');

        update_comment_meta( $comment_id, $this->getOptionNamePrefix().'annotation', $params['annotation']);
        // $comment2 = get_comment_meta( $comment_id, $this->getOptionNamePrefix().'annotation');

        // $wpdb->query('ROLLBACK');
        
        return [];
    }

    public function deleteAnnotation( WP_REST_Request $request ) {
        $user = wp_get_current_user();
        $params = $request->get_params();
        if (empty($params['id']) || empty($user->ID))
            return [ 'error', 'params'=>$params, 'user'=>$user];

        // global $wpdb;
        // $wpdb->query('START TRANSACTION');

        $controller = new WP_REST_Comments_Controller;
        $response = $controller->delete_item_permissions_check($request);
        if ($response->errors)
            return $response;

        $comment_id = $params['id'];
        $response = $controller->delete_item($request);
        
        // $wpdb->query('ROLLBACK');

        return $response;
        
    }

    public function enableAnnotatorOnCode() {
        $this->enableAnnotator = true;
    }

    public function addAnnot8Script() {
        global $wp_query; 
        if (!empty($this->getOption('GlobalAnnotation')) && count($wp_query->query)>0)
            $this->enableAnnotator = true;
        if (!$this->enableAnnotator)
            return;

        // $postid = $wp_query->query->ID;
        $docid = 'window.location.href';
        $postid = $wp_query->queried_object_id;
        if (!empty($postid)) {
            $docid = "window.location.hostname + '-doc-{$postid}'";
        } else {
            $postid = 0;
        }

        $user = wp_get_current_user();
        $authorEmail = '';
        if ($user->ID) {
            $authorEmail = $user->user_email;
        }

?>
<div id="annot8-app"></div>
<?php if ($this->getOption('Storage')=='Local Storage') :?>
<script src="<?php echo plugins_url( '/js/localStorage.js', __FILE__ )?>"></script>
<?php else: ?>
<script src="<?php echo plugins_url( '/js/wpStorage.js', __FILE__ )?>"></script>
<?php endif?>
<script>
var annot8Config = {
  authorEmail: '<?php echo $authorEmail; ?>',
  docid: <?php echo $docid; ?>,
  postid: <?php echo $postid; ?>,
  nonce: '<?php echo wp_create_nonce( 'wp_rest' ); ?>',
  selector: ['article .entry-content', '.entry-content'],
  debug: <?php echo (!empty($this->getOption('DebugMode')) ? 'true':'false') ?>,
  svg: <?php echo (!empty($this->getOption('SvgRenderer')) ? 'true':'false') ?>,
  source: {
    create: annot8Create,
    read:   annot8Read,
    update: annot8Update,
    delete: annot8Delete,
  },
  buttons: [
    { action:'annotate',  title:'Highlight', icon:'#si-entypo-brush',     tool: 'create' },
<?php if (!empty($this->getOption('TagSelect'))) :?>
    { action:'tags',      title:'Tag', icon:'#si-awesome-tags',   tool: 'create' },
<?php endif; ?>
    { action:'tags',      title:'Tag', icon:'#si-awesome-tags',   tool: 'tags' },
<?php for($i=1;$i<HIGHLIGHT_COlORS_COUNT;$i++) : ?>    
<?php if (!empty($this->getOption('ColorTag' . $i))) :?>
    { action:'annotate',  title:'Tag', icon:'#si-awesome-tag',    tool: 'tags', tag: 'tag<?php echo $i?>' },
<?php endif;?>
<?php endfor;?>
<?php if (!empty($this->getOption('TagSelect'))) :?>
    { action:'tags',      title:'Tag',       icon:'#si-awesome-tags',     tool: 'edit' },
<?php endif;?>
<?php if (!empty($this->getOption('TwitterShare'))) :?>
    { action:annot8Tweet, title:'Tweet',     icon:'#si-awesome-twitter',  tool: 'edit' },
<?php endif; ?>
<?php if (!empty($this->getOption('FacebookShare'))) :?>
    { action:annot8FB,    title:'Facebook',  icon:'#si-awesome-facebook', tool: 'edit' },
<?php endif; ?>
<?php if (!empty($this->getOption('Notes'))) :?>
    { action:'comment',   title:'Comment',   icon:'#si-awesome-comment',  tool: 'edit' },
<?php endif; ?>
    { action:'erase',     title:'Erase',     icon:'#si-bootstrap-erase',  tool: 'edit' }
  ]
};
</script>
<style>
<?php for($i=1;$i<HIGHLIGHT_COlORS_COUNT;$i++) : $color = $this->getOption('ColorTag' . $i); ?>    
<?php if (!empty($color)) :?>
.annot8-toolbar-button[data-tag='tag<?php echo $i;?>']
.annot8-toolbar-icon,
.annot8-tag-tag<?php echo $i;?>
  { color: <?php echo $color;?>; fill: <?php echo $color;?>;}
.annot8-hl-tag<?php echo $i;?>
  { background-color: <?php echo $color;?> }
.annot8-hl-tag<?php echo $i;?>
  { fill: <?php echo $color;?> }
<?php endif;?>
<?php endfor;?>
</style>
<?php

        wp_print_scripts('annot8-main');
    }


    public function enqueueColorPickerScripts( $hook_suffix ) {
        wp_enqueue_style( 'wp-color-picker' );
        wp_enqueue_script( 'wp-color-picker');
        wp_enqueue_script( 'wp-color-picker-script-handle', plugins_url('wp-color-picker-script.js', __FILE__ ), array( 'wp-color-picker' ), false, true );
    }

}
