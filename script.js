//#1
 //import AgoraRTC from "agora-rtc-sdk-ng";

let client = AgoraRTC.createClient({mode:'rtc', codec:"vp8"})

//#2
let config = {
    appid:'ed18d2e1c06b4db2ac9d69a47aa0a774',
    token:'007eJxTYLh48KvFp5BV9SlCuyd1G7zIk5z4KOLoZf4rjVtvXvnzf5eKAkNqiqFFilGqYbKBWZJJSpJRYrJlipllool5YqJBorm5SXX0h/SGQEaGmhsnGBihEMTnYvDJLEsNLilKTcxlYAAAe9wmmw==',
    uid:null,
    channel:'LiveStream',
}

//#3 - Setting tracks for when user joins
let localTracks = {
    audioTrack:null,
    videoTrack:null
}

//#4 - Want to hold state for users audio and video so user can mute and hide
let localTrackState = {
    audioTrackMuted:false,
    videoTrackMuted:false
}

//#5 - Set remote tracks to store other users
let remoteTracks = {}


document.getElementById('join-btn').addEventListener('click', async () => {
    config.uid = document.getElementById('username').value
    await joinStreams()
    document.getElementById('join-wrapper').style.display = 'none'
    document.getElementById('footer').style.display = 'flex'
})

document.getElementById('mic-btn').addEventListener('click', async () => {
    //Check if what the state of muted currently is
    //Disable button
    if(!localTrackState.audioTrackMuted){
        //Mute your audio
        await localTracks.audioTrack.setMuted(true);
        localTrackState.audioTrackMuted = true
        document.getElementById('mic-btn').style.backgroundColor ='rgb(255, 80, 80, 0.7)'
    }else{
        await localTracks.audioTrack.setMuted(false)
        localTrackState.audioTrackMuted = false
        document.getElementById('mic-btn').style.backgroundColor ='#1f1f1f8e'

    }

})



let screenTrack = null;
let isSharingScreen = false;
let wasCameraEnabledBeforeShare = false;  // تتبع حالة الكاميرا قبل بدء المشاركة

document.getElementById('share-btn').addEventListener('click', async () => {
    if (!isSharingScreen) {
        try {
            // التحقق من حالة الكاميرا قبل بدء مشاركة الشاشة
            if (localTracks.videoTrack && !localTrackState.videoTrackMuted) {
                wasCameraEnabledBeforeShare = true; // الكاميرا كانت مفعلة
            } else {
                wasCameraEnabledBeforeShare = false; // الكاميرا كانت مغلقة
            }

            // إيقاف الكاميرا قبل بدء مشاركة الشاشة
            if (localTracks.videoTrack) {
                await client.unpublish(localTracks.videoTrack);
                localTracks.videoTrack.stop();
                localTracks.videoTrack.close();
                localTracks.videoTrack = null;
            }

            // الحصول على إذن مشاركة الشاشة
            screenTrack = await AgoraRTC.createScreenVideoTrack();

            // التأكد من الأذونات
            if (!screenTrack) {
                alert("لم تتمكن من الحصول على إذن لمشاركة الشاشة.");
                return;
            }

            // نشر مسار الشاشة
            await client.publish(screenTrack);

            // التأكد من وجود عنصر الفيديو
            let existingPlayer = document.getElementById(`video-wrapper-${config.uid}`);
            if (!existingPlayer) {
                let player = `<div class="video-containers" id="video-wrapper-${config.uid}">
                    <p class="user-uid">${config.uid}</p>
                    <div class="video-player player" id="stream-${config.uid}"></div>
                </div>`;
                document.getElementById('user-streams').insertAdjacentHTML('beforeend', player);
            }

            let videoElement = document.getElementById(`stream-${config.uid}`);
            if (videoElement) {
                screenTrack.play(`stream-${config.uid}`);
            } else {
                console.error("العنصر غير موجود لعرض الفيديو.");
            }

            isSharingScreen = true;
            // تغيير لون الزر عند تفعيل المشاركة
            document.getElementById('share-btn').style.backgroundColor = 'rgb(80, 150, 255, 0.7)';
        } catch (err) {
            console.error('فشل في مشاركة الشاشة:', err);
            alert("تأكد من أنك قد منحت الأذونات في المتصفح أو أنك تستخدم متصفحًا مدعومًا.");
        }
    } else {
        // إذا كان المستخدم قد بدأ بالفعل في مشاركة الشاشة، قم بإيقافها
        await client.unpublish(screenTrack);
        screenTrack.stop();
        screenTrack.close();
        document.getElementById(`video-wrapper-${config.uid}`).remove();

        // إذا كانت الكاميرا كانت مفعلة قبل مشاركة الشاشة، نقوم بإعادتها
        if (wasCameraEnabledBeforeShare) {
            try {
                if (!localTracks.videoTrack) {
                    localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
                    await client.publish(localTracks.videoTrack);

                    // التأكد إذا كان العنصر موجودًا مسبقًا
                    let existingPlayer = document.getElementById(`video-wrapper-${config.uid}`);
                    if (!existingPlayer) {
                        let player = `<div class="video-containers" id="video-wrapper-${config.uid}">
                            <p class="user-uid">${config.uid}</p>
                            <div class="video-player player" id="stream-${config.uid}"></div>
                        </div>`;
                        document.getElementById('user-streams').insertAdjacentHTML('beforeend', player);
                    }
                    localTracks.videoTrack.play(`stream-${config.uid}`);
                }
            } catch (error) {
                console.error("فشل في إعادة تفعيل الكاميرا:", error);
            }
        }

        isSharingScreen = false;
        // إعادة لون الزر إلى اللون الأصلي
        document.getElementById('share-btn').style.backgroundColor = '#1f1f1f8e';
    }
});

