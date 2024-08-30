let pc1;
let pc2;

const audio_elem = document.getElementById("sgs_audio_elem");

const ICE_SERVER_CONFIG = {
    iceServers: [
      {
        urls: "stun:13.127.198.179:443",  // ZVP
      },
      { 
        urls: "stun:stun.l.google.com:19302"  // Google
      },
    ],
};

async function connect(){
    console.log('[SGS_DEBUG] Start WebRTC')
    pc1 = new RTCPeerConnection(ICE_SERVER_CONFIG);
    pc2 = new RTCPeerConnection(ICE_SERVER_CONFIG);
    pc1.id  = 'sg_1';
    pc2.id  = 'sg_2';
    pc1.onicecandidate = async (e)=> {
        let c = e.candidate
        if(c === null)
        {
            return;
        }
        console.log('[SGS_DEBUG] ICE 1 ', c)
        await pc2.addIceCandidate(c)
    }
    pc2.onicecandidate = async (e)=>{
        let c = e.candidate
        if(c === null)
        {
            return;
        }
        console.log('[SGS_DEBUG] ICE 2 ', c)
        await pc1.addIceCandidate(c)
    }
    pc2.ontrack = (e) =>{
        console.log('[SGS_DEBUG] TRACK RECEIVED ', e.track);
        let stream = new MediaStream()
        stream.addTrack(e.track)
        audio_elem.srcObject = stream;
        audio_elem.play();
    }
    let media_stream = await navigator.mediaDevices.getUserMedia({'audio' : true});
    console.log('[SGS_DEBUG] Got Media Stream ')
    let track = media_stream.getAudioTracks()[0];
    pc1.addTrack(track);
    console.log('[SGS_DEBUG] Audio track set ')
    let offer = await pc1.createOffer({offerToReceiveAudio : false});
    console.log('[SGS_DEBUG] OFFER CREATED ', offer)
    await pc1.setLocalDescription(offer);
    await pc2.setRemoteDescription(offer);
    let answer = await pc2.createAnswer();
    pc2.setLocalDescription(answer);
    console.log('[SGS_DEBUG] ANSWER CREATED ', answer)
    pc1.setRemoteDescription(answer);
}

async function disconnect(){
    await pc1.close()
    await pc2.close()
    console.log('[SGS_DEBUG] TERMINATE WEBRTC CONNECTION')
}