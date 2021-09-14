const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const MUSIC_PLAYER_KEY = "LMT-MUSIC"


const app = {
    isPlaying: false,
    currentIndex: 0,
    audio: $('#audio'),
    btn_play: $('#control-play'),
    btn_next: $('#control-next'),
    btn_prev: $('#control-prev'),
    btn_random: $('#control-mix'),
    btn_repeat: $('#control-loop'),
    isRewind: false,
    isRandom: false,
    isRepeat: false,
    configs: JSON.parse(localStorage.getItem(MUSIC_PLAYER_KEY)) || {
        isRepeat: false,
        isRandom: false 
    },
    setConfig: function(key, value){
        this.configs[key] = value;
        localStorage.setItem(MUSIC_PLAYER_KEY, JSON.stringify(this.configs));
    },
    loadConfigs: function(){
        this.isRandom = this.configs.isRandom;
        this.isRepeat = this.configs.isRepeat;
        this.btn_random.classList.toggle("active", this.isRandom);
        this.btn_repeat.classList.toggle("active", this.isRepeat);
    },
    songs: [
        {
            name: 'The fading story',
            singer: 'Mihoyo',
            audio: 'assets/song/song2.mp3',
            img: 'assets/song/poster2.png',
        },
        {
            name: 'Muộn rồi sao mà còn',
            singer: 'Sơn Tùng Mtp',
            audio: 'assets/song/song1.mp3',
            img: 'assets/song/poster1.png',
        },
        {
            name: 'Moonlike smile',
            singer: 'Mihoyo',
            audio: 'assets/song/song3.mp3',
            img: 'assets/song/poster3.png',
        },
        {
            name: 'Caelestinum Finale Termini',
            singer: 'Mihoyo',
            audio: 'assets/song/song4.mp3',
            img: 'assets/song/poster4.png',
        },
        {
            name: 'Snow-Buried Tales',
            singer: 'Mihoyo',
            audio: 'assets/song/song5.mp3',
            img: 'assets/song/poster5.png',
        },
    ],

    //Dinh nghia thuoc tinh
    defineProperties: function(){
        Object.defineProperty(this, "currentSong",{
            get: function(){
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvent: function(){
        let _this = this;
        //Pause/Resume
        this.btn_play.onclick = function(){
            _this.isPlaying = !_this.isPlaying;
            if(_this.isPlaying === true){
                _this.resumeMusic();
            }
            else{
                _this.pauseMusic();
            }
        }

        //Hien thi tien trinh bai hat
        this.audio.ontimeupdate = function(){
            if(_this.audio.duration){
                //Thoi gian hien tai
                let passed_minute = Math.floor(_this.audio.currentTime / 60);
                let passed_second = Math.floor(_this.audio.currentTime % 60);
                passed_minute = passed_minute < 10 ? '0' + passed_minute : passed_minute;
                passed_second = passed_second < 10 ? '0' + passed_second : passed_second;
                $('#passed').innerHTML = passed_minute + ":" +passed_second;

                //Thoi gian con lai
                let remain_time = Math.floor(_this.audio.duration) - Math.floor(_this.audio.currentTime);
                let remain_minute = Math.floor(remain_time / 60);
                let remain_second = Math.floor(remain_time % 60);
                remain_minute = remain_minute < 10 ? '0' + remain_minute : remain_minute;
                remain_second = remain_second < 10 ? '0' + remain_second : remain_second;
                $('#remain').innerHTML = remain_minute + ":" +remain_second;

                //Cap nhat thanh tien trinh
                if(!_this.isRewind){
                    $('#process').value = _this.audio.currentTime / _this.audio.duration * 100;
                }
                
            }
        }

        //Tua bai hat
        $('#process').onchange = function(){
            _this.audio.currentTime = $('#process').value * _this.audio.duration / 100;
        }

        //Khi tua thi ngung timeupdate
        $('#process').onmousedown = function(){
            _this.isRewind = true;
        }
        $('#process').onmouseup = function(){
            _this.isRewind = false;
        }

        //Next
        this.btn_next.onclick = function(){
            $('#process').value = 0;
            _this.resumeMusic();
            _this.nextSong();
            _this.audio.play();
        }

        //Prev
        this.btn_prev.onclick = function(){
            _this.resumeMusic();
            _this.prevSong();
            _this.audio.play();
        }

        //Mix song
        this.btn_random.onclick = function(){
            _this.isRandom = !_this.isRandom;
            this.classList.toggle("active", _this.isRandom);
            _this.setConfig("isRandom", _this.isRandom);
        }

        //Click repeat
        this.btn_repeat.onclick = function(){
            _this.isRepeat = !_this.isRepeat;
            this.classList.toggle('active', _this.isRepeat);   
            _this.setConfig("isRepeat", _this.isRepeat);
        }

        //Click chon bai hat
        $('#footer').onclick = function(e){
            let songNode = e.target.closest('.song:not(.active)')
            if(songNode){
                _this.currentIndex = songNode.dataset.index;
                _this.loadCurrentSong();
                _this.audio.play();
            }
        }       

        //Xu ly khi het bai hat
        this.audio.onended = function(){
            if(_this.isRepeat){
                audio.play();
            }
            else{
                _this.btn_next.click();
            }
        }
    },


    //NextSong
    nextSong: function(){
        if(this.isRandom){
            let newIndex;
            do{
                newIndex = Math.floor(Math.random() * this.songs.length);
            }
            while(newIndex === this.currentIndex);
            this.currentIndex = newIndex;
        }
        else{
            this.currentIndex ++;
            if(this.currentIndex >= this.songs.length) this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },

    //PrevSong
    prevSong: function(){
        if(this.isRandom){
            let newIndex;
            do{
                newIndex = Math.floor(Math.random() * this.songs.length);
            }
            while(newIndex === this.currentIndex);
            this.currentIndex = newIndex;
        }
        else{
            this.currentIndex --;
            if(this.currentIndex < 0) this.currentIndex = this.songs.length -1;
        }
        this.loadCurrentSong();
    },

    //Pause
    pauseMusic: function(){
        this.isPlaying = false;
        $('#dics-img').style.animationPlayState = "paused";
        this.btn_play.classList.toggle("paused", !this.isPlaying);
        this.btn_play.classList.toggle("resumed", this.isPlaying);
        this.audio.pause();
    },
    //Resume
    resumeMusic: function(){
        this.isPlaying = true;
        $('#dics-img').style.animationPlayState = "running";
        this.btn_play.classList.toggle("resumed", this.isPlaying);
        this.btn_play.classList.toggle("paused", !this.isPlaying);
        this.audio.play();
    },
    

    //Hien thi bai hat
    renderSong: function(){
        let html = this.songs.map((song,index) =>{
            return `
            <div class="song" data-index="${index}">
                <div class="song-img">
                    <img src="${song.img}" alt="" class="song-small-poster">
                </div>
                <div class="song-info">
                    <p class="song-name">${song.name}</p>
                    <p class="song-singer">${song.singer}</p>
                </div>
                <div class="song-option">
                    <img src="assets/icon/icon-option.png" alt="">
                </div>
            </div>
            `
        })
        $('#footer').innerHTML = html.join('\n');
    },


    //Hien thi bai hat hien tai
    loadCurrentSong: function(){
        $('#song-name').innerHTML = this.currentSong.name;
        $('#dics-img').src = this.currentSong.img;
        this.audio.src = this.currentSong.audio;
        $$('.song').forEach(song => {
            song.classList.toggle('active', false);
        });
        document.getElementsByClassName('song')[this.currentIndex].classList.add('active');
        this.scrollSongToView();
    },

    //Keo bai hat len view de nhin thay duoc
    scrollSongToView: function(){
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })
    },



    start: function(){
        this.loadConfigs();
        this.defineProperties();
        this.renderSong();
        this.handleEvent();
        this.loadCurrentSong();
        
    }
}

app.start();