document.getElementById('camera-btn').addEventListener('click', async () => {
    // إذا كانت الكاميرا غير مفعلّة
    if (!localTracks.videoTrack) {
        try {
            localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();
            await client.publish(localTracks.videoTrack);

            // التأكد إذا كان العنصر موجودًا مسبقًا
            let existingPlayer = document.getElementById(`video-wrapper-${config.uid}`);
            if (!existingPlayer) {
                // إضافة العنصر فقط إذا لم يكن موجودًا
                let player = `<div class="video-containers" id="video-wrapper-${config.uid}">
                    <p class="user-uid">${config.uid}</p>
                    <div class="video-player player" id="stream-${config.uid}"></div>
                </div>`;
                document.getElementById('user-streams').insertAdjacentHTML('beforeend', player);
            }
            localTracks.videoTrack.play(`stream-${config.uid}`);

            // تغيير لون الزر عند تفعيل الكاميرا
            document.getElementById('camera-btn').style.backgroundColor = '#1f1f1f8e';
        } catch (error) {
            console.error("فشل في تفعيل الكاميرا:", error);
        }
    } else {
        // إذا كانت الكاميرا مفعلّة مسبقًا، نقوم بإيقافها
        await client.unpublish(localTracks.videoTrack);
        localTracks.videoTrack.stop();
        localTracks.videoTrack.close();
        localTracks.videoTrack = null;

        // إزالة العنصر إذا تم إيقاف الكاميرا
        document.getElementById(`video-wrapper-${config.uid}`).remove();

        // تغيير لون الزر عند إيقاف الكاميرا
        document.getElementById('camera-btn').style.backgroundColor = 'rgb(255, 80, 80, 0.7)';
    }
});







// document.getElementById('camera-btn').addEventListener('click', async () => {
//     // التحقق إذا كان الفيديو غير مفعل
//     if (!localTrackState.videoTrackMuted) {
//         // تعطيل الفيديو
//         await localTracks.videoTrack.setMuted(true);
//         localTrackState.videoTrackMuted = true;
//         document.getElementById('camera-btn').style.backgroundColor = 'rgb(255, 80, 80, 0.7)';
//     } else {
//         await localTracks.videoTrack.setMuted(false);
//         localTrackState.videoTrackMuted = false;
//         document.getElementById('camera-btn').style.backgroundColor = '#1f1f1f8e';
//     }
// });





