/**
* Created by Matan on 06/06/2016.
*/

//modal functionality
$('#show-modal').on('click', function(){
    $('.modal').addClass('modal-shown').fadeIn(400);
    $('.album').animate({"top":"150px"}, 500);
});

$('.overlay').on('click', function(){
    $('.modal').fadeOut(400);
    $('.album').animate({"top":"-400px"}, 500);
    $('.songs').animate({"top":"-400px"}, 500);
});

$('#add-album').on('click', function(){
    $('.album').animate({"top":"-400px"}, 500);
    $('.songs').animate({"top":"150px"}, 500);
});

$('#save-album').on('click', function(){
    $('.modal').fadeOut(400);
    $('.modal-form').animate({"top":"-400px"}, 500);
    $('.no-albums').css({"display":"none"});

});

$('#more-songs').on('click', function(){
    var songInput = $('<p>',{
        class:'song-input',
        placeholder: 'Song Name'
    });
    var songName = $('<input>',{
        type: 'text',
        class:'song-name',
        placeholder: 'Song Name'
    });
    var songUrl = $('<input>',{
        type: 'text',
        class:'song-url',
        placeholder: 'Song URL'
    });
    var songInputTitle = $('<span>',{
        class:'modal-mini-title',
        text: 'Song Name & URL:'
    });
    
    songInput.append(songName);
    songInput.append(songUrl);
    $('.songs-url-container').append(songInputTitle);
    $('.songs-url-container').append(songInput);
   
});

// modal functionality

//player-------------------------------------

$('.arrow').on('click', function(){
    $('#player').animate({"top":"-450px"}, 500);
    $('.albums-container').animate({"top":"-390px"}, 500);
});

//player-------------------------------------

$('#image-url').on('input', function(){
    var image = $("<img>",{
        src: $(this).val(),
        alt:"mini"
    });
    $('.album>form').append(image);
});

//main?

var albumsObjArray = [];

$('#save-album').on('click', function(){

    var playlist = [];

   $('.song-input').each(function(){
       var song = {};
       song.name =  $(".song-name", this).val();
       song.path =  $(".song-url", this).val();
       playlist.push(song);
   });

   var dataToSend = {
       album: {
           name: $('#album-name').val(),
           artist: $('#artist-name').val(),
           image: $('#image-url').val()
       },
       playlist: playlist
   };

    //albumsObjArray.push(album);
   // console.log(album);

    createAlbum(dataToSend);
    $('.album-style').fadeIn(1400).css({'display':'inline-block'});
});


//ajax requests---------------------------------------------------------------
var albumsUrl = "http://morad.rocks/player/api/albums";

function getAlbums(){
    $.ajax({
        url: albumsUrl,
        method:"GET",
        dataType:"json"
    }).done(function(album){
        albumsObjArray = JSON.parse(album);

        var flag = false;
        for(i = albumsObjArray.length - 1 ; i >=0; i--){

            if(i == 0){

                drawAlbum(null, albumsObjArray[i], true);
            }else {
                drawAlbum(null, albumsObjArray[i], false);
            }
        }

        console.log(albumsObjArray);
    });
}
$(document).ready(function(){
    getAlbums();

});

function createAlbum(data){
    $.ajax({
        url: "http://morad.rocks/player/api/album",
        method: "POST",
        data: JSON.stringify(data),
    }).done(function(res){
        var newAlbumId = res;
        drawAlbum(newAlbumId, data.album);
        var newDataAlbum = {
            album_image : data.album.image,
            album_name : data.album.name,
            album_artist : data.album.artist,
            album_id : newAlbumId
        };
        albumsObjArray.push(newDataAlbum);
        console.log(albumsObjArray);
    });
}

function getSpecificAlbum(id) {
    $.ajax({
        url: "http://morad.rocks/player/api/album/" + id,
        method:"GET",
        dataType:"json"
    }).done(function(data){
        console.log(data);
        updatePlayer(id, data.playlist);
    });
}

//ajax requests------------------------------------------------------------

//drawing an album on the DOM
function drawAlbum(id, album, flag){

   // console.log(id, album);
    var image = (album.album_image !== undefined) ? album.album_image : album.image;
    var name = (album.album_name !== undefined) ? album.album_name : album.name;
    var artist = (album.album_artist !== undefined) ? album.album_artist : album.artist;
    var id = (album.album_id !== undefined) ? album.album_id : id;

    var albumDiv = $('<div>',{
        class:'album-style',
        tabindex:"0",
    });
    var albumImage = $('<img>',{
        src:image
    });
    var play = $('<i>',{
        class:'fa fa-play playstyle'
    });
    var albumTitle = $('<span>',{
        class:'album-title',
        text: artist + " - " + name
    });
    albumDiv.append(albumTitle);
    albumDiv.append(albumImage);
    albumDiv.append(play);
    $('.albums-container').append(albumDiv);
    albumDiv.attr("data-albumId", id);

    $('.album-style').css({'display':'inline-block'});
    $('.album-title').arctext({radius: 150});

    if(flag){
        $('.no-albums').css({"display":"none"});
    }
}

//clicking on an album on page
$(document).on('click', '.album-style', function(){
    var albumId = $(this).attr("data-albumId");
    console.log(albumId);
    $('#player').animate({"top":"0"}, 500);
    $('.albums-container').animate({"top":"0"}, 500);

    getSpecificAlbum(albumId);
});

//player functionality
function updatePlayer(albumId, playlist){

    $(".songs-container").remove();

    var songsContainer = $('<div>',{
        class:"songs-container"
    });
    $("#player").append(songsContainer);
    songsContainer.append("<ol>");

    //var id = (currentAlbum.album_id !== undefined) ? currentAlbum.album_id : id;

    var currentAlbum;
    for(var i=0; i < albumsObjArray.length; i++) {
        if (albumId == albumsObjArray[i].album_id) {
            currentAlbum = albumsObjArray[i];
        }
    }

    var player = $("#player");
    $("img", player).attr("src", currentAlbum.album_image);
    $(".player-album-title").text(currentAlbum.album_artist + " - " + currentAlbum.album_name);

    for(var i=0; i < playlist.length; i++){
        var song = $('<li>',{
            class:"song",
            text: playlist[i].name
        });

        song.attr("data-songData", playlist[i].path),
        $(".songs-container > ol").append(song);
    }
}

$(document).on('click', '.song', function(){
    var songData = $(this).attr("data-songData");
    $('#player audio').attr("src", songData);
});

//player ?
$("#player audio").on('click', function(){
    if($(this).paused == false){
        $("#player img").addClass("spinner");
    } else{
        $("#player img").removeClass("spinner");
    }
})






















