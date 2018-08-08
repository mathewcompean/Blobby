//------------------------------------
// release dates
//------------------------------------

var oCONFIG = {
  game_id: "ht3_blobby_1",
  language_file :"language/en-us.xml",
  debug_trace: true,
  debug_panel: false ,
  debug_stats: false,
  browser_alert: "browser_alert/",
  splash_hold: 2,
  health_range: [0, .005, 1], //slide per frame [<--repair --><-- sicker -->]
  repair_rate: 0.025,
  sick_rate: 0.007

}


// The date string must be formatted as shown. These is used as date cuttoffs and is not displayed in the program.
var date_playing = "July 13, 2018";
var date_day_before = "July 12, 2018";
var date_week_before = "July 09, 2018";

var game_sequence = [
  {amt: 0.1, speed:0.005},
  {amt: -0.2, speed:0.005},
  {amt: 0.4, speed:0.005},
  {amt: -0.1, speed:0.005},
  {amt: 0.1, speed:0.005},
  {amt: -0.6, speed:0.005},
  {amt: 0.2, speed:0.005},
  {amt: 0.6, speed:0.005},
  {amt: 0.1, speed:0.01},
  {amt: -0.2, speed:0.01},
  {amt: 0.4, speed:0.005},
  {amt: -0.3, speed:0.01},
  {amt: 0.4, speed:0.01},
  {amt: -0.6, speed:0.01},
  {amt: 0.6, speed:0.005},
  {amt: 0.1, speed:0.005}
];

//assets to be processed for threejs
var assets_threejs = {
  loaded: false,
  progress: 0,
  manifest: [
    {src:"media/models/deck.json", name:"deck", type:"static"},
    {src:"media/models/blobby.json", name:"blobby", type:"animated_json"},
    {src:"media/models/blobby_jr.json", name:"blobby_jr", type:"animated_json"},
    {src:"media/models/sky.jpg", name:"sky", type:"texture"},
    {src:"media/models/particle_water.png", name:"particle_water", type:"texture"},
    {src:"media/score_digits.png", name:"score_digits", type:"texture"},
    
    {src:"media/models/Blobby_tex_green.png", name:"blobby_green", type:"texture"},
    {src:"media/models/Blobby_tex_yellow.png", name:"blobby_orange", type:"texture"},
    {src:"media/models/Blobby_tex_purple.png", name:"blobby_purple", type:"texture"}
  ]
};


//assets needed before title screen
var assets_preload = {
  loaded: false,
  progress: 0,
  manifest: [
    {src:"media/fonts/MontserratBold.woff", id:"MontserratBold"},
    {src:"media/fonts/MontserratRegular.woff", id:"MontserratRegular"},
    {src:"media/fonts/MouseMemoirs-Regular.woff", id:"MouseMemoirs-Regular"},

    {src:"media/logo_en.png", id:"logo_en"},
    
    {src:"media/bg_title.jpg", id:"bg_title"},
    {src:"media/blobby_title.png", id:"blobby_title"},
    {src:"media/b_fullscreen_off.svg", id:"b_fullscreen_off"},
    {src:"media/b_fullscreen_on.svg", id:"b_fullscreen_on"},
    {src:"media/b_pause.svg", id:"b_pause"},
    {src:"media/b_sound_off.svg", id:"b_sound_off"},
    {src:"media/b_sound_on.svg", id:"b_sound_on"},
    {src:"media/b_fullscreen_off_over.svg", id:"b_fullscreen_off_over"},
    {src:"media/b_fullscreen_on_over.svg", id:"b_fullscreen_on_over"},
    {src:"media/b_pause_over.svg", id:"b_pause_over"},
    {src:"media/b_sound_off_over.svg", id:"b_sound_off_over"},
    {src:"media/b_sound_on_over.svg", id:"b_sound_on_over"},

    {src:"media/sounds/music_title_loop.mp3", id:"music_title_loop"},
    {src:"media/sounds/snd_click.mp3", id:"snd_click"}

  
  ]
};


//assets needed before gameplay
var assets_additional = {
  loaded: false,
  progress: 0,
  manifest: [
   
    {src:"media/blobby_recap.png", id:"blobby_recap"},
    {src:"media/game_buttons.png", id:"game_buttons"},

    {src:"media/sounds/music_game_in.mp3", id:"music_game_in"},
    {src:"media/sounds/music_game_loop.mp3", id:"music_game_loop"},
    {src:"media/sounds/music_game_end.mp3", id:"music_game_end"},
    {src:"media/sounds/sfx_barf.mp3", id:"sfx_barf"},
    {src:"media/sounds/sfx_splash.mp3", id:"sfx_splash"},
    {src:"media/sounds/Blobby_Papa.mp3", id:"sfx_papa"}
  ]
};




var main_site_url = "http://www.hotelt3.com/";

var legal_images = [
  {src: "media/sonylogo.png", alt:"Sony Pictures"},
  {src: "media/SonyAnimation.png", alt:"Sony Pictures Animation"}
  
];

var legal_links = [
  {msg: "legal_childrens_privacy", link:"http://www.sonypictures.com/corp/childrensprivacy.html", after:" | "},
  {msg: "legal_privacy", link:"http://www.sonypictures.com/corp/privacy.html", after:" | "},
  {msg: "legal_adchoices", link:"http://www.sonypictures.com/corp/privacy.html#choices", after:" | "},
  {msg: "legal_terms", link:"http://www.sonypictures.com/corp/tos.html", after:" | "},
  {msg: "legal_cal_privacy", link:"http://www.sonypictures.com/corp/privacy.html#privacy-rights", after:"<br>"},
  {msg: "legal_copyright", link:null, after:null}
];