document.getElementById('leave-btn').addEventListener('click', async () => {
    //Loop threw local tracks and stop them so unpublish event gets triggered, then set to undefined
    //Hide footer
    for (trackName in localTracks){
        let track = localTracks[trackName]
        if(track){
            track.stop()
            track.close()
            localTracks[trackName] = null
        }
    }

    //Leave the channel
    await client.leave()
    document.getElementById('footer').style.display = 'none'
    document.getElementById('user-streams').innerHTML = ''
    document.getElementById('join-wrapper').style.display = 'block'

})




//Method will take all my info and set user stream in frame
let joinStreams = async () => {
    //Is this place hear strategicly or can I add to end of method?
    
    client.on("user-published", handleUserJoined);
    client.on("user-left", handleUserLeft);


    client.enableAudioVolumeIndicator(); // Triggers the "volume-indicator" callback event every two seconds.
    client.on("volume-indicator", function(evt) {
        for (let i = 0; evt.length > i; i++) {
            let speaker = evt[i].uid;
            let volume = evt[i].level;
            let volumeIcon = document.getElementById(`volume-${speaker}`);
    
            if (volumeIcon) { 
                if (volume > 0) {
                    volumeIcon.src = './assets/volume-on.svg';
                } else {
                    volumeIcon.src = './assets/volume-off.svg';
                }
            }
        }
    });
    

    //#6 - Set and get back tracks for local user
    [config.uid, localTracks.audioTrack, localTracks.videoTrack] = await  Promise.all([
        client.join(config.appid, config.channel, config.token ||null, config.uid ||null),
        AgoraRTC.createMicrophoneAudioTrack(),
        AgoraRTC.createCameraVideoTrack()

    ])
    
    //#7 - Create player and add it to player list
    let player = `<div class="video-containers" id="video-wrapper-${config.uid}">
                        <p class="user-uid"><img class="volume-icon" id="volume-${config.uid}" src="./assets/volume-on.svg" /> ${config.uid}</p>
                        <div class="video-player player" id="stream-${config.uid}"></div>
                </div>`

    document.getElementById('user-streams').insertAdjacentHTML('beforeend', player);
    //#8 - Player user stream in div
    localTracks.videoTrack.play(`stream-${config.uid}`)
    

    //#9 Add user to user list of names/ids

    //#10 - Publish my local video tracks to entire channel so everyone can see it
    await client.publish([localTracks.audioTrack, localTracks.videoTrack])

}


let handleUserJoined = async (user, mediaType) => {
    console.log('Handle user joined')

    //#11 - Add user to list of remote users
    remoteTracks[user.uid] = user

    //#12 Subscribe ro remote users
    await client.subscribe(user, mediaType)
   
    
    if (mediaType === 'video'){
        let player = document.getElementById(`video-wrapper-${user.uid}`)
        console.log('player:', player)
        if (player != null){
            player.remove()
        }
 
        player = `<div class="video-containers" id="video-wrapper-${user.uid}">
                        <p class="user-uid"><img class="volume-icon" id="volume-${user.uid}" src="./assets/volume-on.svg" /> ${user.uid}</p>
                        <div  class="video-player player" id="stream-${user.uid}"></div>
                      </div>`
        document.getElementById('user-streams').insertAdjacentHTML('beforeend', player);
         user.videoTrack.play(`stream-${user.uid}`)

        

          
    }
    

    if (mediaType === 'audio') {
        user.audioTrack.play();
      }
}


let handleUserLeft = (user) => {
    console.log('Handle user left!')
    //Remove from remote users and remove users video wrapper
    delete remoteTracks[user.uid]
    document.getElementById(`video-wrapper-${user.uid}`).remove()
}

